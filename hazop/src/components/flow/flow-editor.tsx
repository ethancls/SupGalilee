"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeTypes,
  Panel,
  MiniMap,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Save, 
  Trash2, 
  Circle,
  Square,
  Hexagon,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { ProcessNode } from "./process-node";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const nodeTypes: NodeTypes = {
  process: ProcessNode,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "process",
    position: { x: 100, y: 100 },
    data: { 
      label: "Feed Tank",
      type: "vessel",
      parameters: ["Level", "Temperature", "Pressure"],
    },
  },
  {
    id: "2",
    type: "process",
    position: { x: 400, y: 100 },
    data: { 
      label: "Pump P-101",
      type: "pump",
      parameters: ["Flow", "Pressure"],
    },
  },
  {
    id: "3",
    type: "process",
    position: { x: 700, y: 100 },
    data: { 
      label: "Heat Exchanger",
      type: "exchanger",
      parameters: ["Temperature", "Flow", "Pressure"],
    },
  },
];

const initialEdges: Edge[] = [
  { 
    id: "e1-2", 
    source: "1", 
    target: "2", 
    animated: true,
    style: { stroke: "hsl(var(--primary))" },
  },
  { 
    id: "e2-3", 
    source: "2", 
    target: "3", 
    animated: true,
    style: { stroke: "hsl(var(--primary))" },
  },
];

interface FlowEditorProps {
  projectId?: string;
  organizationId?: string;
}

export function FlowEditor({ projectId, organizationId }: FlowEditorProps) {
  const { resolvedTheme } = useTheme();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({
      ...connection,
      animated: true,
      style: { stroke: "hsl(var(--primary))" },
    }, eds)),
    []
  );

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    setSelectedNodes(nodes.map((n) => n.id));
  }, []);

  const addNode = (type: string, label: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: "process",
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 200 + 100 
      },
      data: { 
        label,
        type,
        parameters: getDefaultParameters(type),
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const getDefaultParameters = (type: string): string[] => {
    switch (type) {
      case "vessel":
        return ["Level", "Temperature", "Pressure"];
      case "pump":
        return ["Flow", "Pressure", "Speed"];
      case "exchanger":
        return ["Temperature In", "Temperature Out", "Flow"];
      case "valve":
        return ["Flow", "Position", "Pressure Drop"];
      case "reactor":
        return ["Temperature", "Pressure", "Level", "Concentration"];
      default:
        return ["Flow", "Pressure"];
    }
  };

  const deleteSelected = () => {
    setNodes((nds) => nds.filter((n) => !selectedNodes.includes(n.id)));
    setEdges((eds) => eds.filter(
      (e) => !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)
    ));
    setSelectedNodes([]);
  };

  const generateWithAI = async () => {
    if (!aiDescription.trim()) {
      toast.error("Please enter a description of the process");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          organizationId,
          description: aiDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flow");
      }

      if (data.success && data.flow) {
        // Apply the generated nodes and edges
        setNodes(data.flow.nodes);
        setEdges(data.flow.edges);
        setAiDialogOpen(false);
        setAiDescription("");
        toast.success("Flow diagram generated successfully!");
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate flow");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
        colorMode={resolvedTheme === 'dark' ? 'dark' : 'light'}
        className="bg-background"
        connectionLineStyle={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Panel position="top-left" className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Equipment
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Equipment Types</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => addNode("vessel", "Tank")}>
                <Circle className="h-4 w-4 mr-2" />
                Vessel / Tank
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode("pump", "Pump")}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Pump
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode("exchanger", "Heat Exchanger")}>
                <Square className="h-4 w-4 mr-2" />
                Heat Exchanger
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode("valve", "Valve")}>
                <Hexagon className="h-4 w-4 mr-2" />
                Valve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNode("reactor", "Reactor")}>
                <Circle className="h-4 w-4 mr-2" />
                Reactor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedNodes.length > 0 && (
            <Button size="sm" variant="destructive" onClick={deleteSelected}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedNodes.length})
            </Button>
          )}

          <Button size="sm" variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generate Flow with AI</DialogTitle>
                <DialogDescription>
                  Describe your industrial process and the AI will generate a flow diagram with connected equipment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="process-description">Process Description</Label>
                  <Textarea
                    id="process-description"
                    placeholder="Example: A chemical reactor system with a feed tank, pre-heater, reactor vessel with cooling jacket, and product storage tank. Include pumps and control valves."
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Tip: Be specific about equipment types, connections, and process parameters for better results.
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAiDialogOpen(false)}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button onClick={generateWithAI} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Panel>

        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          className="bg-card border border-border rounded-lg"
        />
        <MiniMap 
          className="bg-card border border-border rounded-lg"
          maskColor={resolvedTheme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.2)'}
          nodeColor="hsl(var(--primary))"
          bgColor={resolvedTheme === 'dark' ? 'hsl(var(--card))' : undefined}
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
