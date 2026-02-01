"use client";

import { useState, useEffect, useCallback } from "react";
import type { WarehouseLocation } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { WarehouseForm, type WarehouseFormValues } from "./warehouse-form";
import { useMasterDataItems } from "@/hooks/use-master-data";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="cursor-pointer hover:text-primary">Danh mục</span>
  </div>
);

export function WarehousesClient() {
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<WarehouseLocation | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const { toast } = useToast();

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;

  // Master data for filters
  const { items: areas } = useMasterDataItems("warehouse-area");
  const { items: types } = useMasterDataItems("warehouse-type");

  // Fetch locations from API
  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (areaFilter !== "all") params.append("area", areaFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);

      const response = await fetch(`/api/warehouse-locations?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách vị trí kho.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, areaFilter, typeFilter, toast]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, areaFilter, typeFilter]);

  const handleAdd = () => {
    setSelectedLocation(null);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleEdit = (location: WarehouseLocation) => {
    setSelectedLocation(location);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleView = (location: WarehouseLocation) => {
    setSelectedLocation(location);
    setViewMode(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (locationId: string) => {
    try {
      const response = await fetch(`/api/warehouse-locations/${locationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đã xóa vị trí kho thành công.",
        });
        fetchLocations();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa vị trí kho.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (values: WarehouseFormValues) => {
    if (viewMode) {
      setIsFormOpen(false);
      return;
    }

    const isEditing = !!selectedLocation;

    try {
      const url = isEditing
        ? `/api/warehouse-locations/${selectedLocation.id}`
        : "/api/warehouse-locations";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setIsFormOpen(false);
        toast({
          title: "Thành công",
          description: isEditing ? "Đã cập nhật vị trí kho." : "Đã thêm vị trí kho mới.",
        });
        fetchLocations();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving location:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể lưu vị trí kho.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

  return (
    <div className="space-y-2 w-full">
      <PageHeader title="Danh mục Kho" breadcrumbs={<Breadcrumbs />}>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả khu vực --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả khu vực --</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.name}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Mã vị trí, Tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả loại --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả loại --</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead>Mã vị trí</TableHead>
                  <TableHead>Tên vị trí</TableHead>
                  <TableHead>Khu vực</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[120px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length > 0 ? (
                  locations.map((location, index) => (
                    <TableRow key={location.id}>
                      <TableCell className="text-center">
                        {startItem + index}
                      </TableCell>
                      <TableCell
                        className="font-medium text-primary hover:underline cursor-pointer"
                        onClick={() => handleView(location)}
                      >
                        {location.code}
                      </TableCell>
                      <TableCell>{location.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {location.area}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {location.type}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-semibold",
                            location.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {location.status === "Active"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => handleView(location)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => handleEdit(location)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
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
                                  Hành động này không thể được hoàn tác. Vị trí "
                                  {location.name}" sẽ bị xóa vĩnh viễn.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(location.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                      Không tìm thấy vị trí nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {total > 0 ? startItem : 0}-{endItem} trên {total} bản ghi
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
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {viewMode
                ? `Chi tiết Vị trí kho: ${selectedLocation?.name}`
                : selectedLocation
                ? "Cập nhật Vị trí kho"
                : "Tạo Vị trí kho mới"}
            </DialogTitle>
          </DialogHeader>
          <WarehouseForm
            location={selectedLocation}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            viewMode={viewMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
