import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { connections } = body;

    if (!Array.isArray(connections)) {
      return NextResponse.json({ error: "Invalid connections" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        nodes: true,
        organization: {
          include: {
            members: {
              where: { userId: user.id },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const membership = project.organization.members[0];
    if (!membership) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    if (membership.role === "VIEWER") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const nodeIds = new Set(project.nodes.map((n) => n.id));
    for (const conn of connections) {
      if (!nodeIds.has(conn.sourceId) || !nodeIds.has(conn.targetId)) {
        return NextResponse.json({ error: "Invalid node ID" }, { status: 400 });
      }
    }

    await prisma.nodeConnection.deleteMany({
      where: {
        OR: [
          { sourceId: { in: Array.from(nodeIds) } },
          { targetId: { in: Array.from(nodeIds) } },
        ],
      },
    });

    if (connections.length > 0) {
      await prisma.nodeConnection.createMany({
        data: connections.map((conn: { sourceId: string; targetId: string; label?: string }) => ({
          sourceId: conn.sourceId,
          targetId: conn.targetId,
          label: conn.label || null,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update connections:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        nodes: {
          include: {
            connections: true,
          },
        },
        organization: {
          include: {
            members: {
              where: { userId: user.id },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.organization.members[0]) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    const connections = project.nodes.flatMap((node) =>
      node.connections.map((conn) => ({
        id: conn.id,
        sourceId: conn.sourceId,
        targetId: conn.targetId,
        label: conn.label,
      }))
    );

    return NextResponse.json({ connections });
  } catch (error) {
    console.error("Failed to get connections:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
