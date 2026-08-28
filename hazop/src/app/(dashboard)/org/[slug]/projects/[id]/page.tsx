import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ProjectView } from "./project-view";

interface ProjectPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug, id } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  // Find organization and verify membership
  const organization = await prisma.organization.findUnique({
    where: { slug },
    include: {
      members: {
        where: { userId: user.id },
        select: { role: true },
      },
    },
  });

  if (!organization || organization.members.length === 0) {
    notFound();
  }

  // Fetch project
  const project = await prisma.project.findFirst({
    where: {
      id,
      organizationId: organization.id,
    },
    include: {
      nodes: {
        include: {
          deviations: {
            include: {
              assignments: {
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
              comments: {
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
              _count: {
                select: {
                  assignments: true,
                  comments: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
          _count: {
            select: { deviations: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      createdBy: {
        select: { name: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Get organization members for assignment
  const members = await prisma.organizationMember.findMany({
    where: { organizationId: organization.id },
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

  return (
    <ProjectView
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        nodes: project.nodes.map((node) => ({
          id: node.id,
          name: node.name,
          description: node.description,
          designIntent: node.designIntent,
          parameters: node.parameters,
          position: node.position,
          nodeType: node.nodeType,
          color: node.color,
          deviations: node.deviations.map((d) => ({
            id: d.id,
            parameter: d.parameter,
            guideWord: d.guideWord,
            deviation: d.deviation,
            cause: d.cause,
            consequence: d.consequence,
            safeguards: d.safeguards,
            recommendations: d.recommendations,
            status: d.status,
            severity: d.severity,
            likelihood: d.likelihood,
            riskLevel: d.riskLevel,
            assignments: d.assignments?.map((a) => ({
              ...a,
              dueDate: a.dueDate?.toISOString() || null,
            })) || [],
            comments: d.comments?.map((c) => ({
              ...c,
              createdAt: c.createdAt.toISOString(),
            })) || [],
            _count: d._count,
          })),
          _count: { deviations: node._count.deviations },
        })),
      }}
      members={members.map((m) => m.user)}
      organizationSlug={slug}
      userRole={organization.members[0].role}
    />
  );
}
