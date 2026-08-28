"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  maxLength?: number;
  className?: string;
  expandLabel?: string;
  collapseLabel?: string;
}

export function ExpandableText({
  text,
  maxLines = 2,
  maxLength = 150,
  className,
  expandLabel = "Show more",
  collapseLabel = "Show less",
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if text needs truncation
  const needsTruncation = text.length > maxLength;
  
  if (!needsTruncation) {
    return (
      <p className={cn("text-muted-foreground", className)}>
        {text}
      </p>
    );
  }

  const lineClampClass = {
    1: "line-clamp-1",
    2: "line-clamp-2",
    3: "line-clamp-3",
    4: "line-clamp-4",
    5: "line-clamp-5",
  }[maxLines] || "line-clamp-2";

  return (
    <div className="space-y-1">
      <p
        className={cn(
          "text-muted-foreground transition-all",
          !isExpanded && lineClampClass,
          className
        )}
      >
        {text}
      </p>
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <>
            {collapseLabel}
            <ChevronUp className="ml-1 h-3 w-3" />
          </>
        ) : (
          <>
            {expandLabel}
            <ChevronDown className="ml-1 h-3 w-3" />
          </>
        )}
      </Button>
    </div>
  );
}
