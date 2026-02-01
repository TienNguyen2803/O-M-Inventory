"use client";

import { useState, useMemo, useEffect } from "react";
import type { Stocktake, MasterDataItem } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle,
  ClipboardCheck,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { StocktakeForm } from "./stocktake-form";
import { StocktakeStepper } from "./stocktake-stepper";

type StocktakeClientProps = {
  initialStocktakes: Stocktake[];
  stocktakeStatuses: MasterDataItem[];
  stocktakeAreas: MasterDataItem[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Kiểm kê kho</span>
  </div>
);

export function StocktakeClient({
  initialStocktakes,
  stocktakeStatuses,
  stocktakeAreas,
}: StocktakeClientProps) {
  const [stocktakes, setStocktakes] = useState<Stocktake[]>(initialStocktakes);
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [selectedStocktake, setSelectedStocktake] = useState<Stocktake | null>(
    null
  );
  const [viewMode, setViewMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");

  const filteredStocktakes = useMemo(() => {
    return stocktakes.filter((st) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        st.takeCode.toLowerCase().includes(searchLower) ||
        st.name.toLowerCase().includes(searchLower);
      const matchesStatus =
        statusFilter === "all" || st.statusId === statusFilter;
      const matchesArea = areaFilter === "all" || st.areaId === areaFilter;
      return matchesSearch && matchesStatus && matchesArea;
    });
  }, [stocktakes, searchQuery, statusFilter, areaFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, areaFilter]);

  const totalPages = Math.ceil(filteredStocktakes.length / itemsPerPage);
  const paginatedStocktakes = filteredStocktakes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredStocktakes.length
  );

  const handleAdd = () => {
    setSelectedStocktake(null);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleEdit = (st: Stocktake) => {
    setSelectedStocktake(st);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleView = (st: Stocktake) => {
    setSelectedStocktake(st);
    setViewMode(true);
    setIsStepperOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/stocktake/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete");
      }
      setStocktakes(stocktakes.filter((st) => st.id !== id));
      toast({
        title: "Thành công",
        description: "Đã xóa đợt kiểm kê.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể xóa đợt kiểm kê",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = (newStocktake: Stocktake) => {
    const existingIndex = stocktakes.findIndex(
      (st) => st.id === newStocktake.id
    );
    if (existingIndex >= 0) {
      setStocktakes(
        stocktakes.map((st) =>
          st.id === newStocktake.id ? newStocktake : st
        )
      );
    } else {
      setStocktakes([newStocktake, ...stocktakes]);
    }
    setIsFormOpen(false);
    toast({
      title: "Thành công",
      description:
        existingIndex >= 0
          ? "Đã cập nhật đợt kiểm kê."
          : "Đã tạo đợt kiểm kê mới.",
    });
  };

  const handleStepperUpdate = (updatedStocktake: Stocktake) => {
    setStocktakes(
      stocktakes.map((st) =>
        st.id === updatedStocktake.id ? updatedStocktake : st
      )
    );
    setSelectedStocktake(updatedStocktake);
  };

  const getStatusBadgeClass = (color?: string | null) => {
    return color || "bg-gray-100 text-gray-800";
  };

  const getStepIcon = (step?: number) => {
    switch (step) {
      case 1:
        return <Pencil className="h-3 w-3" />;
      case 2:
        return <Play className="h-3 w-3" />;
      case 3:
        return <ClipboardCheck className="h-3 w-3" />;
      case 4:
        return <CheckCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      <PageHeader title="Kiểm kê kho" breadcrumbs={<Breadcrumbs />}>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-full max-w-sm">
              <label htmlFor="search" className="text-sm font-medium">
                Tìm kiếm
              </label>
              <Input
                id="search"
                placeholder="Tìm kiếm theo mã số, tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-48">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {stocktakeStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <label className="text-sm font-medium">Khu vực</label>
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {stocktakeAreas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MÃ SỐ</TableHead>
                <TableHead>TÊN ĐỢT KIỂM KÊ</TableHead>
                <TableHead>KHU VỰC</TableHead>
                <TableHead>NGÀY</TableHead>
                <TableHead>TIẾN ĐỘ</TableHead>
                <TableHead>TRẠNG THÁI</TableHead>
                <TableHead className="w-[120px]">THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStocktakes.length > 0 ? (
                paginatedStocktakes.map((st) => (
                  <TableRow key={st.id}>
                    <TableCell
                      className="font-medium text-primary hover:underline cursor-pointer"
                      onClick={() => handleView(st)}
                    >
                      {st.takeCode}
                    </TableCell>
                    <TableCell>{st.name}</TableCell>
                    <TableCell>{st.area?.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(st.takeDate), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStepIcon(st.currentStep)}
                        <span className="text-sm text-muted-foreground">
                          {st.completedLocations}/{st.totalLocations} vị trí
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "font-semibold",
                          getStatusBadgeClass(st.status?.color)
                        )}
                        variant="outline"
                      >
                        {st.status?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleView(st)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {st.status?.code === "DRAFT" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => handleEdit(st)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {(st.status?.code === "DRAFT" ||
                          st.status?.code === "CANCELLED") && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive/80 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Bạn có chắc chắn muốn xóa?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Hành động này không thể được hoàn tác. Đợt
                                  kiểm kê &quot;{st.takeCode}&quot; sẽ bị xóa vĩnh viễn.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(st.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không tìm thấy đợt kiểm kê nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredStocktakes.length > 0 ? startItem : 0}-{endItem}{" "}
            trên {filteredStocktakes.length} bản ghi
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
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Create/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedStocktake
                ? `Cập nhật Đợt kiểm kê: ${selectedStocktake.takeCode}`
                : "Tạo Đợt kiểm kê mới"}
            </DialogTitle>
          </DialogHeader>
          <StocktakeForm
            stocktake={selectedStocktake}
            stocktakeAreas={stocktakeAreas}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View/Stepper Dialog */}
      <Dialog open={isStepperOpen} onOpenChange={setIsStepperOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Chi tiết Đợt kiểm kê: {selectedStocktake?.takeCode}
            </DialogTitle>
          </DialogHeader>
          {selectedStocktake && (
            <StocktakeStepper
              stocktake={selectedStocktake}
              onUpdate={handleStepperUpdate}
              onClose={() => setIsStepperOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
