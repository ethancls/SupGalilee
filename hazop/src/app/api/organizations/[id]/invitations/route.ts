import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import crypto from "crypto";
import { sendInvitationEmail } from "@/lib/email";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check user is admin or owner
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: id, userId: user.id },
      },
    });

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invitations = await prisma.invitation.findMany({
      where: { organizationId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check user is admin or owner
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: id, userId: user.id },
      },
    });

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, role = "MEMBER" } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const existingMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: { organizationId: id, userId: existingUser.id },
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: "User is already a member of this organization" },
          { status: 400 }
        );
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        organizationId: id,
        email,
        status: "PENDING",
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");

    // Create invitation (expires in 7 days)
    const invitation = await prisma.invitation.create({
      data: {
        organizationId: id,
        email,
        role,
        token,
        invitedById: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Get organization name for the email
    const organization = await prisma.organization.findUnique({
      where: { id },
      select: { name: true },
    });

    // Send invitation email
    const inviterName = user.name || user.email || "Someone";
    const emailResult = await sendInvitationEmail(
      email,
      token,
      organization?.name || "Organization",
      inviterName
    );

    if (!emailResult.success) {
      console.error("Failed to send invitation email:", emailResult.error);
      // Don't fail the request, invitation is still created
    }

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
