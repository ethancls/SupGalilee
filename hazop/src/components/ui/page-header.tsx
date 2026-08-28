"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

export interface PageHeaderAction {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  disabled?: boolean;
  loading?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Max characters before truncating description */
  descriptionMaxLength?: number;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "outline" | "destructive";
  } | React.ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: PageHeaderAction[] | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  descriptionMaxLength = 120,
  badge,
  backHref,
  backLabel = "Back",
  actions,
  children,
  className,
}: PageHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const needsTruncation = description && description.length > descriptionMaxLength;

  return (
    <div className={cn("space-y-1", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {badge && (
              typeof badge === 'object' && 'label' in badge ? (
                <Badge variant={badge.variant || "outline"} className="capitalize">
                  {badge.label}
                </Badge>
              ) : badge
            )}
          </div>
          {description && (
            <div className="space-y-0.5">
              <p className={cn(
                "text-muted-foreground text-sm",
                !isExpanded && needsTruncation && "line-clamp-2"
              )}>
                {description}
              </p>
              {needsTruncation && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      Show less
                      <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      Show more
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
          {children}
        </div>
        {actions && (
          Array.isArray(actions) ? (
            actions.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  const button = (
                    <Button
                      key={index}
                      variant={action.variant || "default"}
                      onClick={action.onClick}
                      disabled={action.disabled || action.loading}
                    >
                      {action.loading ? (
                        <svg
                          className="h-4 w-4 mr-2 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      ) : Icon ? (
                        <Icon className="h-4 w-4 mr-2" />
                      ) : null}
                      {action.label}
                    </Button>
                  );

                  if (action.href) {
                    return (
                      <Link key={index} href={action.href}>
                        {button}
                      </Link>
                    );
                  }
                  return button;
                })}
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )
        )}
      </div>
    </div>
  );
}
