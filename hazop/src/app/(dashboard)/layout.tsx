import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { MainContent } from "@/components/layout/main-content";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SidebarProvider>
        <div className="min-h-screen bg-background">
          <Sidebar user={user} />
          <MainContent>{children}</MainContent>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
