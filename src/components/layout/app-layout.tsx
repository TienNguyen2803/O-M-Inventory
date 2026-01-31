"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppHeader } from "./app-header";
import { SidebarNav } from "./sidebar-nav";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const isLoginPage = pathname === "/login";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      router.push("/login");
    }
  }, [user, isLoading, isLoginPage, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Login page - render without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Not authenticated - show nothing (will redirect)
  if (!user) {
    return null;
  }

  // Authenticated - render full layout
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar>
            <SidebarNav />
          </Sidebar>
          <SidebarInset className="w-full overflow-y-auto p-2 md:p-4">
            {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
