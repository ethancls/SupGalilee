import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get projects from organizations the user is a member of
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: user.id },
      select: { organizationId: true },
    });

    const orgIds = memberships.map((m) => m.organizationId);

    const projects = await prisma.project.findMany({
      where: { organizationId: { in: orgIds } },
      include: {
        _count: {
          select: { nodes: true },
        },
        organization: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, organizationId, status } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization is required' }, { status: 400 });
    }

    // Verify user is a member of the organization with create permissions
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
    }

    // Viewers cannot create projects
    if (membership.role === 'VIEWER') {
      return NextResponse.json({ error: 'Viewers cannot create projects' }, { status: 403 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || '',
        organizationId,
        createdById: user.id,
        status: status || 'DRAFT',
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
