import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { NodeView } from "./node-view";

interface NodePageProps {
  params: Promise<{ slug: string; id: string; nodeId: string }>;
}

export default async function NodePage({ params }: NodePageProps) {
  const { slug, id, nodeId } = await params;
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

  // Fetch Node with Project and Deviations
  const node = await prisma.node.findUnique({
    where: {
      id: nodeId,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          organizationId: true,
        },
      },
      deviations: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!node) {
    notFound();
  }

  // Verify the node belongs to the project and organization requested
  if (node.project.id !== id || node.project.organizationId !== organization.id) {
    notFound();
  }

  return (
    <NodeView
      node={{
        id: node.id,
        name: node.name,
        description: node.description,
        designIntent: node.designIntent,
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
        })),
      }}
      project={{
        id: node.project.id,
        name: node.project.name,
      }}
      organizationSlug={slug}
      userRole={organization.members[0].role}
    />
  );
}
