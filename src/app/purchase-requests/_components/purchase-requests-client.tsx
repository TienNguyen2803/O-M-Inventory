"use client";

import { useState, useMemo, useEffect } from "react";
import type { PurchaseRequest, MasterDataItem } from "@/lib/types";
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
import { PurchaseRequestForm, type PurchaseRequestFormValues } from "./purchase-request-form";

type PurchaseRequestsClientProps = {
  initialRequests: PurchaseRequest[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Yêu cầu Mua sắm</span>
  </div>
);

export function PurchaseRequestsClient({
  initialRequests,
}: PurchaseRequestsClientProps) {
  const [requests, setRequests] = useState<PurchaseRequest[]>(initialRequests);
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Master data for filters
  const [materialOrigins, setMaterialOrigins] = useState<MasterDataItem[]>([]);
  const [requestStatuses, setRequestStatuses] = useState<MasterDataItem[]>([]);

  // Fetch master data for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [originRes, statusRes] = await Promise.all([
          fetch('/api/master-data/material-origin'),
          fetch('/api/master-data/request-status'),
        ]);
        if (originRes.ok) {
          const data = await originRes.json();
          setMaterialOrigins(data.items || []);
        }
        if (statusRes.ok) {
          const data = await statusRes.json();
          setRequestStatuses(data.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };
    fetchFilterData();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchLower = searchQuery.toLowerCase();
      const requesterName = request.requester?.name || request.requesterName || '';
      const matchesSearch =
        !searchQuery ||
        request.id.toLowerCase().includes(searchLower) ||
        requesterName.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower);

      // Filter by sourceId
      const matchesSource =
        sourceFilter === "all" || request.sourceId === sourceFilter;

      // Filter by statusId
      const matchesStatus =
        statusFilter === "all" || request.statusId === statusFilter;

      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [requests, searchQuery, sourceFilter, statusFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sourceFilter, statusFilter]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredRequests.length
  );

  const handleAdd = () => {
    setSelectedRequest(null); // null = create mode
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleEdit = (request: PurchaseRequest) => {
    setSelectedRequest(request);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleView = (request: PurchaseRequest) => {
    setSelectedRequest(request);
    setViewMode(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (requestCode: string) => {
    try {
      const response = await fetch(`/api/purchase-requests/${requestCode}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      setRequests(requests.filter((r) => r.requestCode !== requestCode && r.id !== requestCode));
      toast({
        title: "Thành công",
        description: `Đã xóa yêu cầu ${requestCode}.`,
        variant: "destructive",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể xóa yêu cầu. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (values: PurchaseRequestFormValues) => {
    if (viewMode) {
      setIsFormOpen(false);
      return;
    }

    setIsSubmitting(true);
    const isEditing = selectedRequest !== null;

    try {
      // Prepare request body
      const body = {
        sourceId: values.sourceId,
        fundingSourceId: values.fundingSourceId,
        description: values.description,
        items: values.items.map(item => ({
          name: item.name,
          materialId: item.materialId || null,
          unitId: item.unitId,
          quantity: item.quantity,
          estimatedPrice: item.estimatedPrice,
          suggestedSupplierId: item.suggestedSupplierId || null,
        })),
      };

      let response: Response;
      if (isEditing) {
        // Update existing
        response = await fetch(`/api/purchase-requests/${selectedRequest.requestCode || selectedRequest.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        // Create new - need requesterId and departmentId
        // For now, use first available user/department (should come from auth context in real app)
        const usersRes = await fetch('/api/users?limit=1');
        const usersData = await usersRes.json();
        const firstUser = usersData.data?.[0];

        if (!firstUser) {
          throw new Error('No user found');
        }

        response = await fetch('/api/purchase-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...body,
            requesterId: firstUser.id,
            departmentId: firstUser.departmentId,
          }),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      const result = await response.json();
      const savedRequest = result.data as PurchaseRequest;

      if (isEditing) {
        setRequests(requests.map((r) =>
          (r.requestCode === savedRequest.requestCode || r.id === savedRequest.id)
            ? savedRequest
            : r
        ));
      } else {
        setRequests([savedRequest, ...requests]);
      }

      setIsFormOpen(false);
      toast({
        title: "Thành công",
        description: isEditing ? "Đã cập nhật yêu cầu." : "Đã tạo yêu cầu mới.",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể lưu yêu cầu. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status?: PurchaseRequest["status"]) => {
    const statusCode = status?.code || status?.name;
    switch (statusCode) {
      case "APPR":
      case "Approved":
        return "bg-green-100 text-green-800";
      case "PEND":
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "REJ":
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "DONE":
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return status?.color || "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full space-y-2">
      <PageHeader title="Yêu cầu Mua sắm" breadcrumbs={<Breadcrumbs />}>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="Tìm kiếm Số PR, Người đề nghị, Nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="-- Nguồn gốc --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả nguồn gốc --</SelectItem>
                {materialOrigins.map((origin) => (
                  <SelectItem key={origin.id} value={origin.id}>
                    {origin.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả trạng thái --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả trạng thái --</SelectItem>
                {requestStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
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
                <TableHead>MÃ PR</TableHead>
                <TableHead>NGƯỜI YC</TableHead>
                <TableHead>NỘI DUNG</TableHead>
                <TableHead>NGUỒN GỐC</TableHead>
                <TableHead className="text-right">TỔNG TIỀN</TableHead>
                <TableHead>TRẠNG THÁI</TableHead>
                <TableHead className="w-[120px]">THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell
                      className="font-medium text-primary hover:underline cursor-pointer"
                      onClick={() => handleView(request)}
                    >
                      {request.requestCode || request.id}
                    </TableCell>
                    <TableCell>
                      <div>{request.requester?.name || request.requesterName}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.department?.name || request.requesterDept}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {request.description}
                    </TableCell>
                    <TableCell>{request.source?.name || ''}</TableCell>
                    <TableCell className="text-right font-medium">
                      {request.totalAmount.toLocaleString("vi-VN", { style: 'currency', currency: 'VND' })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-semibold",
                          getStatusBadgeClass(request.status)
                        )}
                      >
                        {request.status?.name || ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleView(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleEdit(request)}
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
                                Hành động này không thể được hoàn tác. Yêu cầu &quot;
                                {request.requestCode || request.id}&quot; sẽ bị xóa vĩnh viễn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(request.requestCode || request.id)}
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
                    Không tìm thấy yêu cầu nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredRequests.length > 0 ? startItem : 0}-{endItem} trên {filteredRequests.length} bản ghi
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
                ? `Chi tiết Phiếu mua: ${selectedRequest?.requestCode || selectedRequest?.id}`
                : selectedRequest
                ? "Cập nhật Phiếu mua"
                : "Tạo Phiếu mua mới"}
            </DialogTitle>
          </DialogHeader>
          {isSubmitting ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Đang lưu...</span>
            </div>
          ) : (
            <PurchaseRequestForm
              request={selectedRequest}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              viewMode={viewMode}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
