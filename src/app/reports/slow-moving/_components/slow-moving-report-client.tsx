"use client";

import { useState, useMemo, useEffect } from "react";
import type { Material, InventoryLog } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

type SlowMovingReportClientProps = {
  initialMaterials: Material[];
  initialLogs: InventoryLog[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Báo cáo Vật tư chậm luân chuyển</span>
  </div>
);

type ReportData = {
  material: Material;
  lastInboundDate: Date | null;
  lastOutboundDate: Date | null;
  daysSinceOutbound: number;
  inventoryValue: number;
};

export function SlowMovingReportClient({
  initialMaterials,
  initialLogs,
}: SlowMovingReportClientProps) {
  const [materials] = useState<Material[]>(initialMaterials);
  const [logs] = useState<InventoryLog[]>(initialLogs);
  
  // Filters
  const [daysThreshold, setDaysThreshold] = useState(180);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(
    () => [...new Set(materials.map((m) => m.category))],
    [materials]
  );
  
  const reportData = useMemo(() => {
    const data: ReportData[] = materials
        .map((material) => {
            const materialLogs = logs.filter(l => l.materialId === material.id);
            const inboundLogs = materialLogs.filter(l => l.type === 'inbound').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const outboundLogs = materialLogs.filter(l => l.type === 'outbound').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const lastInboundDate = inboundLogs.length > 0 ? new Date(inboundLogs[0].date) : null;
            const lastOutboundDate = outboundLogs.length > 0 ? new Date(outboundLogs[0].date) : null;
            
            const daysSinceOutbound = lastOutboundDate ? differenceInDays(new Date(), lastOutboundDate) : (lastInboundDate ? differenceInDays(new Date(), lastInboundDate) : 9999);
            
            // Assuming a placeholder price for value calculation
            const estimatedPrice = material.stock * ((material.technicalSpecs?.length || 1) * 150000); 

            return {
                material,
                lastInboundDate,
                lastOutboundDate,
                daysSinceOutbound,
                inventoryValue: material.stock > 0 ? estimatedPrice : 0,
            };
        })
        .filter(item => {
            if (item.material.stock === 0) return false;
            const matchesCategory = categoryFilter === 'all' || item.material.category === categoryFilter;
            const isSlowMoving = item.daysSinceOutbound >= daysThreshold;
            return matchesCategory && isSlowMoving;
        })
        .sort((a, b) => (b.daysSinceOutbound || 0) - (a.daysSinceOutbound || 0));

      return data;

  }, [materials, logs, daysThreshold, categoryFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [daysThreshold, categoryFilter]);

  const totalPages = Math.ceil(reportData.length / itemsPerPage);
  const paginatedData = reportData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, reportData.length);
  const totalValue = reportData.reduce((sum, item) => sum + item.inventoryValue, 0);


  return (
    <div className="w-full space-y-2">
      <PageHeader
        title="Báo cáo Vật tư chậm luân chuyển & Tuổi kho"
        breadcrumbs={<Breadcrumbs />}
        description="Phân tích các mặt hàng có vòng quay thấp và tồn kho lâu ngày."
      >
         <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Xuất Excel
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 items-end">
            <div className="space-y-1">
                <label className="text-sm font-medium">Nhóm vật tư</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                    <SelectValue placeholder="-- Tất cả nhóm --" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">-- Tất cả nhóm --</SelectItem>
                    {categories.map((category) => (
                    <SelectItem key={category || "undefined"} value={category || "undefined"}>
                        {category || "Chưa phân loại"}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium">Số ngày chưa xuất {'>='}</label>
                <Input
                    type="number"
                    value={daysThreshold}
                    onChange={(e) => setDaysThreshold(Number(e.target.value))}
                />
            </div>
            <Button variant="outline" className="h-10">
              <Filter className="mr-2 h-4 w-4" />
              Lọc báo cáo
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
           <div className="flex justify-between items-center">
             <h3 className="font-bold">Danh sách Vật tư Chậm luân chuyển</h3>
             <div className="text-sm">Tổng giá trị tồn: <span className="font-bold text-red-600">{totalValue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND'})}</span></div>
           </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã VT</TableHead>
                <TableHead className="w-2/5">Tên Vật tư</TableHead>
                <TableHead className="text-right">Tồn kho</TableHead>
                <TableHead className="text-right">Ngày nhập cuối</TableHead>
                <TableHead className="text-right">Ngày xuất cuối</TableHead>
                <TableHead className="text-right">Số ngày chưa xuất</TableHead>
                <TableHead className="text-right">Giá trị tồn (Ước tính)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map(({ material, lastInboundDate, lastOutboundDate, daysSinceOutbound, inventoryValue }) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {material.code}
                    </TableCell>
                    <TableCell className="font-semibold">{material.name}</TableCell>
                    <TableCell className="text-right font-bold">{material.stock.toLocaleString('vi-VN')}</TableCell>
                    <TableCell className="text-right">
                       {lastInboundDate ? format(lastInboundDate, "dd/MM/yyyy") : "N/A"}
                    </TableCell>
                     <TableCell className="text-right">
                       {lastOutboundDate ? format(lastOutboundDate, "dd/MM/yyyy") : "N/A"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-600">
                      {daysSinceOutbound}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {inventoryValue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND'})}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không có vật tư chậm luân chuyển phù hợp với bộ lọc.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {reportData.length > 0 ? startItem : 0}-{endItem} trên{" "}
            {reportData.length} bản ghi
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
