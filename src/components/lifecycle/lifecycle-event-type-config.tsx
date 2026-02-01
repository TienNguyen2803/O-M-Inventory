"use client";

import { MaterialEventType } from "@prisma/client";
import {
  Package,
  CheckCircle,
  FileText,
  Truck,
  ClipboardCheck,
  ArrowRightFromLine,
  Wrench,
} from "lucide-react";

// Event type configuration with icons and colors
export const eventTypeConfig: Record<
  MaterialEventType,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }
> = {
  REQUEST: {
    label: "Yêu cầu",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  APPROVED: {
    label: "Đã duyệt",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  PO_ISSUED: {
    label: "Đơn hàng",
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  INBOUND: {
    label: "Nhập kho",
    icon: Truck,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
  QC: {
    label: "Kiểm tra",
    icon: ClipboardCheck,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  OUTBOUND: {
    label: "Xuất kho",
    icon: ArrowRightFromLine,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  INSTALLED: {
    label: "Lắp đặt",
    icon: Wrench,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
};

export function getEventTypeConfig(eventType: MaterialEventType) {
  return eventTypeConfig[eventType] || eventTypeConfig.REQUEST;
}
