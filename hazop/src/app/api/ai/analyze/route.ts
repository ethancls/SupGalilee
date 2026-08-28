import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AIClient } from "@/lib/ai/client";
import { AIProvider, HAZOPAnalysisRequest } from "@/lib/ai/providers";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, nodeId, parameter, guideWord } = body;

    if (!organizationId || !nodeId || !parameter || !guideWord) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    const aiSettings = await prisma.aISettings.findUnique({
      where: { organizationId },
    });

    if (!aiSettings?.enabled || !aiSettings?.apiKey) {
      return NextResponse.json(
        { error: "AI is not configured for this organization" },
        { status: 400 }
      );
    }

    let nodeData;

    if (nodeId === "test") {
      // Mock data for connection testing
      nodeData = {
        id: "test-node",
        name: "Test Reactor Feed",
        description: "A test node for verifying AI connection",
        designIntent: "To deliver feed to the reactor at controlled flow and temperature",
        deviations: []
      };
    } else {
      const node = await prisma.node.findUnique({
        where: { id: nodeId },
        include: {
          deviations: {
            select: {
              parameter: true,
              guideWord: true,
              cause: true,
              consequence: true,
            },
          },
        },
      });

      if (!node) {
        return NextResponse.json({ error: "Node not found" }, { status: 404 });
      }
      nodeData = node;
    }

    const client = new AIClient({
      provider: aiSettings.provider as AIProvider,
      apiKey: aiSettings.apiKey,
      model: aiSettings.model || undefined,
      baseUrl: aiSettings.baseUrl || undefined,
    });

    const analysisRequest: HAZOPAnalysisRequest = {
      nodeId: nodeData.id,
      nodeName: nodeData.name,
      nodeDescription: nodeData.description || undefined,
      designIntent: nodeData.designIntent || undefined,
      parameter,
      guideWord,
      existingDeviations: nodeData.deviations.map((d) => ({
        parameter: d.parameter,
        guideWord: d.guideWord,
        cause: d.cause ?? undefined,
        consequence: d.consequence ?? undefined,
      })),
    };

    const analysis = await client.analyzeHAZOP(analysisRequest);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI analysis failed" },
      { status: 500 }
    );
  }
}
