import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ProjectSettingsView } from "./project-settings-view";

interface ProjectSettingsPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
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

  const userRole = organization.members[0].role;
  const canEdit = userRole === "OWNER" || userRole === "ADMIN" || userRole === "MEMBER";

  if (!canEdit) {
    redirect(`/org/${slug}/projects/${id}`);
  }

  // Get project
  const project = await prisma.project.findUnique({
    where: { id, organizationId: organization.id },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      createdBy: {
        select: { name: true },
      },
      _count: {
        select: { nodes: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <ProjectSettingsView
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        createdBy: project.createdBy.name,
        nodeCount: project._count.nodes,
      }}
      organizationSlug={slug}
      userRole={userRole}
    />
  );
}
