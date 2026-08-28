"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocsSidebarProps {
  items: {
    title: string;
    items: {
      title: string;
      href: string;
    }[];
  }[];
}

export function DocsSidebar({ items }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-full">
      <ScrollArea className="h-full py-6 pr-6 lg:py-8">
        <div className="w-full">
          {items.map((item, index) => (
            <div key={index} className="pb-4">
              <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
                {item.title}
              </h4>
              {item.items?.length && (
                <div className="grid grid-flow-row auto-rows-max text-sm">
                  {item.items.map((subItem, index) => (
                    <Link
                      key={index}
                      href={subItem.href}
                      className={cn(
                        "group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline text-muted-foreground",
                        pathname === subItem.href
                          ? "font-medium text-foreground"
                          : ""
                      )}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
