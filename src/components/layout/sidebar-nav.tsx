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
  History,
  UserCog,
  KeyRound,
  ScrollText,
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
      { href: "/inbound", label: "Nhập kho (Inbound)", icon: ArrowDownToLine },
      { href: "/outbound", label: "Xuất kho (Outbound)", icon: ArrowUpFromLine },
      { href: "#", label: "Kiểm kê (Stock Take)", icon: ClipboardList },
      { href: "/lifecycle", label: "Truy vết Vòng đời", icon: History },
    ],
  },
  {
    group: "HỆ THỐNG & BẢO MẬT",
    items: [
      { href: "#", label: "Quản lý Người dùng", icon: UserCog },
      { href: "#", label: "Phân quyền Vai trò", icon: KeyRound },
      { href: "#", label: "Nhật ký Hoạt động", icon: ScrollText },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarContent className="pt-4">
      {navItems.map((group) => (
        <SidebarGroup key={group.label} className="py-0 gap-2">
          <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
          <SidebarMenu className="gap-2">
            {group.items.map((item) => (
              <SidebarMenuItem key={item.label}>
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
