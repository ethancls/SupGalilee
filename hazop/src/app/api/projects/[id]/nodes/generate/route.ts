
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { AIClient } from "@/lib/ai/client";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        organization: {
          include: {
            members: {
              where: { userId: user.id },
            },
            aiSettings: true,
          },
        },
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    if (project.organization.members.length === 0) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const aiSettings = project.organization.aiSettings;

    if (!aiSettings || !aiSettings.enabled) {
      return NextResponse.json(
        { error: "AI is not enabled for this organization" },
        { status: 400 }
      );
    }

    if (!aiSettings.apiKey && aiSettings.provider !== "OLLAMA") {
       return NextResponse.json(
        { error: "AI API key is missing" },
        { status: 400 }
      );
    }

    const aiClient = new AIClient({
      provider: aiSettings.provider,
      apiKey: aiSettings.apiKey || "", // Ollama might not need a key
      model: aiSettings.model || undefined,
      baseUrl: aiSettings.baseUrl || undefined,
    });

    // Use project description or name if description is empty
    const description = project.description && project.description.trim().length > 10 
      ? project.description 
      : `Project Name: ${project.name}`;

    const data = await aiClient.generateNodes(description);
    
    // Map temporary IDs to real DB IDs
    const idMap = new Map<string, string>();
    const createdNodes = [];

    // Create nodes first
    for (const [index, node] of data.nodes.entries()) {
      const createdNode = await prisma.node.create({
        data: {
          projectId: project.id,
          name: node.name,
          description: node.description,
          designIntent: node.designIntent,
          parameters: JSON.stringify(node.parameters),
          position: JSON.stringify({ x: 100 + (index * 250), y: 100 }), // Simple layout
          nodeType: "custom",
          color: "#3b82f6", // Default blue
        },
      });
      createdNodes.push(createdNode);
      if (node.id) {
        idMap.set(node.id, createdNode.id);
      }

      // Create generated deviations if any
      if (node.deviations && node.deviations.length > 0) {
        for (const dev of node.deviations) {
           await prisma.deviation.create({
             data: {
               nodeId: createdNode.id,
               guideWord: dev.guideWord,
               parameter: dev.parameter,
               deviation: dev.deviation || `${dev.guideWord} ${dev.parameter}`,
               cause: dev.cause,
               consequence: dev.consequence,
               createdById: user.id,
               status: "OPEN",
             }
           });
        }
      }
    }

    // Create connections
    const createdConnections = [];
    if (data.connections) {
      for (const conn of data.connections) {
        const sourceId = idMap.get(conn.source);
        const targetId = idMap.get(conn.target);

        if (sourceId && targetId) {
          const createdConn = await prisma.nodeConnection.create({
            data: {
              sourceId,
              targetId,
              label: conn.label,
            },
          });
          createdConnections.push(createdConn);
        }
      }
    }

    return NextResponse.json({ nodes: createdNodes, connections: createdConnections });
  } catch (error) {
    console.error("AI Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate nodes" },
      { status: 500 }
    );
  }
}
