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
  Award,
  ClipboardList,
  History,
  UserCog,
  KeyRound,
  ScrollText,
  Hourglass,
  GaugeCircle,
  ClipboardPaste,
  Archive,
  ScanLine,
  PackageSearch,
  Truck,
  QrCode,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    group: "BÁO CÁO & PHÂN TÍCH",
    items: [
      { href: "/", label: "Tổng quan", icon: LayoutDashboard },
      {
        href: "/reports/inventory",
        label: "Báo cáo nhập, xuất, tồn",
        icon: ClipboardList,
      },
      { href: "/reports/slow-moving", label: "Vật tư chậm luân chuyển", icon: Hourglass },
      { href: "/reports/safety-stock", label: "Định mức tồn kho an toàn", icon: GaugeCircle },
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
      { href: "/biddings", label: "Quản lý Đấu thầu", icon: Award },
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
      { href: "/put-away", label: "Xếp hàng vào kho", icon: Archive },
      { href: "/quick-store", label: "Cất hàng nhanh", icon: ScanLine },
      { href: "/outbound", label: "Xuất kho (Outbound)", icon: ArrowUpFromLine },
      { href: "/picking", label: "Lấy hàng (Picking)", icon: PackageSearch },
      { href: "/quick-issue", label: "Xuất khẩn cấp", icon: Truck },
      { href: "/stock-take", label: "Kiểm kê (Stock Take)", icon: ClipboardList },
      { href: "/stock-take-scan", label: "Kiểm kê (Scan)", icon: QrCode },
      { href: "/repair-management", label: "Quản lý Sửa chữa", icon: Wrench },
      { href: "/lifecycle", label: "Truy vết Vòng đời", icon: History },
      { href: "/goods-history", label: "Lịch sử hàng hóa", icon: ClipboardPaste },
    ],
  },
  {
    group: "HỆ THỐNG & BẢO MẬT",
    items: [
      { href: "/users", label: "Quản lý Người dùng", icon: UserCog },
      { href: "/roles", label: "Phân quyền Vai trò", icon: KeyRound },
      { href: "/activity-log", label: "Nhật ký Hoạt động", icon: ScrollText },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarContent className="pt-4">
      {navItems.map((group) => (
        <SidebarGroup key={group.group}>
          <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
          <SidebarMenu>
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
