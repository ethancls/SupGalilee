"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Beaker, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface NewProjectFormProps {
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
}

export function NewProjectForm({ organizationId, organizationSlug, organizationName }: NewProjectFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "DRAFT",
  });
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const handleGenerateWithAI = async () => {
    if (!aiInput.trim()) {
      setAiError("Please describe your project idea");
      return;
    }

    setIsGenerating(true);
    setAiError("");

    try {
      const res = await fetch(`/api/organizations/${organizationSlug}/ai/generate-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: aiInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAiError(data.error || "Failed to generate project details");
        return;
      }

      // Fill the form with AI-generated data
      setFormData((prev) => ({
        ...prev,
        name: data.name,
        description: data.description,
      }));

      setAiDialogOpen(false);
      setAiInput("");
    } catch {
      setAiError("An error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          organizationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create project");
        return;
      }

      router.push(`/org/${organizationSlug}/projects/${data.id}`);
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/org/${organizationSlug}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to {organizationName}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New HAZOP Project</h1>
        <p className="text-muted-foreground mt-1">
          Create a new process safety study
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Project Details
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>Define the basic information for your HAZOP study</span>
            <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Assistant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Project Assistant
                  </DialogTitle>
                  <DialogDescription>
                    Describe your process or system briefly, and AI will generate a professional project name and detailed description for your HAZOP study.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {aiError && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                      {aiError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="ai-input">Your Project Idea</Label>
                    <Textarea
                      id="ai-input"
                      placeholder="e.g., A chemical reactor that processes ethanol at 150°C and 5 bar, with cooling water system..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      rows={6}
                      disabled={isGenerating}
                    />
                    <p className="text-xs text-muted-foreground">
                      Include: process type, key equipment, materials, operating conditions, safety concerns
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAiDialogOpen(false)}
                    disabled={isGenerating}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateWithAI} disabled={isGenerating}>
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
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="e.g., Reactor System HAZOP Study"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">
                A descriptive name for the process or system being analyzed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the process, system boundaries, and objectives of this HAZOP study..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
