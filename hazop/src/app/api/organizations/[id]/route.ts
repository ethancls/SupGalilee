import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";

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

    // Check user is a member
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: id, userId: user.id },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        settings: true,
        _count: {
          select: { members: true, projects: true, teams: true },
        },
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check user is owner or admin
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: id, userId: user.id },
      },
    });

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, description, settings } = await request.json();

    // Note: slug is immutable after creation - it cannot be changed
    // This ensures URL stability for bookmarks, links, and integrations

    // Update organization (slug is intentionally excluded)
    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
    });

    // Update settings if provided
    if (settings) {
      await prisma.organizationSettings.upsert({
        where: { organizationId: id },
        create: {
          organizationId: id,
          ...settings,
        },
        update: settings,
      });
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check user is owner
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: id, userId: user.id },
      },
    });

    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.organization.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
