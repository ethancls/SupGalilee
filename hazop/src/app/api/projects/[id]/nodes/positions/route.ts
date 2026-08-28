import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
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
    const { positions } = body;

    if (!positions || typeof positions !== "object") {
      return NextResponse.json({ error: "Invalid positions" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
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

    const updates = Object.entries(positions).map(([nodeId, position]) =>
      prisma.node.update({
        where: { id: nodeId },
        data: { position: JSON.stringify(position) },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update node positions:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
