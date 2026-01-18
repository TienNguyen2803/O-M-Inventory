"use client";

import { useState, useMemo, useEffect } from "react";
import type { OutboundVoucher } from "@/lib/types";
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
import { OutboundForm, type OutboundFormValues } from "./outbound-form";

type OutboundClientProps = {
  initialVouchers: OutboundVoucher[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Xuất kho</span>
  </div>
);

export function OutboundClient({ initialVouchers }: OutboundClientProps) {
  const [vouchers, setVouchers] = useState<OutboundVoucher[]>(initialVouchers);
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] =
    useState<OutboundVoucher | null>(null);
  const [viewMode, setViewMode] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((voucher) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        voucher.id.toLowerCase().includes(searchLower) ||
        voucher.materialRequestId.toLowerCase().includes(searchLower) ||
        voucher.department.toLowerCase().includes(searchLower) ||
        voucher.reason.toLowerCase().includes(searchLower);

      const matchesPurpose =
        purposeFilter === "all" || voucher.purpose === purposeFilter;
      const matchesStatus =
        statusFilter === "all" || voucher.status === statusFilter;

      return matchesSearch && matchesPurpose && matchesStatus;
    });
  }, [vouchers, searchQuery, purposeFilter, statusFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, purposeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);
  const paginatedVouchers = filteredVouchers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredVouchers.length
  );

  const handleAdd = () => {
    const newVoucherTemplate: OutboundVoucher = {
      id: `PXK-2025-${String(vouchers.length + 1).padStart(3, "0")}`,
      purpose: "Cấp O&M",
      materialRequestId: `YCVT-2025-${String(vouchers.length + 1).padStart(3, "0")}`,
      department: "PX Vận hành 1",
      receiverName: "Nguyễn Văn B",
      reason: "Bảo dưỡng định kỳ",
      status: "Đang soạn hàng",
      step: 1,
      issueDate: new Date().toISOString(),
      items: [],
    };
    setSelectedVoucher(newVoucherTemplate);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleEdit = (voucher: OutboundVoucher) => {
    setSelectedVoucher(voucher);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleView = (voucher: OutboundVoucher) => {
    setSelectedVoucher(voucher);
    setViewMode(true);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setVouchers(vouchers.filter((v) => v.id !== id));
    toast({
      title: "Thành công",
      description: `Đã xóa phiếu xuất ${id}.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (values: OutboundFormValues) => {
     const submittedVoucher: OutboundVoucher = {
      ...selectedVoucher!,
      purpose: values.purpose,
      issueDate: values.issueDate.toISOString(),
      items: values.items || [],
    };

    if (viewMode) {
      setIsFormOpen(false);
      return;
    }

    const isEditing = vouchers.some(v => v.id === submittedVoucher.id);

    if (isEditing) {
      setVouchers(vouchers.map((v) => v.id === submittedVoucher.id ? submittedVoucher : v));
    } else {
      setVouchers([submittedVoucher, ...vouchers]);
    }
    setIsFormOpen(false);
    toast({
      title: "Thành công",
      description: isEditing ? "Đã cập nhật phiếu xuất." : "Đã tạo phiếu xuất mới.",
    });
  };
  
  const getPurposeBadgeClass = (purpose: OutboundVoucher["purpose"]) => {
    switch (purpose) {
      case "Khẩn cấp":
        return "bg-red-100 text-red-800 border border-red-200";
      case "Cấp O&M":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Cho mượn":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Đi Sửa chữa":
        return "bg-gray-200 text-gray-800 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeClass = (status: OutboundVoucher["status"]) => {
    switch (status) {
      case "Đã xuất":
        return "bg-green-100 text-green-800";
      case "Đang soạn hàng":
        return "bg-blue-100 text-blue-800";
      case "Chờ xuất":
        return "bg-yellow-100 text-yellow-800";
      case "Đã hủy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full space-y-2">
      <PageHeader title="Xuất kho" breadcrumbs={<Breadcrumbs />}>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
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
                    <SelectItem value="Cấp O&M">Cấp O&M</SelectItem>
                    <SelectItem value="Khẩn cấp">Khẩn cấp</SelectItem>
                    <SelectItem value="Cho mượn">Cho mượn</SelectItem>
                    <SelectItem value="Đi Sửa chữa">Đi Sửa chữa</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <Input
                placeholder="Số Phiếu, Yêu cầu, Bộ phận..."
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
                    <SelectItem value="Đã xuất">Đã xuất</SelectItem>
                    <SelectItem value="Chờ xuất">Chờ xuất</SelectItem>
                    <SelectItem value="Đang soạn hàng">Đang soạn hàng</SelectItem>
                    <SelectItem value="Đã hủy">Đã hủy</SelectItem>
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
                <TableHead>MỤC ĐÍCH XUẤT</TableHead>
                <TableHead>YÊU CẦU SỐ</TableHead>
                <TableHead>BỘ PHẬN</TableHead>
                <TableHead>LÝ DO</TableHead>
                <TableHead>TRẠNG THÁI</TableHead>
                <TableHead className="w-[120px]">THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVouchers.length > 0 ? (
                paginatedVouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell
                      className="font-medium text-primary hover:underline cursor-pointer"
                      onClick={() => handleView(voucher)}
                    >
                      {voucher.id}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-semibold",
                          getPurposeBadgeClass(voucher.purpose)
                        )}
                      >
                        {voucher.purpose}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {voucher.materialRequestId}
                    </TableCell>
                    <TableCell>{voucher.department}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {voucher.reason}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-semibold",
                          getStatusBadgeClass(voucher.status)
                        )}
                      >
                        {voucher.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleView(voucher)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleEdit(voucher)}
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
                                Hành động này không thể được hoàn tác. Phiếu xuất "
                                {voucher.id}" sẽ bị xóa vĩnh viễn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(voucher.id)}
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
            Hiển thị {filteredVouchers.length > 0 ? startItem : 0}-{endItem} trên {filteredVouchers.length} bản ghi
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
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>
              {viewMode
                ? `Chi tiết Phiếu xuất: ${selectedVoucher?.id}`
                : vouchers.some(v => v.id === selectedVoucher?.id)
                ? "Cập nhật Phiếu xuất"
                : "Tạo Phiếu xuất mới"}
            </DialogTitle>
          </DialogHeader>
          <OutboundForm
            voucher={selectedVoucher}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            viewMode={viewMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
