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
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar>
            <SidebarNav />
          </Sidebar>
          <SidebarInset className="overflow-y-auto pt-6 px-4 md:px-8">
             {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
