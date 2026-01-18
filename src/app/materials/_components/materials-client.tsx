"use client";

import { useState } from "react";
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

type MaterialsClientProps = {
  initialMaterials: Material[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="cursor-pointer hover:text-primary">Danh mục</span>
  </div>
);

export function MaterialsClient({ initialMaterials }: MaterialsClientProps) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [viewMode, setViewMode] = useState(false);
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(materials.length / itemsPerPage);
  const paginatedMaterials = materials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, materials.length);

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

  const handleDelete = (materialId: string) => {
    setMaterials(materials.filter((m) => m.id !== materialId));
    toast({
      title: "Thành công",
      description: "Đã xóa vật tư thành công.",
      variant: "destructive",
    });
  };

  const handleFormSubmit = (values: MaterialFormValues) => {
    if (viewMode) {
      setIsFormOpen(false);
      return;
    }
    const isEditing = !!selectedMaterial;

    if (isEditing) {
      const updatedMaterial: Material = {
        ...selectedMaterial,
        ...values,
        managementType: values.isSerial ? "Serial" : "Batch",
      };
      setMaterials(
        materials.map((m) =>
          m.id === selectedMaterial.id ? updatedMaterial : m
        )
      );
    } else {
      const newMaterial: Material = {
        id: `mat-${Date.now()}`,
        stock: 0,
        category: "Vật tư tiêu hao", // default
        ...values,
        managementType: values.isSerial ? "Serial" : "Batch",
        description: values.description || "",
      };
      setMaterials([newMaterial, ...materials]);
    }
    setIsFormOpen(false);
    toast({
      title: "Thành công",
      description: isEditing ? "Đã cập nhật vật tư." : "Đã thêm vật tư mới.",
    });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 pt-6 px-4 md:px-8">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả nhóm --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả nhóm --</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Tìm kiếm..." />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả trạng thái --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả trạng thái --</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả loại quản lý --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả loại quản lý --</SelectItem>
                <SelectItem value="Batch">Batch</SelectItem>
                <SelectItem value="Serial">Serial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">STT</TableHead>
                <TableHead>Mã VT</TableHead>
                <TableHead>Tên vật tư</TableHead>
                <TableHead>Part No</TableHead>
                <TableHead>ĐVT</TableHead>
                <TableHead>Quản lý</TableHead>
                <TableHead className="w-[120px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMaterials.map((material, index) => (
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
                  <TableCell>{material.unit}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-semibold",
                        material.managementType === "Batch"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-emerald-100 text-emerald-800"
                      )}
                    >
                      {material.managementType}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {startItem}-{endItem} trên {materials.length} bản ghi
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
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
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
