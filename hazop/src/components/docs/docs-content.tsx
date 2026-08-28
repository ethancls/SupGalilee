"use client";

import { useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";

export function DocsContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "flex-1 flex flex-col min-w-0 transition-[padding-left] duration-300 ease-out",
        isCollapsed ? "pl-16" : "pl-72"
      )}
    >
      {children}
    </div>
  );
}