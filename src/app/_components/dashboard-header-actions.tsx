"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function DashboardHeaderActions() {
  return (
    <div className="flex items-center space-x-2">
      <Select defaultValue="this-month">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Chọn tháng" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="this-month">Tháng này</SelectItem>
          <SelectItem value="last-month">Tháng trước</SelectItem>
          <SelectItem value="last-3-months">3 tháng qua</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Xuất báo cáo
      </Button>
    </div>
  );
}
