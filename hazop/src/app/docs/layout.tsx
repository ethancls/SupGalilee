
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { getCurrentUser } from "@/lib/auth";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsSearch } from "@/components/docs/search";
import { TableOfContents } from "@/components/docs/toc";
import { DocsContent } from "@/components/docs/docs-content";

const docsConfig = {
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Overview",
          href: "/docs",
        },
        {
          title: "Methodology",
          href: "/docs/methodology",
        },
        {
          title: "User Guide",
          href: "/docs/user-guide",
        },
        {
          title: "Architecture",
          href: "/docs/architecture",
        },
      ],
    },
  ],
};

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userSession = await getCurrentUser();
  const user = userSession
    ? {
        id: userSession.id,
        name: userSession.name,
        email: userSession.email,
        avatar: userSession.avatar ?? undefined,
        platformRole: userSession.platformRole,
      }
    : null;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SidebarProvider>
        <div className="min-h-screen bg-background flex">
          <Sidebar user={user} />
          <DocsContent>
            <header className="sticky top-0 z-40 w-full border-none *:bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
              <div className="w-full flex h-16 items-center gap-4 px-8 max-w-7xl">
                <div className="flex-1">
                   <DocsSearch />
                </div>
              </div>
            </header>
            <div className="w-full flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-8 max-w-7xl">
              <aside className="top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block overflow-y-auto">
                <DocsSidebar items={docsConfig.sidebarNav} />
              </aside>
              <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_200px]">
                <div className="mx-auto w-full min-w-0 prose dark:prose-invert prose-headings:scroll-mt-20">
                  {children}
                </div>
                <div className="hidden text-sm xl:block">
                  <div className="sticky top-20">
                    <TableOfContents />
                  </div>
                </div>
              </main>
            </div>
          </DocsContent>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
