"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Deviation {
  id: string;
  guideWord: string;
  parameter: string;
  deviation: string;
  cause: string | null;
  consequence: string | null;
  safeguard: string | null;
  recommendation: string | null;
  riskRating: number | null;
  status: string;
}

interface Node {
  id: string;
  name: string;
  description: string | null;
  deviations: Deviation[];
}

interface Project {
  id: string;
  name: string;
  status: string;
  nodes: Node[];
}

interface AnalysisViewProps {
  projects: Project[];
}

const GUIDE_WORDS = ["NO", "MORE", "LESS", "REVERSE", "PART OF", "AS WELL AS", "OTHER THAN"];
const PARAMETERS = ["Flow", "Temperature", "Pressure", "Level", "Time", "Composition", "pH", "Speed"];

export function AnalysisView({ projects }: AnalysisViewProps) {
  const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.id || "");
  const [selectedNode, setSelectedNode] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const currentProject = projects.find((p) => p.id === selectedProject);
  const currentNode = currentProject?.nodes.find((n) => n.id === selectedNode);

  // Get all deviations for the current view
  const getAllDeviations = () => {
    if (!currentProject) return [];
    if (currentNode) return currentNode.deviations;
    return currentProject.nodes.flatMap((n) => 
      n.deviations.map((d) => ({ ...d, nodeName: n.name }))
    );
  };

  const deviations = getAllDeviations();
  
  const filteredDeviations = deviations.filter((d) => {
    const matchesSearch = 
      d.deviation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.cause?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.consequence?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getRiskColor = (rating: number | null) => {
    if (!rating) return "bg-muted text-muted-foreground";
    if (rating >= 15) return "bg-red-500 text-white";
    if (rating >= 8) return "bg-orange-500 text-white";
    if (rating >= 4) return "bg-yellow-500 text-black";
    return "bg-green-500 text-white";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "IN_REVIEW":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "CLOSED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  // Stats
  const openCount = deviations.filter((d) => d.status === "OPEN").length;
  const highRiskCount = deviations.filter((d) => (d.riskRating || 0) >= 15).length;
  const totalCount = deviations.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">HAZOP Analysis</h1>
            <p className="text-sm text-muted-foreground">
              Manage and review your HAZOP study deviations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deviation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Deviation</DialogTitle>
                  <DialogDescription>
                    Create a new deviation entry for your HAZOP analysis.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Guide Word</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select guide word" />
                        </SelectTrigger>
                        <SelectContent>
                          {GUIDE_WORDS.map((gw) => (
                            <SelectItem key={gw} value={gw}>{gw}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Parameter</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parameter" />
                        </SelectTrigger>
                        <SelectContent>
                          {PARAMETERS.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cause</Label>
                    <Textarea placeholder="Describe the potential cause..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Consequence</Label>
                    <Textarea placeholder="Describe the potential consequence..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Safeguard</Label>
                    <Textarea placeholder="Existing safeguards..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Recommendation</Label>
                    <Textarea placeholder="Recommended actions..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)}>
                    Add Deviation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="w-50">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[200px]">
            <Select value={selectedNode} onValueChange={setSelectedNode}>
              <SelectTrigger>
                <SelectValue placeholder="All nodes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All nodes</SelectItem>
                {currentProject?.nodes.map((n) => (
                  <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deviations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_REVIEW">In Review</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCount}</p>
                <p className="text-sm text-muted-foreground">Total Deviations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openCount}</p>
                <p className="text-sm text-muted-foreground">Open Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{highRiskCount}</p>
                <p className="text-sm text-muted-foreground">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalCount > 0 ? Math.round(((totalCount - openCount) / totalCount) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 pb-6">
        <Card className="h-full">
          <CardContent className="p-0">
            {filteredDeviations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No deviations found</h3>
                <p className="text-muted-foreground text-sm">
                  {projects.length === 0 
                    ? "Create a project to start your HAZOP analysis" 
                    : "Add deviations to begin your analysis"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[150px]">Deviation</TableHead>
                    <TableHead>Cause</TableHead>
                    <TableHead>Consequence</TableHead>
                    <TableHead>Safeguard</TableHead>
                    <TableHead className="w-[80px]">Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeviations.map((d) => (
                    <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(d.status)}
                          <span className="text-sm">{d.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{d.deviation}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {d.cause || "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {d.consequence || "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {d.safeguard || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("font-mono", getRiskColor(d.riskRating))}>
                          {d.riskRating || "-"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
