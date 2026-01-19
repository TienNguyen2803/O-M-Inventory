"use client";

import { useState, useMemo, useEffect } from "react";
import type { Material } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type SafetyStockReportClientProps = {
  initialMaterials: Material[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Báo cáo Định mức tồn kho an toàn</span>
  </div>
);

type ReportData = {
  material: Material;
  status: 'Dưới mức an toàn' | 'Ổn định' | 'Vượt mức tối đa' | 'Dư hơn 20%';
  note: string;
};

export function SafetyStockReportClient({
  initialMaterials,
}: SafetyStockReportClientProps) {
  const [materials] = useState<Material[]>(initialMaterials);
  
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(
    () => [...new Set(materials.map((m) => m.category))],
    [materials]
  );
  
  const reportData = useMemo(() => {
    const data: ReportData[] = materials
        .filter(item => {
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
            return matchesCategory;
        })
        .map((material) => {
            let status: ReportData['status'];
            let note = '';
            
            const minStock = material.minStock || 0;
            const maxStock = material.maxStock;

            if (material.stock < minStock) {
                status = 'Dưới mức an toàn';
            } else if (maxStock !== undefined && material.stock > maxStock) {
                status = 'Vượt mức tối đa';
            } else if (material.stock > minStock * 1.2) {
                status = 'Dư hơn 20%';
            } else { 
                status = 'Ổn định';
            }
            
            if (material.stock < minStock) {
                note = 'Cảnh báo thiếu tồn kho, xem xét mua bổ sung.';
            } else if (material.stock > minStock * 1.2) {
                note = 'Dư tồn kho. ưu tiên xuất vật tư từ mã hàng này.';
            }

            return {
                material,
                status,
                note,
            };
        })
        .sort((a, b) => a.material.code.localeCompare(b.material.code));

      return data;

  }, [materials, categoryFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter]);

  const totalPages = Math.ceil(reportData.length / itemsPerPage);
  const paginatedData = reportData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, reportData.length);
  
  const getStatusBadgeClass = (status: ReportData['status']) => {
    switch (status) {
      case "Dưới mức an toàn":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Vượt mức tối đa":
        return "bg-red-100 text-red-800 border-red-300";
      case "Dư hơn 20%":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: // 'Ổn định'
        return "bg-green-100 text-green-800 border-green-300";
    }
  };


  return (
    <div className="w-full space-y-2">
      <PageHeader
        title="Báo cáo Định mức tồn kho an toàn"
        breadcrumbs={<Breadcrumbs />}
        description="Phân tích và đề xuất các ngưỡng tồn kho tối ưu."
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
                    <SelectItem key={category} value={category}>
                        {category}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            
            <div className="sm:col-start-3 flex justify-end">
                 <Button variant="outline" className="h-10 w-full sm:w-auto">
                    <Filter className="mr-2 h-4 w-4" />
                    Lọc báo cáo
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
           <h3 className="font-bold">Phân tích Mức tồn kho An toàn</h3>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã VT</TableHead>
                <TableHead className="w-2/5">Tên Vật tư</TableHead>
                <TableHead className="text-right">Tồn kho</TableHead>
                <TableHead className="text-right">Min (Hiện tại)</TableHead>
                <TableHead className="text-right">Max (Hiện tại)</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map(({ material, status, note }) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {material.code}
                    </TableCell>
                    <TableCell className="font-semibold">{material.name}</TableCell>
                    <TableCell className="text-right font-bold">{material.stock.toLocaleString('vi-VN')}</TableCell>
                    <TableCell className="text-right">
                       {(material.minStock || 0).toLocaleString('vi-VN')}
                    </TableCell>
                     <TableCell className="text-right">
                       {(material.maxStock || 0).toLocaleString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-semibold", getStatusBadgeClass(status))}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{note}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không có dữ liệu phù hợp.
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
