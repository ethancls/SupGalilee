"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function TableOfContents() {
  const [toc, setToc] = React.useState<{ id: string; title: string; level: number }[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Find all h2 and h3 headings in the prose section
    const prose = document.querySelector(".prose");
    if (!prose) return;

    const headings = Array.from(prose.querySelectorAll("h2, h3"));
    const items = headings.map((heading) => {
      // Ensure heading has an ID
      if (!heading.id) {
        heading.id = heading.textContent?.toLowerCase().replace(/\s+/g, "-") || "";
      }
      return {
        id: heading.id,
        title: heading.textContent || "",
        level: heading.tagName === "H2" ? 2 : 3,
      };
    });
    setToc(items);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    headings.forEach((header) => observer.observe(header));

    return () => {
      headings.forEach((header) => observer.unobserve(header));
    };
  }, []);

  if (toc.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">On this page</p>
      <ul className="m-0 list-none">
        {toc.map((item) => (
          <li key={item.id} className={cn("mt-0 pt-2", item.level === 3 && "pl-4")}>
            <a
              href={`#${item.id}`}
              className={cn(
                "inline-block no-underline transition-colors hover:text-foreground text-sm",
                item.id === activeId
                  ? "font-medium text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}