"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard, StatsGrid } from "@/components/ui/stats-card";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CriticalDeleteDialog } from "@/components/ui/critical-delete-dialog";
import { StatusButton } from "@/components/ui/status-button";
import {
  Building2,
  Trash2,
  Users,
  FolderKanban,
  AlertTriangle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface OrganizationSettings {
  id: string;
  allowMemberInvites: boolean;
  requireAdminApproval: boolean;
  notifyOnMemberJoin: boolean;
  notifyOnProjectCreate: boolean;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  settings: OrganizationSettings | null;
  _count: {
    members: number;
    projects: number;
    teams: number;
  };
}

interface OrgSettingsViewProps {
  organization: Organization;
}

export function OrgSettingsView({ organization }: OrgSettingsViewProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const [form, setForm] = useState({
    name: organization.name,
    description: organization.description || "",
  });

  const [settings, setSettings] = useState({
    allowMemberInvites: organization.settings?.allowMemberInvites ?? false,
    requireAdminApproval: organization.settings?.requireAdminApproval ?? false,
    notifyOnMemberJoin: organization.settings?.notifyOnMemberJoin ?? true,
    notifyOnProjectCreate: organization.settings?.notifyOnProjectCreate ?? true,
  });

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");

    try {
      const res = await fetch(`/api/organizations/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, settings }),
      });

      if (res.ok) {
        setSaveStatus("success");
        router.refresh();
        // Reset status after 3 seconds
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        const data = await res.json();
        console.error("Failed to save:", data.error);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch {
      console.error("Failed to save settings");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/organizations/${organization.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  };

  // handleCopyName removed as unused

  return (
    <PageContainer>
      <PageHeader
        title="Organization Settings"
        description={`Manage settings for ${organization.name}`}
      />

      {/* Stats Overview */}}
      <StatsGrid columns={2}>
        <StatsCard
          title="Members"
          value={organization._count.members}
          icon={Users}
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Projects"
          value={organization._count.projects}
          icon={FolderKanban}
          iconColor="text-green-500"
        />
      </StatsGrid>

      {/* AI Configuration Link */}
      <Link href={`/org/${organization.slug}/settings/ai`}>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">AI Configuration</CardTitle>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
        </Card>
      </Link>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            General Information
          </CardTitle>
          <CardDescription>
            Basic organization details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/org/</span>
              <Input
                id="slug"
                value={organization.slug}
                disabled
                className="bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The URL slug cannot be changed after creation to maintain consistent links.
            </p>
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
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            Control access and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow member invites</Label>
              <p className="text-sm text-muted-foreground">
                Non-admin members can invite others
              </p>
            </div>
            <Switch
              checked={settings.allowMemberInvites}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, allowMemberInvites: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Require admin approval</Label>
              <p className="text-sm text-muted-foreground">
                New members need admin approval
              </p>
            </div>
            <Switch
              checked={settings.requireAdminApproval}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, requireAdminApproval: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Notify on member join</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when members join
              </p>
            </div>
            <Switch
              checked={settings.notifyOnMemberJoin}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, notifyOnMemberJoin: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Notify on project creation</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for new projects
              </p>
            </div>
            <Switch
              checked={settings.notifyOnProjectCreate}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, notifyOnProjectCreate: checked }))
              }
            />
          </div>
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
              <p className="font-medium">Delete organization</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this organization and all its data
              </p>
            </div>
            <CriticalDeleteDialog
              title="Delete Organization?"
              validationText={organization.name}
              confirmButtonText="Delete Organization"
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
                    This will permanently delete <strong>{organization.name}</strong> and all its data including:
                  </p>
                  <ul className="list-disc list-inside text-sm">
                    <li>{organization._count.projects} projects</li>
                    <li>{organization._count.members} member associations</li>
                    <li>All nodes and deviations</li>
                  </ul>
                  <p>This action cannot be undone.</p>
                </div>
              }
            />
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
