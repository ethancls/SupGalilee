"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard, StatsGrid } from "@/components/ui/stats-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PersistentTabs, TabsContent } from "@/components/ui/persistent-tabs";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Calendar,
  TrendingUp,
  Briefcase,
  AlertTriangle,
  FileText,
  Users,
  Settings,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Assignment {
  id: string;
  role: string;
  status: string;
  dueDate: string | null;
  notes: string | null;
  deviation: {
    id: string;
    parameter: string;
    guideWord: string;
    status: string;
    riskLevel: string | null;
    node: {
      id: string;
      name: string;
      project: {
        id: string;
        name: string;
        organizationId: string;
      };
    };
  };
}

interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface Mention {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  deviation: {
    id: string;
    parameter: string;
    guideWord: string;
    node: {
      id: string;
      name: string;
      project: {
        id: string;
        name: string;
        organizationId: string;
      };
    };
  };
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface ActivityViewProps {
  user: UserInfo;
  assignments: Assignment[];
  recentActivity: Activity[];
  mentions: Mention[];
  overdueCount: number;
  orgMap: Record<string, string>;
}

export function ActivityView({
  assignments,
  recentActivity,
  mentions,
  overdueCount,
  orgMap,
}: ActivityViewProps) {
  const now = new Date();
  const currentTime = now.getTime();

  const getAssignmentStatus = (assignment: Assignment) => {
    if (assignment.dueDate && new Date(assignment.dueDate) < now) {
      return { label: "Overdue", color: "text-red-500", bgColor: "bg-red-500/10", icon: AlertTriangle };
    }
    if (assignment.status === "IN_PROGRESS") {
      return { label: "In Progress", color: "text-blue-500", bgColor: "bg-blue-500/10", icon: Clock };
    }
    if (assignment.status === "PENDING") {
      return { label: "Pending", color: "text-orange-500", bgColor: "bg-orange-500/10", icon: AlertCircle };
    }
    return { label: assignment.status, color: "text-muted-foreground", bgColor: "bg-muted", icon: CheckCircle2 };
  };

  const getActivityIcon = (action: string) => {
    if (action.includes("PROJECT")) return Briefcase;
    if (action.includes("DEVIATION")) return AlertTriangle;
    if (action.includes("COMMENT")) return MessageSquare;
    if (action.includes("MEMBER")) return Users;
    if (action.includes("NODE")) return FileText;
    return Settings;
  };

  const getActivityLabel = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatRelativeTime = (date: string) => {
    const diff = currentTime - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const weekActivity = recentActivity.filter(
    (a) => new Date(a.createdAt).getTime() > currentTime - 7 * 24 * 60 * 60 * 1000
  ).length;

  const tabs = [
    { value: "assignments", label: "My Assignments", count: assignments.length, icon: <ClipboardList className="h-4 w-4" /> },
    { value: "mentions", label: "Mentions", count: mentions.length, icon: <MessageSquare className="h-4 w-4" /> },
    { value: "activity", label: "Recent Activity", icon: <TrendingUp className="h-4 w-4" /> },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="My Tasks"
        description="Track your assignments, mentions, and recent activity"
      />

      {/* Summary Cards */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Active Assignments"
          value={assignments.length}
          description="Across all projects"
          icon={Briefcase}
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Overdue"
          value={overdueCount}
          description="Need immediate attention"
          icon={AlertTriangle}
          iconColor="text-red-500"
        />
        <StatsCard
          title="Mentions"
          value={mentions.length}
          description="In comments"
          icon={MessageSquare}
          iconColor="text-purple-500"
        />
        <StatsCard
          title="This Week"
          value={weekActivity}
          description="Activities logged"
          icon={TrendingUp}
          iconColor="text-green-500"
        />
      </StatsGrid>

      {/* Tabs */}
      <PersistentTabs
        storageKey="my-tasks-tab"
        defaultValue="assignments"
        tabs={tabs}
        className="space-y-4"
      >
        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4 mt-4">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <EmptyState
                  icon={Briefcase}
                  title="No active assignments"
                  description="You don't have any active assignments at the moment."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {assignments.map((assignment) => {
                const status = getAssignmentStatus(assignment);
                const StatusIcon = status.icon;
                const orgSlug = orgMap[assignment.deviation.node.project.organizationId];

                return (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="shrink-0">
                              {assignment.deviation.guideWord}
                            </Badge>
                            <CardTitle className="text-base truncate">
                              {assignment.deviation.parameter}
                            </CardTitle>
                          </div>
                          <CardDescription className="truncate">
                            {assignment.deviation.node.name} • {assignment.deviation.node.project.name}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={assignment.deviation.riskLevel === "CRITICAL" ? "destructive" : "outline"}
                          className="shrink-0"
                        >
                          {assignment.deviation.riskLevel || "Unrated"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-wrap text-sm">
                          <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md", status.bgColor)}>
                            <StatusIcon className={cn("h-3.5 w-3.5", status.color)} />
                            <span className={cn("text-xs font-medium", status.color)}>{status.label}</span>
                          </div>
                          {assignment.dueDate && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span className="text-xs">Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {assignment.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button size="sm" variant="outline" asChild className="flex-1 sm:flex-none">
                            <Link href={`/org/${orgSlug}/projects/${assignment.deviation.node.project.id}/nodes/${assignment.deviation.node.id}?deviation=${assignment.deviation.id}`}>
                              View Node
                            </Link>
                          </Button>
                          <Button size="sm" asChild className="flex-1 sm:flex-none">
                            <Link href={`/org/${orgSlug}/projects/${assignment.deviation.node.project.id}?tab=worksheet&deviation=${assignment.deviation.id}`}>
                              Traiter
                            </Link>
                          </Button>
                        </div>
                      </div>
                      {assignment.notes && (
                        <p className="mt-3 text-sm text-muted-foreground border-t pt-3">
                          Note: {assignment.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Mentions Tab */}
        <TabsContent value="mentions" className="space-y-4 mt-4">
          {mentions.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <EmptyState
                  icon={MessageSquare}
                  title="No mentions"
                  description="Nobody has mentioned you in comments yet."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {mentions.map((mention) => {
                const orgSlug = orgMap[mention.deviation.node.project.organizationId];

                return (
                  <Card key={mention.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={mention.user.avatar || undefined} />
                          <AvatarFallback>
                            {mention.user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{mention.user.name}</span>
                            <span className="text-sm text-muted-foreground">mentioned you</span>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(mention.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm">{mention.content}</p>
                          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {mention.deviation.guideWord}
                            </Badge>
                            <span>{mention.deviation.parameter}</span>
                            <span>•</span>
                            <span className="truncate">{mention.deviation.node.project.name}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild className="shrink-0">
                          <Link href={`/org/${orgSlug}/projects/${mention.deviation.node.project.id}/nodes/${mention.deviation.node.id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest actions across all your organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No recent activity"
                  description="Activity will appear here as you and your team work on projects."
                />
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.action);
                    let metadata: Record<string, unknown> = {};
                    try {
                      metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
                    } catch {}

                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0"
                      >
                        <div className="mt-1 shrink-0">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Avatar className="h-6 w-6 shrink-0">
                              <AvatarImage src={activity.user.avatar || undefined} />
                              <AvatarFallback className="text-xs">
                                {activity.user.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{activity.user.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {getActivityLabel(activity.action)}
                            </span>
                          </div>
                          {typeof metadata.deviationName === 'string' && metadata.deviationName && (
                            <p className="text-xs text-muted-foreground truncate">
                              {metadata.deviationName}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {formatRelativeTime(activity.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </PersistentTabs>
    </PageContainer>
  );
}
