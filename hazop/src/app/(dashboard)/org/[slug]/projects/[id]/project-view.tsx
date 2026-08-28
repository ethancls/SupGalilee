"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  GitBranch,
  AlertTriangle,
  FileText,
  Settings,
  Trash2,
  Loader2,
  ChevronRight,
  Workflow,
  Sparkles,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";
import { NodeTemplate } from "@/lib/hazop/templates";
import { InteractiveWorksheet } from "@/components/hazop/interactive-worksheet";

// Standardized components
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard, StatsGrid } from "@/components/ui/stats-card";
import { PersistentTabs } from "@/components/ui/persistent-tabs";
import { EmptyState } from "@/components/ui/empty-state";

// Dynamic import for FlowDiagram to avoid SSR issues
const FlowDiagram = dynamic(
  () => import("@/components/hazop/flow-diagram").then((mod) => mod.FlowDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="h-150 border rounded-lg flex items-center justify-center bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface Assignment {
  id: string;
  userId: string;
  role: string;
  dueDate: string | null;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

interface DeviationComment {
  id: string;
  content: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  createdAt: string;
  edited: boolean;
}

interface Deviation {
  id: string;
  parameter: string;
  guideWord: string;
  deviation: string;
  cause: string | null;
  consequence: string | null;
  safeguards: string | null;
  recommendations: string | null;
  status: string;
  severity: number | null;
  likelihood: number | null;
  riskLevel: string | null;
  assignments?: Assignment[];
  comments?: DeviationComment[];
  _count?: { comments: number; assignments: number };
}

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface Node {
  id: string;
  name: string;
  description: string | null;
  designIntent: string | null;
  parameters: string | null;
  position: string | null;
  nodeType: string | null;
  color: string | null;
  deviations: Deviation[];
  _count: { deviations: number };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  nodes: Node[];
}

interface ProjectViewProps {
  project: Project;
  members: Member[];
  organizationSlug: string;
  userRole: string;
}

export function ProjectView({ project, members, organizationSlug, userRole }: ProjectViewProps) {
  const router = useRouter();
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [addingNode, setAddingNode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newNode, setNewNode] = useState({
    name: "",
    description: "",
    designIntent: "",
  });

  // Storage key for tab persistence
  const storageKey = `project-${project.id}-tab`;

  const totalDeviations = project.nodes.reduce((acc, n) => acc + n._count.deviations, 0);
  const totalWithRecommendations = project.nodes.reduce(
    (acc, n) => acc + n.deviations.filter((d) => d.recommendations).length,
    0
  );
  const resolvedDeviations = project.nodes
    .flatMap((n) => n.deviations)
    .filter((d) => d.status === "CLOSED" || d.status === "RESOLVED").length;
  const progressPercent = totalDeviations > 0 ? (resolvedDeviations / totalDeviations) * 100 : 0;
  
  const canEdit = userRole === "OWNER" || userRole === "ADMIN" || userRole === "MEMBER";

  const handleGenerateNodes = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/nodes/generate`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to generate nodes");
      }
    } catch {
      alert("Failed to connect to server");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddNode = async () => {
    setAddingNode(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNode),
      });

      if (res.ok) {
        setIsAddingNode(false);
        setNewNode({ name: "", description: "", designIntent: "" });
        router.refresh();
      }
    } catch {
      console.error("Failed to add node");
    } finally {
      setAddingNode(false);
    }
  };

  const handleAddNodeFromTemplate = async (template: NodeTemplate, position: { x: number; y: number }) => {
    try {
      const res = await fetch(`/api/projects/${project.id}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          designIntent: template.defaultDesignIntent,
          nodeType: template.id,
          color: template.color,
          parameters: JSON.stringify(template.defaultParameters),
          position: JSON.stringify(position),
        }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      console.error("Failed to add node from template");
    }
  };

  const handleSavePositions = async (positions: Record<string, { x: number; y: number }>) => {
    try {
      await fetch(`/api/projects/${project.id}/nodes/positions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positions }),
      });
    } catch {
      console.error("Failed to save positions");
    }
  };

  const handleSaveConnections = async (connections: Array<{ sourceId: string; targetId: string; label?: string }>) => {
    try {
      await fetch(`/api/projects/${project.id}/connections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connections }),
      });
    } catch {
      console.error("Failed to save connections");
    }
  };

  const handleDeleteNode = async () => {
    if (!nodeToDelete) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/projects/${project.id}/nodes/${nodeToDelete}`, {
        method: "DELETE",
      });
      router.refresh();
      setNodeToDelete(null);
    } catch {
      console.error("Failed to delete node");
    } finally {
      setIsDeleting(false);
    }
  };

  const getRiskBadgeVariant = (level: string | null) => {
    switch (level) {
      case "CRITICAL":
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "secondary";
      case "LOW":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRiskCounts = () => {
    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    project.nodes.flatMap((n) => n.deviations).forEach((d) => {
      if (d.riskLevel && d.riskLevel in counts) {
        counts[d.riskLevel as keyof typeof counts]++;
      }
    });
    return counts;
  };

  const getStatusCounts = () => {
    const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, ACCEPTED: 0, CLOSED: 0 };
    project.nodes.flatMap((n) => n.deviations).forEach((d) => {
      if (d.status in counts) {
        counts[d.status as keyof typeof counts]++;
      }
    });
    return counts;
  };

  const riskCounts = getRiskCounts();
  const statusCounts = getStatusCounts();

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title={project.name}
        description={project.description || undefined}
        backHref={`/org/${organizationSlug}`}
        badge={
          <Badge variant={project.status === "COMPLETED" ? "default" : "secondary"}>
            {project.status.replace("_", " ").toLowerCase()}
          </Badge>
        }
        actions={
          canEdit && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/org/${organizationSlug}/projects/${project.id}/settings`}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          )
        }
      />

      {/* Stats */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Study Nodes"
          icon={GitBranch}
          value={project.nodes.length}
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Deviations"
          icon={AlertTriangle}
          value={totalDeviations}
          iconColor="text-orange-500"
        />
        <StatsCard
          title="Recommendations"
          icon={FileText}
          value={totalWithRecommendations}
          iconColor="text-green-500"
        />
        <StatsCard
          title="Progress"
          icon={ClipboardCheck}
          value={`${Math.round(progressPercent)}%`}
          iconColor="text-purple-500"
        />
      </StatsGrid>

      {/* Tabs with persistence */}
      <PersistentTabs 
        storageKey={storageKey}
        defaultValue="nodes"
        urlParam="tab"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="nodes" className="gap-2">
            <GitBranch className="h-4 w-4 hidden sm:block" />
            Nodes
          </TabsTrigger>
          <TabsTrigger value="flow" className="gap-2">
            <Workflow className="h-4 w-4 hidden sm:block" />
            Flow
          </TabsTrigger>
          <TabsTrigger value="worksheet" className="gap-2">
            <FileText className="h-4 w-4 hidden sm:block" />
            Worksheet
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <BarChart3 className="h-4 w-4 hidden sm:block" />
            Summary
          </TabsTrigger>
        </TabsList>

        {/* Nodes Tab */}
        <TabsContent value="nodes" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-lg font-semibold">Study Nodes</h2>
            {canEdit && project.nodes.length > 0 && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateNodes}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                  )}
                  <span className="hidden sm:inline">Generate with AI</span>
                  <span className="sm:hidden">AI</span>
                </Button>
                <Dialog open={isAddingNode} onOpenChange={setIsAddingNode}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Add Node</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Study Node</DialogTitle>
                      <DialogDescription>
                        Define a new node for your HAZOP study. Nodes represent process equipment or sections.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="nodeName">Node Name</Label>
                        <Input
                          id="nodeName"
                          placeholder="e.g., Reactor Feed Section"
                          value={newNode.name}
                          onChange={(e) =>
                            setNewNode((prev) => ({ ...prev, name: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nodeDescription">Description</Label>
                        <Textarea
                          id="nodeDescription"
                          placeholder="Describe this node..."
                          value={newNode.description}
                          onChange={(e) =>
                            setNewNode((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="designIntent">Design Intent</Label>
                        <Textarea
                          id="designIntent"
                          placeholder="What is the intended function of this node?"
                          value={newNode.designIntent}
                          onChange={(e) =>
                            setNewNode((prev) => ({
                              ...prev,
                              designIntent: e.target.value,
                            }))
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          The design intent describes the expected operation under normal conditions.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingNode(false)}
                        disabled={addingNode}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddNode} disabled={!newNode.name || addingNode}>
                        {addingNode ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Node"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {project.nodes.length === 0 ? (
            <EmptyState
              icon={GitBranch}
              title="No nodes yet"
              description="Add study nodes to start your HAZOP analysis. Each node represents a process equipment or section."
              action={
                canEdit && (
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Button onClick={() => setIsAddingNode(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Node
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleGenerateNodes}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                      )}
                      Generate with AI
                    </Button>
                  </div>
                )
              }
            />
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {project.nodes.map((node) => (
                <Card 
                  key={node.id} 
                  className="transition-all hover:shadow-md hover:border-primary/50 group overflow-hidden"
                >
                  <Link href={`/org/${organizationSlug}/projects/${project.id}/nodes/${node.id}`}>
                    <CardHeader className="cursor-pointer p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-1">
                            {node.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-1 text-xs sm:text-sm">
                            {node.description || "No description"}
                          </CardDescription>
                          {node.designIntent && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-1">
                              Intent: {node.designIntent}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            {node._count.deviations} dev.
                          </Badge>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setNodeToDelete(node.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardHeader>
                  </Link>
                  {node.deviations.length > 0 && (
                    <CardContent className="pt-0 px-3 pb-3 sm:px-4 sm:pb-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        {node.deviations.slice(0, 2).map((dev) => (
                          <div
                            key={dev.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-md bg-muted/50"
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                              <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
                                {dev.guideWord}
                              </Badge>
                              <span className="font-medium text-xs sm:text-sm">{dev.parameter}</span>
                              <span className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:inline">
                                {dev.cause || dev.deviation}
                              </span>
                            </div>
                            <Badge variant={getRiskBadgeVariant(dev.riskLevel)} className="shrink-0 w-fit text-[10px] sm:text-xs">
                              {dev.riskLevel || "Unrated"}
                            </Badge>
                          </div>
                        ))}
                        {node.deviations.length > 2 && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground text-center pt-1">
                            +{node.deviations.length - 2} more
                          </p>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Process Flow Tab */}
        <TabsContent value="flow" className="mt-4 sm:mt-6">
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Workflow className="h-4 w-4 sm:h-5 sm:w-5" />
                Process Flow Diagram
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Interactive flow diagram - drag nodes to reposition, connect them by dragging from node to node
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <FlowDiagram
                nodes={project.nodes}
                canEdit={canEdit}
                onAddNode={handleAddNodeFromTemplate}
                onSavePositions={handleSavePositions}
                onSaveConnections={handleSaveConnections}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Worksheet Tab */}
        <TabsContent value="worksheet" className="mt-4 sm:mt-6">
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                HAZOP Worksheet
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Interactive analysis worksheet - click any cell to edit, assign members, add comments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <InteractiveWorksheet
                  nodes={project.nodes}
                  members={members}
                  canEdit={canEdit}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
          {/* Progress Section */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                Project Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0 space-y-3 sm:space-y-4">
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span>Overall Progress</span>
                  <span className="font-medium">{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  {resolvedDeviations} of {totalDeviations} deviations resolved
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((level) => {
                  const count = riskCounts[level];
                  const colorClass = {
                    CRITICAL: "text-red-500 border-red-500/30 bg-red-500/5",
                    HIGH: "text-orange-500 border-orange-500/30 bg-orange-500/5",
                    MEDIUM: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5",
                    LOW: "text-green-500 border-green-500/30 bg-green-500/5",
                  }[level];
                  return (
                    <div
                      key={level}
                      className={`p-2 sm:p-4 border-2 rounded-lg sm:rounded-xl text-center transition-all hover:shadow-sm ${colorClass}`}
                    >
                      <p className="text-xl sm:text-3xl font-bold">{count}</p>
                      <p className="text-[9px] sm:text-xs text-muted-foreground capitalize mt-0.5 sm:mt-1">
                        {level.toLowerCase()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                {(["OPEN", "IN_PROGRESS", "RESOLVED", "ACCEPTED", "CLOSED"] as const).map((status) => {
                  const count = statusCounts[status];
                  return (
                    <div
                      key={status}
                      className="p-2 sm:p-4 border rounded-lg sm:rounded-xl text-center hover:bg-muted/50 transition-all"
                    >
                      <p className="text-lg sm:text-2xl font-bold">{count}</p>
                      <p className="text-[9px] sm:text-xs text-muted-foreground capitalize mt-0.5 sm:mt-1 truncate">
                        {status.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Nodes Summary */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Nodes Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              {project.nodes.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
                  No nodes created yet
                </p>
              ) : (
                <div className="space-y-1.5 sm:space-y-2">
                  {project.nodes.map((node) => (
                    <Link
                      key={node.id}
                      href={`/org/${organizationSlug}/projects/${project.id}/nodes/${node.id}`}
                      className="flex items-center justify-between gap-2 p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-all group"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-1">
                          {node.name}
                        </span>
                        {node.designIntent && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 hidden sm:block">
                            {node.designIntent}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          {node._count.deviations}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </PersistentTabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!nodeToDelete} onOpenChange={(open) => !open && setNodeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the study node
              and all its associated deviations and connections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteNode} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
