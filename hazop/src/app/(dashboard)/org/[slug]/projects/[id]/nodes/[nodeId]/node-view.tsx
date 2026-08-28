"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, AlertTriangle, GitBranch, FileText, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { StatusButton } from "@/components/ui/status-button";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard, StatsGrid } from "@/components/ui/stats-card";
import { EmptyState } from "@/components/ui/empty-state";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

interface Node {
  id: string;
  name: string;
  description: string | null;
  designIntent: string | null;
  deviations: Deviation[];
}

interface Project {
  id: string;
  name: string;
}

interface NodeViewProps {
  node: Node;
  project: Project;
  organizationSlug: string;
  userRole: string;
}

export function NodeView({ node: initialNode, project, organizationSlug, userRole }: NodeViewProps) {
  const router = useRouter();
  const [node, setNode] = useState(initialNode);
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isAddingDeviation, setIsAddingDeviation] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // New Deviation State
  const [newDeviation, setNewDeviation] = useState({
    parameter: "",
    guideWord: "",
    deviation: "",
    cause: "",
    consequence: "",
    safeguards: "",
    recommendations: "",
  });

  const canEdit = userRole === "OWNER" || userRole === "ADMIN" || userRole === "MEMBER";

  const handleSaveNode = async () => {
    setSaveStatus("loading");
    try {
      const res = await fetch(`/api/projects/${project.id}/nodes/${node.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: node.name,
          description: node.description,
          designIntent: node.designIntent,
        }),
      });

      if (res.ok) {
        setSaveStatus("success");
        router.refresh();
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Failed to save node", error);
      setSaveStatus("error");
    }
  };

  const handleAddDeviation = async () => {
    setIsAddingDeviation(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/nodes/${node.id}/deviations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDeviation),
      });

      if (res.ok) {
        setNewDeviation({
            parameter: "",
            guideWord: "",
            deviation: "",
            cause: "",
            consequence: "",
            safeguards: "",
            recommendations: "",
        });
        setShowAddDialog(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to add deviation", error);
    } finally {
      setIsAddingDeviation(false);
    }
  };
    
  // Simple risk badge helper
  const getRiskBadgeVariant = (level: string | null) => {
    switch (level) {
      case "CRITICAL": return "destructive";
      case "HIGH": return "destructive";
      case "MEDIUM": return "secondary";
      case "LOW": return "outline";
      default: return "outline";
    }
  };

  // Stats calculations
  const totalDeviations = node.deviations.length;
  const openDeviations = node.deviations.filter(d => d.status === "OPEN").length;
  const withRecommendations = node.deviations.filter(d => d.recommendations).length;
  const highRiskCount = node.deviations.filter(d => d.riskLevel === "HIGH" || d.riskLevel === "CRITICAL").length;

  return (
    <PageContainer>
      <PageHeader
        title={node.name}
        description={node.description || "Study node for HAZOP analysis"}
        backHref={`/org/${organizationSlug}/projects/${project.id}`}
        backLabel={project.name}
        actions={
          canEdit && (
            <StatusButton 
              status={saveStatus} 
              onClick={handleSaveNode}
              onStatusReset={() => setSaveStatus("idle")}
            />
          )
        }
      />

      {/* Stats */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Deviations"
          value={totalDeviations}
          icon={AlertTriangle}
          iconColor="text-orange-500"
        />
        <StatsCard
          title="Open Issues"
          value={openDeviations}
          icon={GitBranch}
          iconColor="text-blue-500"
        />
        <StatsCard
          title="High Risk"
          value={highRiskCount}
          icon={AlertTriangle}
          iconColor="text-red-500"
        />
        <StatsCard
          title="Recommendations"
          value={withRecommendations}
          icon={FileText}
          iconColor="text-green-500"
        />
      </StatsGrid>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Node Definition */}
        <div className="lg:col-span-4 space-y-6">
          <div className="lg:sticky lg:top-24 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Node Definition</CardTitle>
                <CardDescription>Define the boundaries and intent of this node.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Node Name</Label>
                  <Input
                    id="name"
                    value={node.name}
                    onChange={(e) => setNode({ ...node, name: e.target.value })}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={node.description || ""}
                    onChange={(e) => setNode({ ...node, description: e.target.value })}
                    disabled={!canEdit}
                    className="min-h-20 resize-y"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designIntent">Design Intent</Label>
                  <Textarea
                    id="designIntent"
                    value={node.designIntent || ""}
                    onChange={(e) => setNode({ ...node, designIntent: e.target.value })}
                    disabled={!canEdit}
                    placeholder="e.g. Transfer reactants from storage to reactor at 50kg/h and 25°C"
                    className="min-h-30 resize-y font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Deviations */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Deviations</h2>
              <p className="text-sm text-muted-foreground">
                Identified hazards and operability issues for this node.
              </p>
            </div>
            {canEdit && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deviation
                  </Button>
                </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add New Deviation</DialogTitle>
                                    <DialogDescription>
                                        Identify a potential deviation and its causes/consequences.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Parameter</Label>
                                            <Select 
                                                value={newDeviation.parameter}
                                                onValueChange={(val) => setNewDeviation({...newDeviation, parameter: val})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select parameter" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Flow">Flow</SelectItem>
                                                    <SelectItem value="Pressure">Pressure</SelectItem>
                                                    <SelectItem value="Temperature">Temperature</SelectItem>
                                                    <SelectItem value="Level">Level</SelectItem>
                                                    <SelectItem value="Composition">Composition</SelectItem>
                                                    <SelectItem value="Reaction">Reaction</SelectItem>
                                                    <SelectItem value="Phase">Phase</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Guide Word</Label>
                                            <Select 
                                                value={newDeviation.guideWord}
                                                onValueChange={(val) => setNewDeviation({...newDeviation, guideWord: val})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select guide word" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="NO">NO / NONE</SelectItem>
                                                    <SelectItem value="MORE">MORE</SelectItem>
                                                    <SelectItem value="LESS">LESS</SelectItem>
                                                    <SelectItem value="AS WELL AS">AS WELL AS</SelectItem>
                                                    <SelectItem value="PART OF">PART OF</SelectItem>
                                                    <SelectItem value="REVERSE">REVERSE</SelectItem>
                                                    <SelectItem value="OTHER THAN">OTHER THAN</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Deviation Description</Label>
                                        <Input 
                                            placeholder="e.g. No Flow of Cooling Water" 
                                            value={newDeviation.deviation}
                                            onChange={(e) => setNewDeviation({...newDeviation, deviation: e.target.value})}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-destructive/80">Cause</Label>
                                            <Textarea 
                                                placeholder="What causes this deviation?" 
                                                value={newDeviation.cause}
                                                onChange={(e) => setNewDeviation({...newDeviation, cause: e.target.value})}
                                                className="min-h-25"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-destructive/80">Consequence</Label>
                                            <Textarea 
                                                placeholder="What is the impact?" 
                                                value={newDeviation.consequence}
                                                onChange={(e) => setNewDeviation({...newDeviation, consequence: e.target.value})}
                                                className="min-h-25"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-green-600 dark:text-green-400">Safeguards (Existing)</Label>
                                        <Textarea 
                                            placeholder="What protections are already in place?" 
                                            value={newDeviation.safeguards}
                                            onChange={(e) => setNewDeviation({...newDeviation, safeguards: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-blue-600 dark:text-blue-400">Recommendations (Action Items)</Label>
                                        <Textarea 
                                            placeholder="What else should be done?" 
                                            value={newDeviation.recommendations}
                                            onChange={(e) => setNewDeviation({...newDeviation, recommendations: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <StatusButton 
                                        status={isAddingDeviation ? "loading" : "idle"}
                                        onClick={handleAddDeviation}
                                        idleText="Create Deviation"
                                        loadingText="Creating..."
                                        disabled={!newDeviation.parameter || !newDeviation.guideWord}
                                    />
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

          {node.deviations.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No deviations yet"
              description="Start the HAZOP analysis by identifying potential deviations from the design intent."
              action={
                canEdit && (
                  <Button variant="outline" onClick={() => setShowAddDialog(true)}>
                    Add First Deviation
                  </Button>
                )
              }
            />
          ) : (
            <div className="space-y-4">
              {node.deviations.map((dev) => (
                <Card key={dev.id} className="overflow-hidden transition-all hover:shadow-md">
                  <div className="border-b bg-muted/40 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="bg-background text-sm font-medium">
                        {dev.guideWord} {dev.parameter}
                      </Badge>
                      <span className="text-sm font-medium text-muted-foreground">
                        {dev.deviation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRiskBadgeVariant(dev.riskLevel)} className="text-[10px] uppercase">
                        {dev.riskLevel || "Unrated"}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {dev.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 grid md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Causes</span>
                        <p className="text-foreground/90 leading-relaxed">{dev.cause || "—"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Consequences</span>
                        <p className="text-foreground/90 leading-relaxed">{dev.consequence || "—"}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Safeguards</span>
                        <p className="text-foreground/90 leading-relaxed">{dev.safeguards || "—"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Recommendations</span>
                        <p className="text-foreground/90 leading-relaxed">{dev.recommendations || "—"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
