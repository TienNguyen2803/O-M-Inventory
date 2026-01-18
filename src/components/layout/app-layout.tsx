import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <main className="flex-1 bg-background">
          <SidebarInset>{children}</SidebarInset>
        </main>
      </div>
    </SidebarProvider>
  );
}
