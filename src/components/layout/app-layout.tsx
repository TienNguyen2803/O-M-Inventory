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
      <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar>
            <SidebarNav />
          </Sidebar>
          <SidebarInset className="w-full overflow-y-auto p-2 md:p-4 pt-6">
             {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
