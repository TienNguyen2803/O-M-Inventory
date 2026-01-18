"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Warehouse,
  Users,
  ClipboardCheck,
  ShoppingBasket,
  Gavel,
  ClipboardList,
  Hammer,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    group: "BÁO CÁO & PHÂN TÍCH",
    items: [
      { href: "/", label: "Tổng quan", icon: LayoutDashboard },
      { href: "#", label: "Báo cáo nhập, xuất, tồn", icon: ClipboardList },
      { href: "#", label: "Vật tư chậm luân chuyển", icon: ShoppingBasket },
      { href: "#", label: "Định mức tồn kho an toàn", icon: Hammer },
    ],
  },
  {
    group: "KẾ HOẠCH & MUA SẮM",
    items: [
      {
        href: "/material-requests",
        label: "Yêu cầu Vật tư",
        icon: ClipboardCheck,
      },
      {
        href: "/purchase-requests",
        label: "Yêu cầu Mua sắm",
        icon: ShoppingBasket,
      },
      { href: "/biddings", label: "Quản lý Đấu thầu", icon: Gavel },
    ],
  },
  {
    group: "DỮ LIỆU DANH MỤC",
    items: [
      { href: "/materials", label: "Danh mục Vật tư", icon: Package },
      { href: "/warehouses", label: "Danh mục Kho", icon: Warehouse },
      { href: "/suppliers", label: "Nhà cung cấp", icon: Users },
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

  return (
    <SidebarContent className="pt-4">
      {navItems.map((group) => (
        <SidebarGroup key={group.group} className="p-1.5">
          <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
          <SidebarMenu className="gap-1.5">
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
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
