import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { ActivityView } from "./activity-view";

export default async function ActivityPage() {
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

  // Get user's organizations
  const memberships = await prisma.organizationMember.findMany({
    where: { userId: session.userId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  const orgIds = memberships.map((m) => m.organizationId);

  // Get assigned deviations
  const assignments = await prisma.deviationAssignment.findMany({
    where: {
      userId: session.userId,
      status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] },
    },
    include: {
      deviation: {
        include: {
          node: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  organizationId: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  // Get recent activity across all user's organizations
  const recentActivity = await prisma.activityLog.findMany({
    where: {
      organizationId: { in: orgIds },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Get comments mentioning the user (simple check for @name in content)
  const mentions = await prisma.deviationComment.findMany({
    where: {
      content: { contains: `@${session.user.name}` },
      userId: { not: session.userId },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      deviation: {
        include: {
          node: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  organizationId: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Get overdue assignments
  const now = new Date();
  const overdueCount = assignments.filter(
    (a) => a.dueDate && new Date(a.dueDate) < now
  ).length;

  // Get org map for navigation
  const orgMap = memberships.reduce(
    (acc, m) => {
      acc[m.organizationId] = m.organization.slug;
      return acc;
    },
    {} as Record<string, string>
  );

  return (
    <ActivityView
      user={session.user}
      assignments={assignments.map((a) => ({
        ...a,
        dueDate: a.dueDate ? a.dueDate.toISOString() : null,
      }))}
      recentActivity={recentActivity.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      }))}
      mentions={mentions.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      }))}
      overdueCount={overdueCount}
      orgMap={orgMap}
    />
  );
}
