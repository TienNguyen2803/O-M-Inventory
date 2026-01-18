"use client";

import { useState } from "react";
import type { Supplier } from "@/lib/types";
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
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SupplierForm, type SupplierFormValues } from "./supplier-form";

type SuppliersClientProps = {
  initialSuppliers: Supplier[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="cursor-pointer hover:text-primary">Danh mục</span>
  </div>
);

export function SuppliersClient({ initialSuppliers }: SuppliersClientProps) {
  const [suppliers, setSuppliers] =
    useState<Supplier[]>(initialSuppliers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(suppliers.length / itemsPerPage);
  const paginatedSuppliers = suppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, suppliers.length);

  const handleAdd = () => {
    setSelectedSupplier(null);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewMode(true);
    setIsFormOpen(true);
  };

  const handleDelete = (supplierId: string) => {
    setSuppliers(suppliers.filter((s) => s.id !== supplierId));
    toast({
      title: "Thành công",
      description: "Đã xóa nhà cung cấp thành công.",
      variant: "destructive",
    });
  };

  const handleFormSubmit = (values: SupplierFormValues) => {
    if (viewMode) {
      setIsFormOpen(false);
      return;
    }
    const isEditing = !!selectedSupplier;

    if (isEditing) {
      const updatedSupplier: Supplier = {
        ...selectedSupplier,
        ...values,
      };
      setSuppliers(
        suppliers.map((s) =>
          s.id === selectedSupplier.id ? updatedSupplier : s
        )
      );
    } else {
      const newSupplier: Supplier = {
        id: `sup-${Date.now()}`,
        status: "Active", // Default status
        contacts: [],
        ...values,
      };
      setSuppliers([newSupplier, ...suppliers]);
    }
    setIsFormOpen(false);
    toast({
      title: "Thành công",
      description: isEditing
        ? "Đã cập nhật nhà cung cấp."
        : "Đã thêm nhà cung cấp mới.",
    });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="w-full">
      <div className="px-4 md:px-8">
        <PageHeader
          title="Nhà cung cấp"
          breadcrumbs={<Breadcrumbs />}
        >
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới
          </Button>
        </PageHeader>
        
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4">
              <Input placeholder="Tìm kiếm..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead>Mã NCC</TableHead>
                  <TableHead>Tên Công ty</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[120px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSuppliers.map((supplier, index) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="text-center">
                      {startItem + index}
                    </TableCell>
                    <TableCell
                      className="font-medium text-primary hover:underline cursor-pointer"
                      onClick={() => handleView(supplier)}
                    >
                      {supplier.code}
                    </TableCell>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {supplier.address}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-semibold",
                          supplier.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        )}
                      >
                        {supplier.status === "Active"
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
                          onClick={() => handleView(supplier)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleEdit(supplier)}
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
                                Hành động này không thể được hoàn tác. Nhà cung cấp "
                                {supplier.name}" sẽ bị xóa vĩnh viễn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(supplier.id)}
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
              Hiển thị {startItem}-{endItem} trên {suppliers.length} bản ghi
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {viewMode
                ? `Chi tiết nhà cung cấp`
                : selectedSupplier
                ? "Cập nhật nhà cung cấp"
                : "Tạo nhà cung cấp mới"}
            </DialogTitle>
          </DialogHeader>
          <SupplierForm
            supplier={selectedSupplier}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            viewMode={viewMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
