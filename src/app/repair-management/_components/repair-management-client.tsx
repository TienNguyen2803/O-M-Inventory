"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Filter, Send, Wrench, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Vận hành Kho</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Quản lý Sửa chữa</span>
  </div>
);

type RepairItem = {
  id: string;
  materialCode: string;
  materialName: string;
  serialNumber: string;
  supplier: string;
  sentDate: Date;
  expectedReturnDate: Date;
  status: "Chờ gửi đi" | "Đang sửa chữa" | "Đã sửa xong" | "Đã trả về";
};

const initialRepairItems: RepairItem[] = [
  {
    id: "REP-001",
    materialCode: "PM-MECH-PMP-008",
    materialName: "Bơm dầu bôi trơn (Lube Oil Pump)",
    serialNumber: "SN-PUMP-123",
    supplier: "KSB Vietnam",
    sentDate: new Date("2024-05-15"),
    expectedReturnDate: new Date("2024-08-15"),
    status: "Đang sửa chữa",
  },
  {
    id: "REP-002",
    materialCode: "PM-ELEC-GT-001",
    materialName: "Card điều khiển Tuabin khí Siemens SGT5-4000F",
    serialNumber: "SN-CARD-456",
    supplier: "Siemens Energy",
    sentDate: new Date("2024-06-01"),
    expectedReturnDate: new Date("2024-07-30"),
    status: "Đã sửa xong",
  },
  {
    id: "REP-003",
    materialCode: "PM-MECH-GV-011",
    materialName: "Van chặn khẩn cấp (ESD Valve)",
    serialNumber: "SN-VALVE-789",
    supplier: "Metso Vietnam",
    sentDate: new Date("2024-07-10"),
    expectedReturnDate: new Date("2024-09-10"),
    status: "Chờ gửi đi",
  },
];

export function RepairManagementClient() {
  const [repairItems] = useState<RepairItem[]>(initialRepairItems);

  const getStatusBadgeClass = (status: RepairItem["status"]) => {
    switch (status) {
      case "Chờ gửi đi":
        return "bg-gray-200 text-gray-800";
      case "Đang sửa chữa":
        return "bg-yellow-100 text-yellow-800";
      case "Đã sửa xong":
        return "bg-blue-100 text-blue-800";
      case "Đã trả về":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản lý Sửa chữa & Luân chuyển"
        description="Theo dõi vật tư, thiết bị được gửi đi sửa chữa, bảo hành hoặc hiệu chuẩn."
        breadcrumbs={<Breadcrumbs />}
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Tạo Yêu cầu Sửa chữa
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Vật tư đang Sửa chữa</CardTitle>
          <CardDescription>
            Tổng cộng có {repairItems.length} mục đang được theo dõi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã Vật tư</TableHead>
                <TableHead>Tên Vật tư / Serial</TableHead>
                <TableHead>NCC Sửa chữa</TableHead>
                <TableHead>Ngày gửi</TableHead>
                <TableHead>Ngày hẹn trả</TableHead>
                <TableHead>Tình trạng</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{item.materialCode}</TableCell>
                  <TableCell>
                    <div className="font-medium">{item.materialName}</div>
                    <div className="text-xs text-muted-foreground">{item.serialNumber}</div>
                  </TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>{format(item.sentDate, "dd/MM/yyyy")}</TableCell>
                  <TableCell className="font-medium">{format(item.expectedReturnDate, "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-semibold", getStatusBadgeClass(item.status))}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                       Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
