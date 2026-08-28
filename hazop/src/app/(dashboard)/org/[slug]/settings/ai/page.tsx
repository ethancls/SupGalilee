import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { AISettingsView } from "./ai-settings-view";

interface AISettingsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AISettingsPage({ params }: AISettingsPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { slug } = await params;

  const organization = await prisma.organization.findUnique({
    where: { slug },
    include: {
      members: {
        where: { userId: user.id },
      },
      aiSettings: true,
    },
  });

  if (!organization) {
    redirect("/");
  }

  const membership = organization.members[0];
  if (!membership) {
    redirect("/");
  }

  // Only owners and admins can access AI settings
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    redirect(`/org/${slug}/settings`);
  }

  return (
    <AISettingsView
      organization={{
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      }}
      aiSettings={organization.aiSettings}
    />
  );
}
