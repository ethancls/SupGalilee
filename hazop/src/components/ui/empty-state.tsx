"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateActionObject {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateActionObject | React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const isActionObject = action && typeof action === 'object' && 'label' in action;
  const actionObj = isActionObject ? action as EmptyStateActionObject : null;
  const ActionIcon = actionObj?.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-3">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {isActionObject && actionObj ? (
            actionObj.href ? (
              <Button asChild>
                <Link href={actionObj.href}>
                  {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
                  {actionObj.label}
                </Link>
              </Button>
            ) : (
              <Button onClick={actionObj.onClick}>
                {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
                {actionObj.label}
              </Button>
            )
          ) : (
            action as React.ReactNode
          )}
        </div>
      )}
    </div>
  );
}
