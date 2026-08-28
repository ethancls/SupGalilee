import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { OrgMembersView } from "./org-members-view";

interface OrgMembersPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrgMembersPage({ params }: OrgMembersPageProps) {
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
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      invitations: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!organization) {
    notFound();
  }

  // Check if user is a member
  const userMembership = organization.members.find((m) => m.userId === user.id);
  if (!userMembership) {
    notFound();
  }

  const isAdmin = userMembership.role === "OWNER" || userMembership.role === "ADMIN";

  return (
    <OrgMembersView
      organization={{
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      }}
      members={organization.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
        user: m.user,
      }))}
      invitations={organization.invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        status: inv.status,
        createdAt: inv.createdAt.toISOString(),
      }))}
      currentUserId={user.id}
      isAdmin={isAdmin}
    />
  );
}
