"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

const notifications = [
    { id: 1, title: "Yêu cầu vật tư #YCVT-2025-026", description: "Cần được bạn phê duyệt." },
    { id: 2, title: "Vật tư sắp hết hạn", description: "Mã VT PM-CHEM-OIL-006 còn 5 ngày." },
    { id: 3, title: "Tồn kho dưới mức tối thiểu", description: "Mã VT PM-ELEC-GT-001 đã dưới mức min." },
    { id: 4, title: "Phiếu nhập kho #PNK-2025-015", description: "Đã hoàn thành kiểm tra KCS." },
    { id: 5, title: "Yêu cầu kiểm kê đột xuất", description: "Từ Ban Giám đốc cho Khu A." },
];


export function AppHeader() {
  const userAvatar = PlaceHolderImages.find((p) => p.id === "user-avatar");
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Get initials from user name
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="flex h-16 shrink-0 items-center border-b bg-card sticky top-0 z-20">
      <div className="flex w-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          
          <img
              src="https://skg.com.vn/wp-content/uploads/2024/10/SKG_Only-1400x546.png"
              alt="SKG Logo"
              width={77}
              height={30}
          />
          
          <div className="hidden h-8 items-center gap-4 md:flex">
              <div className="h-full border-l border-border/70" />
              <div>
                  <h1 className="text-base font-semibold tracking-tight">Hệ Thống Quản Lý Kho Thông Minh</h1>
                  <p className="text-xs text-muted-foreground">Smart Warehouse Management System</p>
              </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="relative h-9 w-9 rounded-full"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white ring-2 ring-card">
                  5
                </span>
                <span className="sr-only">Toggle notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex-col items-start cursor-pointer">
                    <div className="font-semibold">{notification.title}</div>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 h-auto p-2 hover:bg-accent">
                <div className="hidden flex-col items-end sm:flex">
                  <span className="font-semibold text-sm">{user?.name || "User"}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.role || "Role"}
                  </span>
                </div>
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={userAvatar?.imageUrl}
                    alt={user?.name || "User"}
                    data-ai-hint={userAvatar?.imageHint}
                  />
                  <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push("/profile")}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Thông tin cá nhân</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
