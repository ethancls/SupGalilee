import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";

// POST /api/invitations/[token]/accept - Accept an invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to accept an invitation" },
        { status: 401 }
      );
    }

    const { token } = await params;

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 410 }
      );
    }

    // Check if already accepted or revoked
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: `This invitation has already been ${invitation.status.toLowerCase()}` },
        { status: 410 }
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invitation.organizationId,
          userId: user.id,
        },
      },
    });

    if (existingMembership) {
      // Update invitation status but don't create duplicate membership
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      return NextResponse.json({
        message: "You are already a member of this organization",
        organization: invitation.organization,
      });
    }

    // Accept invitation and create membership in a transaction
    await prisma.$transaction([
      // Update invitation status
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      }),
      // Create organization membership
      prisma.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId: user.id,
          role: invitation.role as "OWNER" | "ADMIN" | "MEMBER" | "VIEWER",
        },
      }),
    ]);

    return NextResponse.json({
      message: "Successfully joined the organization",
      organization: invitation.organization,
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
