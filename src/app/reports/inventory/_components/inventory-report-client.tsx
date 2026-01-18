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
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const logDate = new Date(log.date);
      const matchesDate =
        !dateRange ||
        (!dateRange.from || logDate >= dateRange.from) &&
        (!dateRange.to || logDate <= dateRange.to);

      const matchesMaterial =
        materialFilter === "all" || log.materialId === materialFilter;

      const matchesType =
        typeFilter === "all" || log.type === typeFilter;

      return matchesDate && matchesMaterial && matchesType;
    });
  }, [logs, dateRange, materialFilter, typeFilter]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, materialFilter, typeFilter]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredLogs.length
  );

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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 items-end">
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
                  {materials.map(material => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Loại giao dịch</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Tất cả --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- Tất cả --</SelectItem>
                  <SelectItem value="inbound">Nhập kho</SelectItem>
                  <SelectItem value="outbound">Xuất kho</SelectItem>
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
                <TableHead>Ngày</TableHead>
                <TableHead>Mã VT</TableHead>
                <TableHead>Tên Vật tư</TableHead>
                <TableHead>Loại Giao dịch</TableHead>
                <TableHead>Đối tượng</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {materials.find(m => m.id === log.materialId)?.code}
                    </TableCell>
                    <TableCell className="font-semibold">{log.materialName}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-semibold",
                          log.type === 'inbound' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        )}
                      >
                        {log.type === 'inbound' ? 'Nhập' : 'Xuất'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.actor}</TableCell>
                    <TableCell className={cn("text-right font-bold", log.type === 'inbound' ? 'text-green-600' : 'text-red-600')}>
                      {log.type === 'inbound' ? '+' : '-'}{log.quantity.toLocaleString("vi-VN")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không có giao dịch nào phù hợp với bộ lọc.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredLogs.length > 0 ? startItem : 0}-{endItem} trên {filteredLogs.length} bản ghi
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
