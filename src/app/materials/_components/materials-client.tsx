"use client";

import { useState, useEffect, useCallback } from "react";
import type { Material } from "@/lib/types";
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
import { MaterialForm, type MaterialFormValues } from "./material-form";
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
import { useMasterDataItems } from "@/hooks/use-master-data";
import { MasterDataItem } from "@/lib/types";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="cursor-pointer hover:text-primary">Danh mục</span>
  </div>
);

export function MaterialsClient() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const { toast } = useToast();

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [managementTypeFilter, setManagementTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;

  // Master data for filters
  const { items: categories } = useMasterDataItems('material-category');
  const { items: statuses } = useMasterDataItems('material-status');
  const { items: managementTypes } = useMasterDataItems('management-type');

  // Fetch materials from API
  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter !== 'all') params.append('categoryId', categoryFilter);
      if (statusFilter !== 'all') params.append('statusId', statusFilter);
      if (managementTypeFilter !== 'all') params.append('managementTypeId', managementTypeFilter);

      const response = await fetch(`/api/materials?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMaterials(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách vật tư.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, categoryFilter, statusFilter, managementTypeFilter, toast]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, managementTypeFilter, statusFilter]);

  const handleAdd = () => {
    setSelectedMaterial(null);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleView = (material: Material) => {
    setSelectedMaterial(material);
    setViewMode(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (materialId: string) => {
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đã xóa vật tư thành công.",
        });
        fetchMaterials();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa vật tư.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (values: MaterialFormValues) => {
    if (viewMode) {
      setIsFormOpen(false);
      return;
    }
    
    const isEditing = !!selectedMaterial;
    
    try {
      const url = isEditing
        ? `/api/materials/${selectedMaterial.id}`
        : '/api/materials';
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setIsFormOpen(false);
        toast({
          title: "Thành công",
          description: isEditing ? "Đã cập nhật vật tư." : "Đã thêm vật tư mới.",
        });
        fetchMaterials();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving material:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể lưu vật tư.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
  };

  const getMasterDataName = (item: string | MasterDataItem | undefined) => {
    if (!item) return '-';
    if (typeof item === 'string') return item;
    return item.name;
  };

  const getStatusBadgeClass = (status?: string | MasterDataItem | null) => {
    if (!status) return "bg-gray-100 text-gray-800";

    // If it's a string, we can't easily determine color unless we parse it or have defaults
    if (typeof status === 'string') {
        switch (status) {
            case "Mới": return "bg-green-100 text-green-800";
            case "Cũ nhưng dùng được": return "bg-sky-100 text-sky-800";
            case "Hư hỏng": return "bg-yellow-100 text-yellow-800";
            case "Hư hỏng không thể sửa chữa": return "bg-red-100 text-red-800";
            case "Thanh lý": return "bg-gray-200 text-gray-600";
            default: return "bg-gray-100 text-gray-800";
        }
    }

    // Use color from master data if available
    if (status.color) {
      return `bg-[${status.color}]/10 text-[${status.color}]`;
    }
    // Fallback based on name
    switch (status.name) {
      case "Mới":
        return "bg-green-100 text-green-800";
      case "Cũ nhưng dùng được":
        return "bg-sky-100 text-sky-800";
      case "Hư hỏng":
        return "bg-yellow-100 text-yellow-800";
      case "Hư hỏng không thể sửa chữa":
        return "bg-red-100 text-red-800";
      case "Thanh lý":
        return "bg-gray-200 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

  return (
    <div className="w-full space-y-2">
      <PageHeader
        title="Danh mục Vật tư"
        breadcrumbs={<Breadcrumbs />}
      >
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </PageHeader>
      
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả nhóm --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả nhóm --</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Tìm kiếm mã, tên, part no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả trạng thái --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả trạng thái --</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={managementTypeFilter}
              onValueChange={setManagementTypeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả loại quản lý --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả loại quản lý --</SelectItem>
                {managementTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
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
                  <TableHead>Mã VT</TableHead>
                  <TableHead>Tên vật tư</TableHead>
                  <TableHead>Part No</TableHead>
                  <TableHead>ĐVT</TableHead>
                  <TableHead>Quản lý</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[120px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.length > 0 ? (
                  materials.map((material, index) => (
                    <TableRow key={material.id}>
                      <TableCell className="text-center">
                        {startItem + index}
                      </TableCell>
                      <TableCell className="font-medium text-primary hover:underline cursor-pointer">
                        {material.code}
                      </TableCell>
                      <TableCell>{material.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {material.partNo}
                      </TableCell>
                      <TableCell>{getMasterDataName(material.materialUnit)}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-semibold",
                            getMasterDataName(material.managementType) === "Batch"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-emerald-100 text-emerald-800"
                          )}
                        >
                          {getMasterDataName(material.managementType)}
                        </span>
                      </TableCell>
                       <TableCell>
                        <span
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-semibold",
                            getStatusBadgeClass(material.materialStatus)
                          )}
                        >
                          {getMasterDataName(material.materialStatus)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => handleView(material)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => handleEdit(material)}
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
                                  Hành động này không thể được hoàn tác. Vật tư "
                                  {material.name}" sẽ bị xóa vĩnh viễn.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(material.id)}
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
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Không tìm thấy vật tư nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {total > 0 ? startItem : 0}-{endItem}{" "}
            trên {total} bản ghi
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
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
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
                ? "Chi tiết vật tư"
                : selectedMaterial
                ? "Cập nhật vật tư"
                : "Thêm vật tư mới"}
            </DialogTitle>
          </DialogHeader>
          <MaterialForm
            material={selectedMaterial}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            viewMode={viewMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
