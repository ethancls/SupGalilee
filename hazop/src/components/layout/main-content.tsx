"use client";

import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main
      className={cn(
        "transition-[padding-left] duration-300 ease-out",
        isCollapsed ? "pl-16" : "pl-72"
      )}
    >
      <div className="min-h-screen">{children}</div>
    </main>
  );
}
