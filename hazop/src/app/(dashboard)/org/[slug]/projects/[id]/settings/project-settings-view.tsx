"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StatusButton } from "@/components/ui/status-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CriticalDeleteDialog } from "@/components/ui/critical-delete-dialog";
import {
  ArrowLeft,
  Trash2,
  AlertTriangle,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  nodeCount: number;
}

interface ProjectSettingsViewProps {
  project: Project;
  organizationSlug: string;
  userRole: string;
}

export function ProjectSettingsView({ project, organizationSlug, userRole }: ProjectSettingsViewProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const [form, setForm] = useState({
    name: project.name,
    description: project.description || "",
    status: project.status,
  });

  const canDelete = userRole === "OWNER" || userRole === "ADMIN";

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSaveStatus("success");
        router.refresh();
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push(`/org/${organizationSlug}`);
      router.refresh();
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/org/${organizationSlug}/projects/${project.id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to project
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Project Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage settings for {project.name}
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            Basic project details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>
            Read-only project metadata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Created by</dt>
              <dd className="font-medium">{project.createdBy}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Study nodes</dt>
              <dd className="font-medium">{project.nodeCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last updated</dt>
              <dd className="font-medium">{new Date(project.updatedAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3 items-center">
        <StatusButton
          onClick={handleSave}
          status={saving ? "loading" : saveStatus}
          loadingText="Saving..."
          successText="Saved"
          idleText="Save Changes"
        />
      </div>

            {/* Danger Zone */}
            {canDelete && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delete project</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete this project and all its data
                      </p>
                    </div>
                    <CriticalDeleteDialog
                      title="Delete Project?"
                      validationText={project.name}
                      confirmButtonText="Delete Project"
                      onConfirm={handleDelete}
                      trigger={
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      }
                      description={
                        <div className="space-y-4">
                          <p>
                            This will permanently delete <strong>{project.name}</strong> and all associated study nodes and deviations. This action cannot be undone.
                          </p>
                        </div>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      }
