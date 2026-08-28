import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export async function PATCH(
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

    // Verify deviation exists and user has access
    const deviation = await prisma.deviation.findUnique({
      where: { id },
      include: {
        node: {
          include: {
            project: true,
          },
        },
      },
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

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "cause",
      "consequence",
      "safeguards",
      "recommendations",
      "status",
      "severity",
      "likelihood",
      "riskLevel",
    ];

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Calculate risk level if severity and likelihood are provided
    if (updateData.severity !== undefined && updateData.likelihood !== undefined) {
      const s = Number(updateData.severity || deviation.severity || 0);
      const l = Number(updateData.likelihood || deviation.likelihood || 0);
      const risk = s * l;

      if (risk >= 16) updateData.riskLevel = "CRITICAL";
      else if (risk >= 10) updateData.riskLevel = "HIGH";
      else if (risk >= 5) updateData.riskLevel = "MEDIUM";
      else updateData.riskLevel = "LOW";
    }

    // Update deviation
    const updated = await prisma.deviation.update({
      where: { id },
      data: updateData,
    });

    // Create activity log for significant changes
    const significantFields = ["status", "severity", "likelihood", "riskLevel"];
    const hasSignificantChange = significantFields.some((field) => field in updateData);

    if (hasSignificantChange) {
      await prisma.activityLog.create({
        data: {
          organizationId: deviation.node.project.organizationId,
          projectId: deviation.node.projectId,
          userId: session.userId,
          action: body.status ? "DEVIATION_STATUS_CHANGED" : "DEVIATION_UPDATED",
          entityType: "Deviation",
          entityId: id,
          metadata: JSON.stringify({
            deviationName: `${deviation.guideWord} ${deviation.parameter}`,
            changes: updateData,
          }),
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update deviation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify deviation exists and user has access
    const deviation = await prisma.deviation.findUnique({
      where: { id },
      include: {
        node: {
          include: {
            project: true,
          },
        },
      },
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

    // Delete deviation (cascades to assignments and comments)
    await prisma.deviation.delete({
      where: { id },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        organizationId: deviation.node.project.organizationId,
        projectId: deviation.node.projectId,
        userId: session.userId,
        action: "DEVIATION_DELETED",
        entityType: "Deviation",
        entityId: id,
        metadata: JSON.stringify({
          deviationName: `${deviation.guideWord} ${deviation.parameter}`,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete deviation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
