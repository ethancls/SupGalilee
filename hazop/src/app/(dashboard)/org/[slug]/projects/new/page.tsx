import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { NewProjectForm } from "./new-project-form";

interface NewProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewProjectPage({ params }: NewProjectPageProps) {
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
    },
  });

  if (!organization || organization.members.length === 0) {
    notFound();
  }

  // Viewers cannot create projects
  const userRole = organization.members[0].role;
  if (userRole === "VIEWER") {
    redirect(`/org/${slug}`);
  }

  return (
    <NewProjectForm
      organizationId={organization.id}
      organizationSlug={organization.slug}
      organizationName={organization.name}
    />
  );
}
