"use client";

import { useState, useMemo, useEffect } from "react";
import type { BiddingPackage, MasterDataItem } from "@/lib/types";
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
  RefreshCw,
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
import { BiddingForm, type BiddingFormValues } from "./bidding-form";

type BiddingsClientProps = {
  initialBiddings: BiddingPackage[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Quản lý Đấu thầu</span>
  </div>
);

// Helper to get status badge class based on status code or name
function getStatusBadgeClass(status?: MasterDataItem | string): string {
  const statusCode = typeof status === 'object' ? status?.code : status;
  const statusName = typeof status === 'object' ? status?.name : status;

  // Check by code first
  switch (statusCode) {
    case "INVITE": return "bg-blue-100 text-blue-800";
    case "OPEN":
    case "OPENED": return "bg-yellow-100 text-yellow-800";
    case "EVAL": return "bg-orange-100 text-orange-800";
    case "DONE": return "bg-green-100 text-green-800";
    case "CANCEL": return "bg-red-100 text-red-800";
  }

  // Fallback to name check
  switch (statusName) {
    case "Đang mời thầu": return "bg-blue-100 text-blue-800";
    case "Đã mở thầu": return "bg-yellow-100 text-yellow-800";
    case "Đang chấm thầu": return "bg-orange-100 text-orange-800";
    case "Hoàn thành": return "bg-green-100 text-green-800";
    case "Đã hủy": return "bg-red-100 text-red-800";
  }

  // Use color from MasterDataItem if available
  if (typeof status === 'object' && status?.color) {
    return status.color;
  }

  return "bg-gray-100 text-gray-800";
}

export function BiddingsClient({
  initialBiddings,
}: BiddingsClientProps) {
  const [biddings, setBiddings] = useState<BiddingPackage[]>(initialBiddings);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBidding, setSelectedBidding] =
    useState<BiddingPackage | null>(null);
  const [viewMode, setViewMode] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch latest data
  const fetchBiddings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bidding-packages?limit=100');
      if (response.ok) {
        const json = await response.json();
        setBiddings(json.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch biddings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBiddings = useMemo(() => {
    return biddings.filter((bidding) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        bidding.id.toLowerCase().includes(searchLower) ||
        bidding.name.toLowerCase().includes(searchLower);

      const methodName = typeof bidding.method === 'object' ? bidding.method?.name : bidding.method;
      const matchesMethod =
        methodFilter === "all" || methodName === methodFilter;

      const statusName = typeof bidding.status === 'object' ? bidding.status?.name : bidding.status;
      const matchesStatus =
        statusFilter === "all" || statusName === statusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [biddings, searchQuery, methodFilter, statusFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, methodFilter, statusFilter]);

  const totalPages = Math.ceil(filteredBiddings.length / itemsPerPage);
  const paginatedBiddings = filteredBiddings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredBiddings.length
  );

  // Handlers
  const handleAdd = () => {
    setSelectedBidding(null);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleEdit = (bidding: BiddingPackage) => {
    setSelectedBidding(bidding);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleView = (bidding: BiddingPackage) => {
    setSelectedBidding(bidding);
    setViewMode(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/bidding-packages/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBiddings(biddings.filter((b) => b.id !== id));
        toast({
          title: "Thành công",
          description: `Đã xóa gói thầu ${id}.`,
        });
      } else {
        throw new Error('Failed to delete');
      }
    } catch {
      toast({
        title: "Lỗi",
        description: `Không thể xóa gói thầu ${id}.`,
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (values: BiddingFormValues) => {
    if (viewMode) {
      setIsFormOpen(false);
      return;
    }

    const isEditing = selectedBidding && biddings.some(b => b.id === selectedBidding.id);

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `/api/bidding-packages/${selectedBidding.id}`
        : '/api/bidding-packages';

      console.log('Submitting form:', { method, url, values });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const json = await response.json();
      console.log('API response:', { status: response.status, json });

      if (response.ok) {
        if (isEditing) {
          setBiddings(biddings.map((b) => b.id === json.data.id ? json.data : b));
        } else {
          setBiddings([json.data, ...biddings]);
        }
        setIsFormOpen(false);
        toast({
          title: "Thành công",
          description: isEditing ? "Đã cập nhật gói thầu." : "Đã tạo gói thầu mới.",
        });
      } else {
        const errorMsg = json.error || json.message || 'Failed to save';
        console.error('API error:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể lưu gói thầu.",
        variant: "destructive",
      });
    }
  };


  // Helper to display method/status name
  const getDisplayName = (value?: MasterDataItem | string): string => {
    if (!value) return '-';
    return typeof value === 'object' ? value.name : value;
  };

  // Format currency
  const formatCurrency = (amount?: number): string => {
    if (!amount) return '-';
    return amount.toLocaleString('vi-VN');
  };

  // Get PR codes from purchase requests
  const getPRCodes = (bidding: BiddingPackage): string => {
    if (bidding.purchaseRequests && bidding.purchaseRequests.length > 0) {
      return bidding.purchaseRequests.map(pr => pr.requestCode).join(', ');
    }
    return bidding.purchaseRequestId || '-';
  };

  return (
    <div className="w-full space-y-2">
      <PageHeader title="Quản lý Đấu thầu" breadcrumbs={<Breadcrumbs />}>
        <Button variant="outline" onClick={fetchBiddings} disabled={isLoading}>
          <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
          Làm mới
        </Button>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-1">
                <label className="text-sm font-medium">Hình thức</label>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                    <SelectValue placeholder="-- Tất cả --" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">-- Tất cả --</SelectItem>
                    <SelectItem value="Đấu thầu rộng rãi">Đấu thầu rộng rãi</SelectItem>
                    <SelectItem value="Đấu thầu hạn chế">Đấu thầu hạn chế</SelectItem>
                    <SelectItem value="Chỉ định thầu">Chỉ định thầu</SelectItem>
                    <SelectItem value="Chào hàng cạnh tranh">Chào hàng cạnh tranh</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <Input
                placeholder="Mã gói, Tên gói thầu..."
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
                    <SelectItem value="Đang mời thầu">Đang mời thầu</SelectItem>
                    <SelectItem value="Đã mở thầu">Đã mở thầu</SelectItem>
                    <SelectItem value="Đang chấm thầu">Đang chấm thầu</SelectItem>
                    <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
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
                <TableHead>MÃ GÓI</TableHead>
                <TableHead>TÊN GÓI THẦU</TableHead>
                <TableHead>CĂN CỨ PR</TableHead>
                <TableHead className="text-right">GIÁ DỰ TOÁN</TableHead>
                <TableHead>HÌNH THỨC</TableHead>
                <TableHead>TRẠNG THÁI</TableHead>
                <TableHead className="w-[120px]">THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBiddings.length > 0 ? (
                paginatedBiddings.map((bidding) => (
                  <TableRow key={bidding.id}>
                    <TableCell
                      className="font-medium text-primary hover:underline cursor-pointer"
                      onClick={() => handleView(bidding)}
                    >
                      {bidding.id}
                    </TableCell>
                    <TableCell>
                      {bidding.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getPRCodes(bidding)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(bidding.estimatedBudget || bidding.estimatedPrice)}
                    </TableCell>
                     <TableCell>{getDisplayName(bidding.method)}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-semibold",
                          getStatusBadgeClass(bidding.status)
                        )}
                      >
                        {getDisplayName(bidding.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleView(bidding)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleEdit(bidding)}
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
                                Hành động này không thể được hoàn tác. Gói thầu "
                                {bidding.id}" sẽ bị xóa vĩnh viễn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(bidding.id)}
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
                    {isLoading ? "Đang tải..." : "Không tìm thấy gói thầu nào."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredBiddings.length > 0 ? startItem : 0}-{endItem} trên {filteredBiddings.length} bản ghi
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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewMode
                ? `Chi tiết Gói thầu: ${selectedBidding?.id}`
                : selectedBidding
                ? "Cập nhật Gói thầu"
                : "Tạo Gói thầu mới"}
            </DialogTitle>
          </DialogHeader>
          <BiddingForm
            biddingPackage={selectedBidding}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              fetchBiddings(); // Refresh list after closing
            }}
            viewMode={viewMode}
            onRefresh={fetchBiddings}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
