"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard, StatsGrid } from "@/components/ui/stats-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Activity,
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  AlertTriangle,
  MessageSquare,
  FileText,
  Settings,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface Project {
  id: string;
  name: string;
}

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: User;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface Stats {
  total: number;
  last7Days: number;
  last30Days: number;
  byAction: Record<string, number>;
  byUser: Record<string, number>;
}

interface AdminActivityViewProps {
  organization: Organization;
  activities: ActivityLog[];
  stats: Stats;
  members: User[];
  projects: Project[];
}

export function AdminActivityView({
  organization,
  activities,
  stats,
  members,
}: AdminActivityViewProps) {
  const currentTime = new Date().getTime();
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique actions
  const uniqueActions = Array.from(
    new Set(activities.map((a) => a.action))
  ).sort();

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    if (filterUser !== "all" && activity.user.id !== filterUser) return false;
    if (filterAction !== "all" && activity.action !== filterAction) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesUser = activity.user.name.toLowerCase().includes(query);
      const matchesAction = activity.action.toLowerCase().includes(query);

      if (!matchesUser && !matchesAction) return false;
    }

    return true;
  });

  const getActivityIcon = (action: string) => {
    if (action.includes("PROJECT")) return Briefcase;
    if (action.includes("DEVIATION")) return AlertTriangle;
    if (action.includes("COMMENT")) return MessageSquare;
    if (action.includes("MEMBER")) return Users;
    if (action.includes("NODE")) return FileText;
    return Settings;
  };

  const getActivityColor = (action: string) => {
    if (action.includes("CREATED")) return "text-green-500";
    if (action.includes("DELETED")) return "text-red-500";
    if (action.includes("UPDATED")) return "text-blue-500";
    return "text-muted-foreground";
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

  // Top contributors
  const topContributors = Object.entries(stats.byUser)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([userId, count]) => ({
      user: members.find((m) => m.id === userId),
      count,
    }));

  // Top actions
  const topActions = Object.entries(stats.byAction)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const filters = [
    {
      id: "search",
      label: "Search",
      type: "search" as const,
      placeholder: "Search activities...",
      value: searchQuery,
      onChange: setSearchQuery,
    },
    {
      id: "user",
      label: "User",
      type: "select" as const,
      placeholder: "All Users",
      value: filterUser,
      onChange: setFilterUser,
      options: [
        { value: "all", label: "All Users" },
        ...members.map((m) => ({ value: m.id, label: m.name })),
      ],
    },
    {
      id: "action",
      label: "Action Type",
      type: "select" as const,
      placeholder: "All Actions",
      value: filterAction,
      onChange: setFilterAction,
      options: [
        { value: "all", label: "All Actions" },
        ...uniqueActions.map((a) => ({ value: a, label: getActivityLabel(a) })),
      ],
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Activity Logs"
        description={`Monitor all activities in ${organization.name}`}
      />

      {/* Stats Cards */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Activities"
          value={stats.total}
          description="All time"
          icon={Activity}
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Last 7 Days"
          value={stats.last7Days}
          description="Recent activity"
          icon={TrendingUp}
          iconColor="text-green-500"
        />
        <StatsCard
          title="Last 30 Days"
          value={stats.last30Days}
          description="This month"
          icon={Calendar}
          iconColor="text-purple-500"
        />
        <StatsCard
          title="Active Users"
          value={Object.keys(stats.byUser).length}
          description="Contributing members"
          icon={Users}
          iconColor="text-orange-500"
        />
      </StatsGrid>

      {/* Top Contributors & Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            {topContributors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {topContributors.map(({ user, count }, idx) => {
                  if (!user) return null;
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground w-4">
                          #{idx + 1}
                        </span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback className="text-xs">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">{user.name}</span>
                      </div>
                      <Badge variant="secondary">{count} actions</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Common Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {topActions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {topActions.map(([action, count], idx) => {
                  const Icon = getActivityIcon(action);
                  return (
                    <div
                      key={action}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground w-4">
                          #{idx + 1}
                        </span>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getActivityLabel(action)}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        resultCount={filteredActivities.length}
        totalCount={activities.length}
      />

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>
            Real-time activity log with detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <EmptyState
              icon={History}
              title="No activities match your filters"
              description="Try adjusting your filters to see more results."
            />
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => {
                const Icon = getActivityIcon(activity.action);
                const colorClass = getActivityColor(activity.action);
                let metadata: Record<string, unknown> = {};
                try {
                  metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
                } catch {}

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0"
                  >
                    <div className={cn("mt-1 shrink-0", colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarImage src={activity.user.avatar || undefined} />
                          <AvatarFallback className="text-xs">
                            {activity.user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {activity.user.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {getActivityLabel(activity.action)}
                        </span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {activity.entityType}
                        </Badge>
                      </div>
                      {typeof metadata.deviationName === 'string' && metadata.deviationName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {metadata.deviationName}
                        </p>
                      )}
                      {activity.ipAddress && (
                        <p className="text-xs text-muted-foreground">
                          IP: {activity.ipAddress}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-muted-foreground block">
                        {formatRelativeTime(activity.createdAt)}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
