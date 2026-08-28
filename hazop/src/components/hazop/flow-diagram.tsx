"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  Connection,
  Edge,
  NodeTypes,
  MarkerType,
  ConnectionMode,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Save, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { NODE_TEMPLATES, NODE_CATEGORIES, NodeTemplate } from "@/lib/hazop/templates";
import { cn } from "@/lib/utils";

// Custom Node Component
function HAZOPNode({ data, selected }: { data: HAZOPNodeData; selected: boolean }) {
  return (
    <div
      className={cn(
        "px-3 py-2 sm:px-4 sm:py-3 bg-card border rounded-lg shadow-sm min-w-35 max-w-50 sm:min-w-45 sm:max-w-62 transition-all relative",
        selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:border-primary/50"
      )}
      style={{ borderColor: selected ? undefined : (data.color || "#3b82f6") }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3! h-3! bg-primary! border-2! border-background!"
        style={{ width: 12, height: 12, background: 'hsl(var(--primary))', border: '2px solid hsl(var(--background))' }}
      />
      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
        {data.nodeType && (
          <Badge
            variant="outline"
            className="text-[9px] sm:text-[10px] h-4 sm:h-5 px-1 sm:px-1.5 uppercase tracking-wider"
            style={{ 
              borderColor: data.color, 
              color: data.color,
              backgroundColor: `${data.color}15` 
            }}
          >
            {data.nodeType}
          </Badge>
        )}
      </div>
      <p className="font-semibold text-xs sm:text-sm leading-tight wrap-break-word text-foreground line-clamp-2">{data.label}</p>
      {data.description && (
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-1.5 line-clamp-2 leading-relaxed wrap-break-word">
          {data.description}
        </p>
      )}
      <div className="flex items-center gap-2 mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-border/50">
        <Badge variant="secondary" className="text-[9px] sm:text-[10px] h-4 sm:h-5 px-1 sm:px-1.5">
          {data.deviationCount} dev.
        </Badge>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3! h-3! bg-primary! border-2! border-background!"
        style={{ width: 12, height: 12, background: 'hsl(var(--primary))', border: '2px solid hsl(var(--background))' }}
      />
    </div>
  );
}

interface HAZOPNodeData {
  label: string;
  description?: string;
  nodeType?: string;
  color?: string;
  deviationCount: number;
  [key: string]: unknown;
}

const nodeTypes: NodeTypes = {
  hazop: HAZOPNode,
};

interface FlowDiagramNode {
  id: string;
  name: string;
  description: string | null;
  nodeType: string | null;
  color: string | null;
  position: string | null;
  _count: { deviations: number };
}

interface FlowDiagramProps {
  nodes: FlowDiagramNode[];
  canEdit: boolean;
  onAddNode: (template: NodeTemplate, position: { x: number; y: number }) => void;
  onSavePositions: (positions: Record<string, { x: number; y: number }>) => Promise<void>;
  onSaveConnections: (connections: Array<{ sourceId: string; targetId: string; label?: string }>) => Promise<void>;
}

export function FlowDiagram({
  nodes,
  canEdit,
  onAddNode,
  onSavePositions,
  onSaveConnections,
}: FlowDiagramProps) {
  const { resolvedTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Convert HAZOP nodes to React Flow nodes
  const initialNodes = useMemo(() => {
    return nodes.map((node, index) => {
      const position = node.position ? JSON.parse(node.position) : { x: 100 + index * 250, y: 100 };
      return {
        id: node.id,
        type: "hazop",
        position,
        data: {
          label: node.name,
          description: node.description,
          nodeType: node.nodeType,
          color: node.color || "#3b82f6",
          deviationCount: node._count.deviations,
        },
      };
    });
  }, [nodes]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Update nodes when prop changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { strokeWidth: 2 },
          },
          eds
        )
      );
      setHasChanges(true);
    },
    [setEdges]
  );

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      // Check if any position changed
      if (changes.some((c) => c.type === "position" && c.dragging === false)) {
        setHasChanges(true);
      }
    },
    [onNodesChange]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save positions
      const positions: Record<string, { x: number; y: number }> = {};
      flowNodes.forEach((node) => {
        positions[node.id] = node.position;
      });
      await onSavePositions(positions);

      // Save connections
      const connections = edges.map((edge) => ({
        sourceId: edge.source,
        targetId: edge.target,
        label: typeof edge.label === "string" ? edge.label : undefined,
      }));
      await onSaveConnections(connections);

      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  const handleAddFromTemplate = (template: NodeTemplate) => {
    // Add at center of viewport
    const position = { x: 200, y: 200 };
    onAddNode(template, position);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      className={cn(
        "border rounded-lg overflow-hidden bg-background transition-all duration-300",
        isFullscreen 
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none border-0" 
          : "h-96 sm:h-125 lg:h-150 relative"
      )}
    >
      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={canEdit ? onConnect : undefined}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
        colorMode={resolvedTheme === 'dark' ? 'dark' : 'light'}
        nodesDraggable={canEdit}
        nodesConnectable={canEdit}
        elementsSelectable={canEdit}
        minZoom={0.1}
        maxZoom={4}
        connectionLineStyle={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 2, stroke: "hsl(var(--primary))" },
        }}
        proOptions={{ hideAttribution: true }}
        className={cn("bg-background", isFullscreen && "bg-background")}
      >
        <Background gap={20} size={1} color="currentColor" className="opacity-5 text-foreground" />
        <Controls className="bg-background border-border fill-foreground text-foreground" />
        <MiniMap
          nodeColor={(node) => (node.data as HAZOPNodeData).color || "#3b82f6"}
          maskColor={resolvedTheme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.2)'}
          bgColor={resolvedTheme === 'dark' ? 'hsl(var(--card))' : undefined}
          className="bg-background border-border"
        />

        <Panel position="top-right" className="flex gap-2">
            <Button 
                size="icon" 
                variant="outline" 
                onClick={toggleFullscreen}
                className="bg-background/80 backdrop-blur-sm hover:bg-background"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
        </Panel>

        {canEdit && (
          <Panel position="top-left" className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Node
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto z-50">
                {NODE_CATEGORIES.map((category) => (
                  <DropdownMenuGroup key={category.id}>
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </DropdownMenuLabel>
                    {NODE_TEMPLATES.filter((t) => t.category === category.id).map(
                      (template) => (
                        <DropdownMenuItem
                          key={template.id}
                          onClick={() => handleAddFromTemplate(template)}
                          className="cursor-pointer"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{template.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {template.description}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      )
                    )}
                    <DropdownMenuSeparator />
                  </DropdownMenuGroup>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasChanges && (
              <Button size="sm" variant="outline" onClick={handleSave} disabled={saving} className="bg-background/80 backdrop-blur-sm">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Layout
                  </>
                )}
              </Button>
            )}
          </Panel>
        )}

        {flowNodes.length === 0 && (
          <Panel position="top-center" className="mt-32">
            <div className="text-center p-8 bg-card rounded-lg border shadow-sm max-w-sm mx-auto">
              <p className="text-lg font-medium mb-2">No nodes yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first process node to start building the flow diagram
              </p>
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Node
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
                    {NODE_CATEGORIES.map((category) => (
                      <DropdownMenuGroup key={category.id}>
                        <DropdownMenuLabel className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </DropdownMenuLabel>
                        {NODE_TEMPLATES.filter((t) => t.category === category.id).map(
                          (template) => (
                            <DropdownMenuItem
                              key={template.id}
                              onClick={() => handleAddFromTemplate(template)}
                            >
                              <div className="flex-1">
                                <p className="font-medium">{template.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {template.description}
                                </p>
                              </div>
                            </DropdownMenuItem>
                          )
                        )}
                        <DropdownMenuSeparator />
                      </DropdownMenuGroup>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
