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
    const { content, parentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

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

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create comment
    const comment = await prisma.deviationComment.create({
      data: {
        deviationId: id,
        userId: session.userId,
        content: content.trim(),
        parentId: parentId || null,
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
        action: "COMMENT_CREATED",
        entityType: "Deviation",
        entityId: id,
        metadata: JSON.stringify({
          commentId: comment.id,
          deviationName: `${deviation.guideWord} ${deviation.parameter}`,
        }),
      },
    });

    // TODO: Check for @mentions and send notifications

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Create comment error:", error);
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

    const comments = await prisma.deviationComment.findMany({
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
        replies: {
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
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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
    const commentId = searchParams.get("commentId");
    const body = await req.json();
    const { content } = body;

    if (!commentId) {
      return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const comment = await prisma.deviationComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Only comment author can edit
    if (comment.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.deviationComment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
        edited: true,
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update comment error:", error);
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
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
    }

    const comment = await prisma.deviationComment.findUnique({
      where: { id: commentId },
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

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Only comment author or admin can delete
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: comment.deviation.node.project.organizationId,
        userId: session.userId,
      },
    });

    const canDelete =
      comment.userId === session.userId ||
      membership?.role === "ADMIN" ||
      membership?.role === "OWNER";

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.deviationComment.delete({
      where: { id: commentId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId: comment.deviation.node.project.organizationId,
        projectId: comment.deviation.node.projectId,
        userId: session.userId,
        action: "COMMENT_DELETED",
        entityType: "Deviation",
        entityId: comment.deviationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
