import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { WelcomeView } from "./welcome-view";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  // Check if user has any organizations
  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
    orderBy: { joinedAt: "asc" },
  });

  // If user has an organization, redirect to it
  if (membership) {
    redirect(`/org/${membership.organization.slug}`);
  }

  // Otherwise, show welcome page with options
  return <WelcomeView userName={user.name} />;
}
