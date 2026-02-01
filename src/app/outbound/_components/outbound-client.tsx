"use client";

import { useState, useMemo, useEffect } from "react";
import type { OutboundReceipt, MasterDataItem } from "@/lib/types";
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
import { OutboundForm, type OutboundFormValues } from "./outbound-form";

type OutboundClientProps = {
  initialReceipts: OutboundReceipt[];
  outboundPurposes: MasterDataItem[];
  outboundStatuses: MasterDataItem[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Xuất kho</span>
  </div>
);

export function OutboundClient({
  initialReceipts,
  outboundPurposes,
  outboundStatuses
}: OutboundClientProps) {
  const [receipts, setReceipts] = useState<OutboundReceipt[]>(initialReceipts);
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] =
    useState<OutboundReceipt | null>(null);
  const [viewMode, setViewMode] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const searchLower = searchQuery.toLowerCase();
      const receiverName = typeof receipt.receiver === 'object' ? receipt.receiver?.name : '';
      const deptName = typeof receipt.receiver === 'object' && receipt.receiver?.department
        ? receipt.receiver.department.name
        : '';

      const matchesSearch =
        !searchQuery ||
        receipt.receiptCode?.toLowerCase().includes(searchLower) ||
        receiverName?.toLowerCase().includes(searchLower) ||
        deptName?.toLowerCase().includes(searchLower) ||
        receipt.reason?.toLowerCase().includes(searchLower);

      const matchesPurpose =
        purposeFilter === "all" || receipt.purposeId === purposeFilter;
      const matchesStatus =
        statusFilter === "all" || receipt.statusId === statusFilter;

      return matchesSearch && matchesPurpose && matchesStatus;
    });
  }, [receipts, searchQuery, purposeFilter, statusFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, purposeFilter, statusFilter]);

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

  // Get default status (first one - REQUEST)
  const defaultStatus = outboundStatuses.find(s => s.code === "REQUEST") || outboundStatuses[0];
  const defaultPurpose = outboundPurposes[0];

  // Handlers
  const handleAdd = () => {
    const newReceiptTemplate: OutboundReceipt = {
      id: "",
      receiptCode: "",
      purposeId: defaultPurpose?.id || "",
      statusId: defaultStatus?.id || "",
      receiverId: "",
      createdById: "",
      outboundDate: new Date().toISOString(),
      step: 1,
      items: [],
    };
    setSelectedReceipt(newReceiptTemplate);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleEdit = (receipt: OutboundReceipt) => {
    setSelectedReceipt(receipt);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleView = (receipt: OutboundReceipt) => {
    setSelectedReceipt(receipt);
    setViewMode(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/outbound/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
      setReceipts(receipts.filter((r) => r.id !== id));
      toast({
        title: "Thành công",
        description: `Đã xóa phiếu xuất.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa phiếu xuất",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (values: OutboundFormValues) => {
    if (viewMode) {
      setIsFormOpen(false);
      return;
    }

    try {
      const isEditing = selectedReceipt?.id && receipts.some((r) => r.id === selectedReceipt.id);

      const res = await fetch(
        isEditing ? `/api/outbound/${selectedReceipt.id}` : "/api/outbound",
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
        description: isEditing ? "Đã cập nhật phiếu xuất." : "Đã tạo phiếu xuất mới.",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể lưu phiếu xuất",
        variant: "destructive",
      });
    }
  };

  const getPurposeBadgeClass = (purposeId: string) => {
    const purpose = outboundPurposes.find(p => p.id === purposeId);
    return purpose?.color || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusBadgeClass = (statusId: string) => {
    const status = outboundStatuses.find(s => s.id === statusId);
    return status?.color || "bg-gray-100 text-gray-800";
  };

  const getPurposeName = (purposeId: string) => {
    return outboundPurposes.find(p => p.id === purposeId)?.name || purposeId;
  };

  const getStatusName = (statusId: string) => {
    return outboundStatuses.find(s => s.id === statusId)?.name || statusId;
  };

  const getReceiverDisplay = (receipt: OutboundReceipt) => {
    if (!receipt.receiver || typeof receipt.receiver !== 'object') return "-";
    const dept = receipt.receiver.department;
    if (dept && typeof dept === 'object') {
      return `${receipt.receiver.name} (${dept.name})`;
    }
    return receipt.receiver.name;
  };

  return (
    <div className="w-full space-y-2">
      <PageHeader title="Xuất kho" breadcrumbs={<Breadcrumbs />}>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo Phiếu xuất
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Mục đích xuất</label>
              <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Tất cả --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- Tất cả --</SelectItem>
                  {outboundPurposes.map((purpose) => (
                    <SelectItem key={purpose.id} value={purpose.id}>
                      {purpose.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <Input
                placeholder="Số Phiếu, Đơn vị nhận, Lý do..."
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
                  {outboundStatuses.map((status) => (
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
                <TableHead>MÃ PHIẾU</TableHead>
                <TableHead>NGÀY XUẤT</TableHead>
                <TableHead>MỤC ĐÍCH</TableHead>
                <TableHead>ĐƠN VỊ NHẬN</TableHead>
                <TableHead>LÝ DO</TableHead>
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
                      {format(new Date(receipt.outboundDate), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-semibold border",
                          getPurposeBadgeClass(receipt.purposeId)
                        )}
                      >
                        {receipt.purpose?.name || getPurposeName(receipt.purposeId)}
                      </span>
                    </TableCell>
                    <TableCell>{getReceiverDisplay(receipt)}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {receipt.reason || "-"}
                    </TableCell>
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
                                xuất &quot;{receipt.receiptCode}&quot; sẽ bị xóa vĩnh viễn.
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
                    Không tìm thấy phiếu xuất nào.
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
                ? `Chi tiết Phiếu xuất: ${selectedReceipt?.receiptCode}`
                : selectedReceipt?.id && receipts.some((r) => r.id === selectedReceipt.id)
                ? `Cập nhật Phiếu xuất: ${selectedReceipt?.receiptCode}`
                : "Tạo Phiếu xuất mới"}
            </DialogTitle>
          </DialogHeader>
          <OutboundForm
            receipt={selectedReceipt}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            viewMode={viewMode}
            outboundPurposes={outboundPurposes}
            outboundStatuses={outboundStatuses}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
