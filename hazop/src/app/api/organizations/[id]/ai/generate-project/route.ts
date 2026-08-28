import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { AIClient } from "@/lib/ai/client";

export async function POST(
  req: Request,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userInput } = await req.json();

    if (!userInput || userInput.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a description of your project" },
        { status: 400 }
      );
    }

    // Find organization
    const organization = await prisma.organization.findUnique({
      where: { slug: params.slug },
      include: {
        members: {
          where: { userId: user.id },
        },
        aiSettings: true,
      },
    });

    if (!organization) {
      return new NextResponse("Organization not found", { status: 404 });
    }

    if (organization.members.length === 0) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const aiSettings = organization.aiSettings;

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
      apiKey: aiSettings.apiKey || "",
      model: aiSettings.model || undefined,
      baseUrl: aiSettings.baseUrl || undefined,
    });

    const projectDetails = await aiClient.generateProjectDetails(userInput);

    return NextResponse.json(projectDetails);
  } catch (error) {
    console.error("Error generating project details:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate project details" },
      { status: 500 }
    );
  }
}
