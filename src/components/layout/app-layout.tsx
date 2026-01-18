import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppHeader } from "./app-header";
import { SidebarNav } from "./sidebar-nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <div className="flex w-full flex-1 flex-col overflow-hidden">
          <AppHeader />
          <SidebarInset className="overflow-y-auto">
             {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
