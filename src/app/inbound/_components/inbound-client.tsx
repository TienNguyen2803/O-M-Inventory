"use client";

import { useState, useMemo, useEffect } from "react";
import type { InboundReceipt } from "@/lib/types";
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
  Archive,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import Link from "next/link";

type InboundClientProps = {
  initialReceipts: InboundReceipt[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Nhập kho</span>
  </div>
);

export function InboundClient({ initialReceipts }: InboundClientProps) {
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

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        receipt.id.toLowerCase().includes(searchLower) ||
        receipt.reference.toLowerCase().includes(searchLower) ||
        receipt.partner.toLowerCase().includes(searchLower);

      const matchesType =
        typeFilter === "all" || receipt.inboundType === typeFilter;
      const matchesStatus =
        statusFilter === "all" || receipt.status === statusFilter;

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

  // Handlers
  const handleAdd = () => {
    const newReceiptTemplate: InboundReceipt = {
      id: `PNK-2025-${String(receipts.length + 1).padStart(3, "0")}`,
      inboundType: "Theo PO",
      reference: "",
      inboundDate: new Date().toISOString(),
      partner: "",
      status: "Yêu cầu nhập",
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

  const handleDelete = (id: string) => {
    setReceipts(receipts.filter((r) => r.id !== id));
    toast({
      title: "Thành công",
      description: `Đã xóa phiếu nhập ${id}.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (values: InboundFormValues) => {
    const submittedReceipt: InboundReceipt = {
      // This needs to be spread from the original object to preserve non-form fields like step
      ...selectedReceipt!,
      ...values,
      inboundDate: values.inboundDate.toISOString(),
    };

    if (viewMode) {
      setIsFormOpen(false);
      return;
    }

    const isEditing = receipts.some((r) => r.id === submittedReceipt.id);

    if (isEditing) {
      setReceipts(
        receipts.map((r) => (r.id === submittedReceipt.id ? submittedReceipt : r))
      );
    } else {
      setReceipts([submittedReceipt, ...receipts]);
    }
    setIsFormOpen(false);
    toast({
      title: "Thành công",
      description: isEditing
        ? "Đã cập nhật phiếu nhập."
        : "Đã tạo phiếu nhập mới.",
    });
  };

  const getTypeBadgeClass = (type: InboundReceipt["inboundType"]) => {
    switch (type) {
      case "Theo PO":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Sau Sửa chữa":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Hàng Mượn":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Hoàn trả":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadgeClass = (status: InboundReceipt["status"]) => {
    switch (status) {
      case "Hoàn thành":
        return "bg-green-100 text-green-800";
      case "Đang nhập":
        return "bg-yellow-100 text-yellow-800";
      case "KCS & Hồ sơ":
        return "bg-cyan-100 text-cyan-800";
      case "Yêu cầu nhập":
         return "bg-blue-100 text-blue-800";
      case "Chờ xếp hàng":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  if (!isClient) {
    return null;
  }

  return (
    <TooltipProvider>
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
                    <SelectItem value="Theo PO">Theo PO</SelectItem>
                    <SelectItem value="Sau Sửa chữa">Sau Sửa chữa</SelectItem>
                    <SelectItem value="Hàng Mượn">Hàng Mượn</SelectItem>
                    <SelectItem value="Hoàn trả">Hoàn trả</SelectItem>
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
                    <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                    <SelectItem value="Đang nhập">Đang nhập</SelectItem>
                    <SelectItem value="KCS & Hồ sơ">KCS & Hồ sơ</SelectItem>
                    <SelectItem value="Yêu cầu nhập">Yêu cầu nhập</SelectItem>
                    <SelectItem value="Chờ xếp hàng">Chờ xếp hàng</SelectItem>
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
                  <TableHead>ĐỐI TÁC</TableHead>
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
                        {receipt.id}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-semibold border",
                            getTypeBadgeClass(receipt.inboundType)
                          )}
                        >
                          {receipt.inboundType}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {receipt.reference}
                      </TableCell>
                      <TableCell>
                        {format(new Date(receipt.inboundDate), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{receipt.partner}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-semibold",
                            getStatusBadgeClass(receipt.status)
                          )}
                        >
                          {receipt.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {receipt.status === 'Chờ xếp hàng' && (
                             <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/put-away?receiptId=${receipt.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                                    <Archive className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent><p>Xếp hàng vào kho</p></TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={() => handleView(receipt)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Xem chi tiết</p></TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={() => handleEdit(receipt)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Chỉnh sửa</p></TooltipContent>
                          </Tooltip>
                         
                          <AlertDialog>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive/80 hover:text-destructive"
                                        >
                                        <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>Xóa</p></TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Bạn có chắc chắn muốn xóa?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Hành động này không thể được hoàn tác. Phiếu
                                  nhập "{receipt.id}" sẽ bị xóa vĩnh viễn.
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
                  ? `Chi tiết Phiếu nhập: ${selectedReceipt?.id}`
                  : selectedReceipt?.id && receipts.some((r) => r.id === selectedReceipt.id)
                  ? `Cập nhật Phiếu nhập: ${selectedReceipt?.id}`
                  : "Tạo Phiếu nhập mới"}
              </DialogTitle>
            </DialogHeader>
            <InboundForm
              receipt={selectedReceipt}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              viewMode={viewMode}
            />
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
