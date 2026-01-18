"use client";

import { useState } from "react";
import type { InventoryLog, Material } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OutboundForm } from "./outbound-form";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type OutboundClientProps = {
  initialLogs: InventoryLog[];
  materials: Material[];
};

export function OutboundClient({
  initialLogs,
  materials,
}: OutboundClientProps) {
  const [logs, setLogs] = useState<InventoryLog[]>(initialLogs);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = (
    values: Omit<InventoryLog, "id" | "type" | "materialName">
  ) => {
    const materialName =
      materials.find((m) => m.id === values.materialId)?.name || "Không rõ";
    const newLog: InventoryLog = {
      ...values,
      id: `log-${Date.now()}`,
      type: "outbound",
      materialName,
    };
    setLogs([newLog, ...logs]);
    setIsFormOpen(false);
    toast({
      title: "Thành công",
      description: "Đã ghi nhận phiếu xuất kho mới.",
    });
  };

  return (
    <div className="flex-1 space-y-4 pt-6">
      <PageHeader
        title="Xuất kho"
        description="Ghi nhận vật tư xuất kho cho các hoạt động của nhà máy."
        className="px-4 md:px-8"
      >
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo phiếu xuất
        </Button>
      </PageHeader>

      <div className="px-4 md:px-8">
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày xuất</TableHead>
                  <TableHead>Tên vật tư</TableHead>
                  <TableHead>Bộ phận sử dụng</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {format(new Date(log.date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{log.materialName}</TableCell>
                    <TableCell className="text-muted-foreground">{log.actor}</TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      -{log.quantity.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tạo phiếu xuất kho mới</DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết cho vật tư xuất kho.
            </DialogDescription>
          </DialogHeader>
          <OutboundForm
            materials={materials}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
