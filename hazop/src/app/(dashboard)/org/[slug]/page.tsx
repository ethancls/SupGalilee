import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { OrgDashboardView } from "./org-dashboard-view";

interface OrgPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrgDashboardPage({ params }: OrgPageProps) {
  const { slug } = await params;
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
      _count: {
        select: {
          members: true,
          projects: true,
        },
      },
    },
  });

  if (!organization || organization.members.length === 0) {
    notFound();
  }

  const userRole = organization.members[0].role;

  // Fetch organization's projects
  const projects = await prisma.project.findMany({
    where: { organizationId: organization.id },
    include: {
      _count: {
        select: { nodes: true },
      },
      nodes: {
        include: {
          _count: {
            select: { deviations: true },
          },
        },
      },
      createdBy: {
        select: { name: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  // Transform projects to include deviation count
  const projectsWithStats = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdBy: project.createdBy.name,
    nodeCount: project._count.nodes,
    deviationCount: project.nodes.reduce((acc, node) => acc + node._count.deviations, 0),
    updatedAt: project.updatedAt,
  }));

  // Stats
  const totalNodes = await prisma.node.count({
    where: { project: { organizationId: organization.id } },
  });

  const totalDeviations = await prisma.deviation.count({
    where: { node: { project: { organizationId: organization.id } } },
  });

  const openDeviations = await prisma.deviation.count({
    where: {
      node: { project: { organizationId: organization.id } },
      status: "OPEN",
    },
  });

  return (
    <OrgDashboardView
      organization={{
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        description: organization.description,
        memberCount: organization._count.members,
        projectCount: organization._count.projects,
      }}
      userRole={userRole}
      projects={projectsWithStats}
      stats={{
        totalProjects: organization._count.projects,
        totalNodes,
        totalDeviations,
        openDeviations,
      }}
    />
  );
}
