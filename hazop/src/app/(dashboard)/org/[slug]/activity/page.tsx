import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { AdminActivityView } from "./admin-activity-view";

export default async function OrgActivityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    redirect("/login");
  }

  const organization = await prisma.organization.findUnique({
    where: { slug },
    include: {
      members: {
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
      projects: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!organization) {
    redirect("/");
  }

  const membership = organization.members.find(
    (m) => m.userId === session.userId
  );

  if (!membership) {
    redirect("/");
  }

  // Only admins and owners can view activity logs
  if (membership.role !== "ADMIN" && membership.role !== "OWNER") {
    redirect(`/org/${slug}`);
  }

  // Get activity logs
  const activities = await prisma.activityLog.findMany({
    where: {
      organizationId: organization.id,
    },
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
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Get statistics
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total: activities.length,
    last7Days: activities.filter((a) => new Date(a.createdAt) > last7Days).length,
    last30Days: activities.filter((a) => new Date(a.createdAt) > last30Days).length,
    byAction: activities.reduce(
      (acc, a) => {
        acc[a.action] = (acc[a.action] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    byUser: activities.reduce(
      (acc, a) => {
        acc[a.userId] = (acc[a.userId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  return (
    <AdminActivityView
      organization={organization}
      activities={activities.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      }))}
      stats={stats}
      members={organization.members.map((m) => m.user)}
      projects={organization.projects}
    />
  );
}
