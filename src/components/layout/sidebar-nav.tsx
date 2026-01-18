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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <SidebarContent className="pt-4">
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
  );
}
