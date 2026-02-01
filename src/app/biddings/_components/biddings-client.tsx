"use client";

import { useState, useMemo, useEffect } from "react";
import type { BiddingPackage } from "@/lib/types";
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

export function BiddingsClient({
  initialBiddings,
}: BiddingsClientProps) {
  const [biddings, setBiddings] = useState<BiddingPackage[]>(initialBiddings);
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBidding, setSelectedBidding] =
    useState<BiddingPackage | null>(null);
  const [viewMode, setViewMode] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBiddings = useMemo(() => {
    return biddings.filter((bidding) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        bidding.id.toLowerCase().includes(searchLower) ||
        bidding.name.toLowerCase().includes(searchLower);

      const matchesMethod =
        methodFilter === "all" || bidding.method === methodFilter;

      const matchesStatus =
        statusFilter === "all" || bidding.status === statusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [biddings, searchQuery, methodFilter, statusFilter]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
    const newBiddingTemplate: BiddingPackage = {
      id: `TB-2025-${String(biddings.length + 1).padStart(2, "0")}`,
      name: "",
      purchaseRequestId: "",
      estimatedPrice: 0,
      method: 'Đấu thầu rộng rãi' as any,
      status: 'Đang mời thầu' as any,
      step: 1,
      items: [],
    };
    setSelectedBidding(newBiddingTemplate);
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

  const handleDelete = (id: string) => {
    setBiddings(biddings.filter((b) => b.id !== id));
    toast({
      title: "Thành công",
      description: `Đã xóa gói thầu ${id}.`,
      variant: "destructive",
    });
  };

  const handleFormSubmit = (values: BiddingFormValues) => {
    const submittedBidding: BiddingPackage = {
      ...selectedBidding!,
      ...values,
      openingDate: values.openingDate?.toISOString(),
      closingDate: values.closingDate?.toISOString(),
      items: values.items || [],
      result: values.result,
    };

    if (viewMode) {
      setIsFormOpen(false);
      return;
    }

    const isEditing = biddings.some(b => b.id === submittedBidding.id);

    if (isEditing) {
      setBiddings(biddings.map((b) => b.id === submittedBidding.id ? submittedBidding : b));
    } else {
      setBiddings([submittedBidding, ...biddings]);
    }
    setIsFormOpen(false);
    toast({
      title: "Thành công",
      description: isEditing ? "Đã cập nhật gói thầu." : "Đã tạo gói thầu mới.",
    });
  };

  const getStatusBadgeClass = (status: BiddingPackage["status"]) => {
    switch (status) {
      case "Đang mời thầu":
        return "bg-blue-100 text-blue-800";
      case "Đã mở thầu":
        return "bg-cyan-100 text-cyan-800";
      case "Đang chấm thầu":
        return "bg-yellow-100 text-yellow-800";
      case "Hoàn thành":
        return "bg-green-100 text-green-800";
      case "Đã hủy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full space-y-2">
      <PageHeader title="Quản lý Đấu thầu" breadcrumbs={<Breadcrumbs />}>
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
                    <SelectItem value="Chỉ định thầu">Chỉ định thầu</SelectItem>
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
                      {bidding.purchaseRequestId}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {bidding.estimatedPrice.toLocaleString("en-US")}
                    </TableCell>
                     <TableCell>{bidding.method}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-semibold",
                          getStatusBadgeClass(bidding.status)
                        )}
                      >
                        {bidding.status}
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
                    Không tìm thấy gói thầu nào.
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
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {viewMode
                ? `Chi tiết Gói thầu: ${selectedBidding?.id}`
                : biddings.some(b => b.id === selectedBidding?.id)
                ? "Cập nhật Gói thầu"
                : "Tạo Gói thầu mới"}
            </DialogTitle>
          </DialogHeader>
          <BiddingForm
            biddingPackage={selectedBidding}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            viewMode={viewMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
