import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, nodeId } = await params;

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

    const deviations = await prisma.deviation.findMany({
      where: { nodeId },
      include: {
        causesDetailed: true,
        consequencesDetailed: true,
        safeguardsDetailed: true,
        recommendationsDetailed: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ deviations });
  } catch (error) {
    console.error('Get deviations error:', error);
    return NextResponse.json({ error: 'Failed to fetch deviations' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, nodeId } = await params;
    const { 
      parameter, 
      guideWord, 
      deviation,
      cause,
      consequence,
      safeguards,
      recommendations,
      severity,
      likelihood,
      riskLevel,
    } = await request.json();

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

    // Verify node exists
    const node = await prisma.node.findFirst({
      where: { id: nodeId, projectId },
    });

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    if (!parameter || !guideWord) {
      return NextResponse.json({ error: 'Parameter and guideWord are required' }, { status: 400 });
    }

    const deviationRecord = await prisma.deviation.create({
      data: {
        nodeId,
        createdById: user.id,
        parameter,
        guideWord,
        deviation: deviation || `${guideWord} ${parameter}`,
        cause,
        consequence,
        safeguards,
        recommendations,
        severity,
        likelihood,
        riskLevel,
        status: 'OPEN',
        // Optional: create detailed structured data if provided as arrays
        ...(Array.isArray(cause) && {
          causesDetailed: {
            create: cause.map((c: { description: string; category?: string }) => ({
              description: c.description,
              category: c.category,
            })),
          },
        }),
        ...(Array.isArray(consequence) && {
          consequencesDetailed: {
            create: consequence.map((c: { description: string; category?: string; severity?: string }) => ({
              description: c.description,
              category: c.category,
              severity: c.severity,
            })),
          },
        }),
        ...(Array.isArray(safeguards) && {
          safeguardsDetailed: {
            create: safeguards.map((s: { description: string; type?: string; effectiveness?: string; existing?: boolean }) => ({
              description: s.description,
              type: s.type,
              effectiveness: s.effectiveness,
              existing: s.existing !== undefined ? s.existing : true,
            })),
          },
        }),
        ...(Array.isArray(recommendations) && {
          recommendationsDetailed: {
            create: recommendations.map((r: { description: string; type?: string; priority?: string }) => ({
              description: r.description,
              type: r.type,
              priority: r.priority,
              status: 'OPEN',
            })),
          },
        }),
      },
      include: {
        causesDetailed: true,
        consequencesDetailed: true,
        safeguardsDetailed: true,
        recommendationsDetailed: true,
      },
    });

    return NextResponse.json({ deviation: deviationRecord }, { status: 201 });
  } catch (error) {
    console.error('Create deviation error:', error);
    return NextResponse.json({ error: 'Failed to create deviation' }, { status: 500 });
  }
}
