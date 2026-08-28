import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { OrgSettingsView } from "./org-settings-view";

interface OrgSettingsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrgSettingsPage({ params }: OrgSettingsPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  // Find organization and verify ownership
  const organization = await prisma.organization.findUnique({
    where: { slug },
    include: {
      members: {
        where: { userId: user.id },
        select: { role: true },
      },
      settings: true,
      _count: {
        select: {
          members: true,
          projects: true,
          teams: true,
        },
      },
    },
  });

  if (!organization || organization.members.length === 0) {
    notFound();
  }

  const userRole = organization.members[0].role;
  const isOwner = userRole === "OWNER";

  // Only owners can access settings
  if (!isOwner) {
    redirect(`/org/${slug}`);
  }

  return (
    <OrgSettingsView
      organization={{
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        description: organization.description,
        logo: organization.logo,
        settings: organization.settings
          ? {
              id: organization.settings.id,
              allowMemberInvites: organization.settings.allowMemberInvites,
              requireAdminApproval: organization.settings.requireAdminApproval,
              notifyOnMemberJoin: organization.settings.notifyOnMemberJoin,
              notifyOnProjectCreate: organization.settings.notifyOnProjectCreate,
            }
          : null,
        _count: organization._count,
      }}
    />
  );
}
