"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        !searchQuery ||
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.code.toLowerCase().includes(searchLower) ||
        supplier.taxCode.toLowerCase().includes(searchLower) ||
        supplier.address.toLowerCase().includes(searchLower)
      );
    });
  }, [suppliers, searchQuery]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredSuppliers.length);

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

  const handleDelete = async (supplierId: string) => {
    setIsDeleting(supplierId);
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuppliers(suppliers.filter((s) => s.id !== supplierId));
        toast({
          title: "Thành công",
          description: "Đã xóa nhà cung cấp thành công.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Lỗi",
          description: error.error || "Không thể xóa nhà cung cấp.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi xóa nhà cung cấp.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleFormSubmit = async (values: SupplierFormValues) => {
    if (viewMode) {
      setIsFormOpen(false);
      return;
    }

    setIsSubmitting(true);
    const isEditing = !!selectedSupplier;

    try {
      const url = isEditing
        ? `/api/suppliers/${selectedSupplier.id}`
        : '/api/suppliers';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const updatedSupplier = await response.json();

        if (isEditing) {
          setSuppliers(suppliers.map((s) =>
            s.id === selectedSupplier.id ? updatedSupplier : s
          ));
        } else {
          setSuppliers([updatedSupplier, ...suppliers]);
        }

        setIsFormOpen(false);
        toast({
          title: "Thành công",
          description: isEditing
            ? "Đã cập nhật nhà cung cấp."
            : "Đã thêm nhà cung cấp mới.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Lỗi",
          description: error.error || "Không thể lưu nhà cung cấp.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi lưu nhà cung cấp.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="w-full space-y-2">
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
          <div className="grid grid-cols-1 gap-2">
            <Input
              placeholder="Tìm kiếm mã, tên, MST, địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
              {paginatedSuppliers.length > 0 ? (
                paginatedSuppliers.map((supplier, index) => (
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
                              disabled={isDeleting === supplier.id}
                            >
                              {isDeleting === supplier.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
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
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không tìm thấy nhà cung cấp nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredSuppliers.length > 0 ? startItem : 0}-{endItem} trên {filteredSuppliers.length} bản ghi
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
            key={selectedSupplier?.id || 'new'}
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
