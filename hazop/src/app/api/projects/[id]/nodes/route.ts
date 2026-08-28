import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Verify user has access to project through organization membership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: {
            some: { userId: user.id },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found or insufficient permissions' }, { status: 404 });
    }

    const nodes = await prisma.node.findMany({
      where: { projectId },
      include: {
        _count: { select: { deviations: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ nodes });
  } catch (error) {
    console.error('Get nodes error:', error);
    return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const { name, description, designIntent, nodeType, color, parameters, position } = await request.json();

    // Verify user has access to project through organization membership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: {
            some: {
              userId: user.id,
              role: { in: ['OWNER', 'ADMIN', 'MEMBER'] },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found or insufficient permissions' }, { status: 404 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Node name is required' }, { status: 400 });
    }

    const node = await prisma.node.create({
      data: {
        projectId,
        name,
        description: description || null,
        designIntent: designIntent || null,
        nodeType: nodeType || null,
        color: color || null,
        parameters: parameters || null,
        position: position || null,
      },
    });

    return NextResponse.json({ node }, { status: 201 });
  } catch (error) {
    console.error('Create node error:', error);
    return NextResponse.json({ error: 'Failed to create node' }, { status: 500 });
  }
}
