"use client";

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  Zap,
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Warehouse,
  Factory,
  ShoppingCart,
  Users,
  ShieldCheck,
  FileText,
  History,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const navItems = [
  {
    group: "BÁO CÁO & PHÂN TÍCH",
    items: [{ href: "/", label: "Tổng quan", icon: LayoutDashboard }],
  },
  {
    group: "DỮ LIỆU DANH MỤC",
    items: [
      { href: "/materials", label: "Danh mục Vật tư", icon: Package },
      { href: "/warehouses", label: "Danh mục Kho", icon: Warehouse },
    ],
  },
  {
    group: "VẬN HÀNH KHO",
    items: [
      { href: "/inbound", label: "Nhập kho", icon: ArrowDownToLine },
      { href: "/outbound", label: "Xuất kho", icon: ArrowUpFromLine },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const userAvatar = PlaceHolderImages.find((p) => p.id === "user-avatar");

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <Zap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold">PowerTrack</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((group) => (
            <SidebarGroup key={group.group}>
              <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="justify-start"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarGroup>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={userAvatar?.imageUrl}
              alt="User"
              data-ai-hint={userAvatar?.imageHint}
            />
            <AvatarFallback>VA</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-sm">Nguyễn Văn A</span>
            <span className="text-xs text-muted-foreground">
              Trưởng bộ phận Kho
            </span>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
}
