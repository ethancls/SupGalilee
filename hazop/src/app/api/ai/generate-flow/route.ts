import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { AIClient } from '@/lib/ai/client';
import { AIProvider } from '@/lib/ai/providers';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { description, organizationId } = body;

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    // Get AI settings for organization
    const aiSettings = await prisma.aISettings.findFirst({
      where: { organizationId },
    });

    if (!aiSettings || !aiSettings.enabled) {
      return NextResponse.json(
        { error: 'AI is not configured or enabled for this organization' },
        { status: 400 }
      );
    }

    const aiClient = new AIClient({
      provider: aiSettings.provider as AIProvider,
      apiKey: aiSettings.apiKey || '',
      model: aiSettings.model || undefined,
      baseUrl: aiSettings.baseUrl || undefined,
    });

    const systemPrompt = `You are an expert in process engineering and HAZOP analysis.
Generate a process flow diagram as JSON based on the user's description.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanations.

The JSON must have this exact structure:
{
  "nodes": [
    {
      "id": "unique-id-1",
      "label": "Equipment Name",
      "type": "vessel|pump|exchanger|valve|reactor|pipe",
      "parameters": ["Param1", "Param2"],
      "position": { "x": 100, "y": 100 }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "unique-id-1",
      "target": "unique-id-2",
      "label": "optional label"
    }
  ]
}

Rules:
- Position nodes from left to right with ~300px spacing horizontally
- Alternate vertical positions slightly (y: 100, 150, 100, 150) for visual clarity
- Connect nodes in logical process order (source -> target)
- Use appropriate equipment types: vessel (tanks, drums), pump, exchanger (heat exchangers), valve, reactor, pipe
- Include relevant parameters for each equipment type
- Edge source must exist in nodes, edge target must exist in nodes
- Generate 3-10 nodes depending on process complexity`;

    const response = await aiClient.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate a process flow diagram for: ${description}` },
    ]);

    // Parse the AI response
    let flowData;
    try {
      // Try to extract JSON from the response (response is already a string)
      let jsonStr = response;
      
      // Remove markdown code blocks if present
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }
      
      // Find JSON object
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      flowData = JSON.parse(jsonStr);
    } catch {
      // If parsing fails, return a sample structure
      flowData = {
        nodes: [
          { id: '1', label: 'Feed Tank', type: 'vessel', parameters: ['Level', 'Temperature'], position: { x: 100, y: 100 } },
          { id: '2', label: 'Pump P-101', type: 'pump', parameters: ['Flow', 'Pressure'], position: { x: 400, y: 120 } },
          { id: '3', label: 'Process Unit', type: 'reactor', parameters: ['Temperature', 'Pressure', 'Level'], position: { x: 700, y: 100 } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
        ],
      };
    }

    // Validate and clean the flow data
    type RawNode = { id?: string; label?: string; type?: string; parameters?: string[]; position?: { x: number; y: number } };
    type RawEdge = { id?: string; source: string; target: string; label?: string };
    
    const nodes = (flowData.nodes || []).map((node: RawNode, index: number) => ({
      id: node.id || `node-${index + 1}`,
      type: 'process',
      position: node.position || { x: 100 + index * 300, y: 100 + (index % 2) * 50 },
      data: {
        label: node.label || `Node ${index + 1}`,
        type: node.type || 'vessel',
        parameters: node.parameters || ['Flow', 'Pressure'],
      },
    }));

    const nodeIds = new Set(nodes.map((n: { id: string }) => n.id));
    const edges = (flowData.edges || [])
      .filter((edge: RawEdge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
      .map((edge: RawEdge, index: number) => ({
        id: edge.id || `edge-${index + 1}`,
        source: edge.source,
        target: edge.target,
        animated: true,
        style: { stroke: 'hsl(var(--primary))' },
        label: edge.label || undefined,
      }));

    return NextResponse.json({
      success: true,
      flow: { nodes, edges },
    });
  } catch (error) {
    console.error('Flow generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate flow' },
      { status: 500 }
    );
  }
}
