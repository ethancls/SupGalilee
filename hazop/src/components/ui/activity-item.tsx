"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface ActivityItemProps {
  user: {
    name: string;
    avatar?: string | null;
  };
  action: string;
  timestamp: string;
  icon?: LucideIcon;
  iconColor?: string;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "outline" | "destructive";
  };
  metadata?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
}

export function ActivityItem({
  user,
  action,
  timestamp,
  icon: Icon,
  iconColor = "text-muted-foreground",
  badge,
  metadata,
  extra,
  className,
}: ActivityItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0",
        className
      )}
    >
      {Icon && (
        <div className="mt-1 shrink-0">
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      )}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="text-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm truncate">{user.name}</span>
          <span className="text-sm text-muted-foreground truncate">{action}</span>
          {badge && (
            <Badge variant={badge.variant || "outline"} className="text-xs shrink-0">
              {badge.label}
            </Badge>
          )}
        </div>
        {metadata && <div className="text-xs text-muted-foreground">{metadata}</div>}
      </div>
      <div className="text-right shrink-0">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {timestamp}
        </span>
        {extra}
      </div>
    </div>
  );
}

interface ActivityListProps {
  children: React.ReactNode;
  className?: string;
}

export function ActivityList({ children, className }: ActivityListProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
