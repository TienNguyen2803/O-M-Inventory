"use client";

import { useState, useMemo, useEffect } from "react";
import type { InventoryLog, Material } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";

type InventoryReportClientProps = {
  initialLogs: InventoryLog[];
  materials: Material[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Báo cáo Nhập-Xuất-Tồn</span>
  </div>
);

type ReportData = {
  materialId: string;
  materialCode: string;
  materialName: string;
  openingStock: number;
  inboundQuantity: number;
  outboundQuantity: number;
  closingStock: number;
};

export function InventoryReportClient({
  initialLogs,
  materials,
}: InventoryReportClientProps) {
  const [logs] = useState<InventoryLog[]>(initialLogs);

  // Filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [materialFilter, setMaterialFilter] = useState("all");

  const reportData = useMemo(() => {
    const { from, to } = dateRange || {};
    const now = new Date();

    const processMaterial = (material: Material): ReportData => {
      const materialLogs = logs.filter((l) => l.materialId === material.id);

      // We assume material.stock is the current stock.
      // To get the stock at the end of the period (dateRange.to), we need to revert transactions after that date.
      const logsAfterTo = materialLogs.filter(
        (l) => new Date(l.date) > (to || now)
      );
      const inboundAfterTo = logsAfterTo
        .filter((l) => l.type === "inbound")
        .reduce((sum, l) => sum + l.quantity, 0);
      const outboundAfterTo = logsAfterTo
        .filter((l) => l.type === "outbound")
        .reduce((sum, l) => sum + l.quantity, 0);

      const closingStock = material.stock - inboundAfterTo + outboundAfterTo;

      // Filter logs within the selected period
      const logsInPeriod = materialLogs.filter((l) => {
        const logDate = new Date(l.date);
        const fromDate = from ? new Date(from.setHours(0, 0, 0, 0)) : null;
        const toDate = to ? new Date(to.setHours(23, 59, 59, 999)) : null;
        return (
          (!fromDate || logDate >= fromDate) && (!toDate || logDate <= toDate)
        );
      });

      const inboundInPeriod = logsInPeriod
        .filter((l) => l.type === "inbound")
        .reduce((sum, l) => sum + l.quantity, 0);
      const outboundInPeriod = logsInPeriod
        .filter((l) => l.type === "outbound")
        .reduce((sum, l) => sum + l.quantity, 0);

      const openingStock = closingStock - inboundInPeriod + outboundInPeriod;

      return {
        materialId: material.id,
        materialCode: material.code,
        materialName: material.name,
        openingStock,
        inboundQuantity: inboundInPeriod,
        outboundQuantity: outboundInPeriod,
        closingStock,
      };
    };
    
    let materialsToProcess = materials;
    if (materialFilter !== "all") {
      materialsToProcess = materials.filter((m) => m.id === materialFilter);
    }
    
    const data = materialsToProcess.map(processMaterial);
    
    // Only show materials that had activity or stock
    return data.filter(d => d.openingStock !== 0 || d.inboundQuantity !== 0 || d.outboundQuantity !== 0 || d.closingStock !== 0);

  }, [logs, materials, dateRange, materialFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, materialFilter]);

  const totalPages = Math.ceil(reportData.length / itemsPerPage);
  const paginatedData = reportData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, reportData.length);

  return (
    <div className="w-full space-y-2">
      <PageHeader
        title="Báo cáo Nhập-Xuất-Tồn"
        breadcrumbs={<Breadcrumbs />}
        description="Xem lịch sử giao dịch nhập và xuất kho vật tư."
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
              <label className="text-sm font-medium">Khoảng thời gian</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Vật tư</label>
              <Select value={materialFilter} onValueChange={setMaterialFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Tất cả vật tư --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- Tất cả vật tư --</SelectItem>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="h-10">
              <Filter className="mr-2 h-4 w-4" />
              Lọc báo cáo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã VT</TableHead>
                <TableHead className="w-2/5">Tên Vật tư</TableHead>
                <TableHead className="text-right">Tồn đầu kỳ</TableHead>
                <TableHead className="text-right">Nhập trong kỳ</TableHead>
                <TableHead className="text-right">Xuất trong kỳ</TableHead>
                <TableHead className="text-right">Tồn cuối kỳ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <TableRow key={row.materialId}>
                    <TableCell className="font-medium text-muted-foreground">
                      {row.materialCode}
                    </TableCell>
                    <TableCell className="font-semibold">{row.materialName}</TableCell>
                    <TableCell className="text-right">{row.openingStock.toLocaleString("vi-VN")}</TableCell>
                    <TableCell className={cn("text-right font-bold text-green-600")}>
                      {row.inboundQuantity > 0 ? `+${row.inboundQuantity.toLocaleString("vi-VN")}` : 0}
                    </TableCell>
                     <TableCell className={cn("text-right font-bold text-red-600")}>
                      {row.outboundQuantity > 0 ? `-${row.outboundQuantity.toLocaleString("vi-VN")}`: 0}
                    </TableCell>
                    <TableCell className="text-right font-bold">{row.closingStock.toLocaleString("vi-VN")}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không có dữ liệu phù hợp với bộ lọc.
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
