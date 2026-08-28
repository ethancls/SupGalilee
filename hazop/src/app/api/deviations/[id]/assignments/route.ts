import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { userId, role, dueDate, notes } = body;

    // Verify deviation exists
    const deviation = await prisma.deviation.findUnique({
      where: { id },
      include: { node: { include: { project: true } } },
    });

    if (!deviation) {
      return NextResponse.json({ error: "Deviation not found" }, { status: 404 });
    }

    // Verify user has access to the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: deviation.node.project.organizationId,
        userId: session.userId,
      },
    });

    if (!membership || membership.role === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create assignment
    const assignment = await prisma.deviationAssignment.create({
      data: {
        deviationId: id,
        userId,
        assignedById: session.userId,
        role: role || "RESPONSIBLE",
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        organizationId: deviation.node.project.organizationId,
        projectId: deviation.node.projectId,
        userId: session.userId,
        action: "DEVIATION_ASSIGNED",
        entityType: "Deviation",
        entityId: id,
        metadata: JSON.stringify({
          assignedTo: userId,
          role,
          deviationName: `${deviation.guideWord} ${deviation.parameter}`,
        }),
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Assign deviation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const { id } = await params;

    const assignments = await prisma.deviationAssignment.findMany({
      where: { deviationId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Get assignments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID required" },
        { status: 400 }
      );
    }

    const assignment = await prisma.deviationAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        deviation: {
          include: {
            node: {
              include: { project: true },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Verify user has access
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: assignment.deviation.node.project.organizationId,
        userId: session.userId,
      },
    });

    if (!membership || membership.role === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.deviationAssignment.delete({
      where: { id: assignmentId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId: assignment.deviation.node.project.organizationId,
        projectId: assignment.deviation.node.projectId,
        userId: session.userId,
        action: "DEVIATION_UNASSIGNED",
        entityType: "Deviation",
        entityId: assignment.deviationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete assignment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
