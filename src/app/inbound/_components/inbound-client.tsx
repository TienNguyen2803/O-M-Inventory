"use client";

import { useState, useMemo, useEffect } from "react";
import type { InboundReceipt, MasterDataItem } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
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
import { format } from "date-fns";
import { InboundForm, type InboundFormValues } from "./inbound-form";

type InboundClientProps = {
  initialReceipts: InboundReceipt[];
  inboundTypes: MasterDataItem[];
  inboundStatuses: MasterDataItem[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Nhập kho</span>
  </div>
);

export function InboundClient({
  initialReceipts,
  inboundTypes,
  inboundStatuses
}: InboundClientProps) {
  const [receipts, setReceipts] = useState<InboundReceipt[]>(initialReceipts);
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] =
    useState<InboundReceipt | null>(null);
  const [viewMode, setViewMode] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        receipt.receiptCode?.toLowerCase().includes(searchLower) ||
        receipt.referenceCode?.toLowerCase().includes(searchLower) ||
        receipt.supplier?.name?.toLowerCase().includes(searchLower);

      const matchesType =
        typeFilter === "all" || receipt.typeId === typeFilter;
      const matchesStatus =
        statusFilter === "all" || receipt.statusId === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [receipts, searchQuery, typeFilter, statusFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredReceipts.length
  );

  // Get default status (first one - DRAFT)
  const defaultStatus = inboundStatuses.find(s => s.code === "DRAFT") || inboundStatuses[0];
  const defaultType = inboundTypes[0];

  // Handlers
  const handleAdd = () => {
    const newReceiptTemplate: InboundReceipt = {
      id: "",
      receiptCode: "",
      typeId: defaultType?.id || "",
      statusId: defaultStatus?.id || "",
      supplierId: "",
      createdById: "",
      inboundDate: new Date().toISOString(),
      step: 1,
      items: [],
      documents: [],
    };
    setSelectedReceipt(newReceiptTemplate);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleEdit = (receipt: InboundReceipt) => {
    setSelectedReceipt(receipt);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleView = (receipt: InboundReceipt) => {
    setSelectedReceipt(receipt);
    setViewMode(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/inbound/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
      setReceipts(receipts.filter((r) => r.id !== id));
      toast({
        title: "Thành công",
        description: `Đã xóa phiếu nhập.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa phiếu nhập",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (values: InboundFormValues) => {
    if (viewMode) {
      setIsFormOpen(false);
      return;
    }

    try {
      const isEditing = selectedReceipt?.id && receipts.some((r) => r.id === selectedReceipt.id);

      const res = await fetch(
        isEditing ? `/api/inbound/${selectedReceipt.id}` : "/api/inbound",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      const savedReceipt = await res.json();

      if (isEditing) {
        setReceipts(receipts.map((r) => (r.id === savedReceipt.id ? savedReceipt : r)));
      } else {
        setReceipts([savedReceipt, ...receipts]);
      }

      setIsFormOpen(false);
      toast({
        title: "Thành công",
        description: isEditing ? "Đã cập nhật phiếu nhập." : "Đã tạo phiếu nhập mới.",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể lưu phiếu nhập",
        variant: "destructive",
      });
    }
  };

  const getTypeBadgeClass = (typeId: string) => {
    const type = inboundTypes.find(t => t.id === typeId);
    return type?.color || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusBadgeClass = (statusId: string) => {
    const status = inboundStatuses.find(s => s.id === statusId);
    return status?.color || "bg-gray-100 text-gray-800";
  };

  const getTypeName = (typeId: string) => {
    return inboundTypes.find(t => t.id === typeId)?.name || typeId;
  };

  const getStatusName = (statusId: string) => {
    return inboundStatuses.find(s => s.id === statusId)?.name || statusId;
  };

  return (
    <div className="w-full space-y-2">
      <PageHeader title="Nhập kho" breadcrumbs={<Breadcrumbs />}>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo Phiếu nhập
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Loại nhập kho</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Tất cả --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- Tất cả --</SelectItem>
                  {inboundTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <Input
                placeholder="Số Phiếu, PO, Đối tác..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Tất cả --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {inboundStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SỐ PHIẾU</TableHead>
                <TableHead>LOẠI NHẬP</TableHead>
                <TableHead>THAM CHIẾU</TableHead>
                <TableHead>NGÀY NHẬP</TableHead>
                <TableHead>NHÀ CUNG CẤP</TableHead>
                <TableHead>TRẠNG THÁI</TableHead>
                <TableHead className="w-[120px]">THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReceipts.length > 0 ? (
                paginatedReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell
                      className="font-medium text-primary hover:underline cursor-pointer"
                      onClick={() => handleView(receipt)}
                    >
                      {receipt.receiptCode}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-semibold border",
                          getTypeBadgeClass(receipt.typeId)
                        )}
                      >
                        {receipt.type?.name || getTypeName(receipt.typeId)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {receipt.purchaseRequest?.requestCode || receipt.referenceCode || "-"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(receipt.inboundDate), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{receipt.supplier?.name || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-semibold",
                          getStatusBadgeClass(receipt.statusId)
                        )}
                      >
                        {receipt.status?.name || getStatusName(receipt.statusId)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleView(receipt)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleEdit(receipt)}
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
                                Hành động này không thể được hoàn tác. Phiếu
                                nhập &quot;{receipt.receiptCode}&quot; sẽ bị xóa vĩnh viễn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(receipt.id)}
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
                    Không tìm thấy phiếu nhập nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredReceipts.length > 0 ? startItem : 0}-{endItem} trên{" "}
            {filteredReceipts.length} bản ghi
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-7xl">
          <DialogHeader>
            <DialogTitle>
              {viewMode
                ? `Chi tiết Phiếu nhập: ${selectedReceipt?.receiptCode}`
                : selectedReceipt?.id && receipts.some((r) => r.id === selectedReceipt.id)
                ? `Cập nhật Phiếu nhập: ${selectedReceipt?.receiptCode}`
                : "Tạo Phiếu nhập mới"}
            </DialogTitle>
          </DialogHeader>
          <InboundForm
            receipt={selectedReceipt}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            viewMode={viewMode}
            inboundTypes={inboundTypes}
            inboundStatuses={inboundStatuses}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
