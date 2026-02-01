"use client";

import { useState, useEffect } from "react";
import type { Material, MaterialRequest, MasterDataItem } from "@/lib/types";
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
import { useMaterialRequests } from "@/hooks/use-material-requests";
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
import { RequestForm, type RequestFormValues } from "./request-form";

type MaterialRequestsClientProps = {
  materials: Material[];
};

type User = {
  id: string;
  name: string;
  employeeCode: string;
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Yêu cầu Vật tư</span>
  </div>
);

export function MaterialRequestsClient({
  materials,
}: MaterialRequestsClientProps) {
  const { toast } = useToast();

  // Master data states
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<MasterDataItem[]>([]);
  const [priorities, setPriorities] = useState<MasterDataItem[]>([]);
  const [statuses, setStatuses] = useState<MasterDataItem[]>([]);

  // Fetch master data on mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [usersRes, deptRes, priorityRes, statusRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/master-data/department"),
          fetch("/api/master-data/request-priority"),
          fetch("/api/master-data/request-status"),
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.data || []);
        }
        if (deptRes.ok) {
          const deptData = await deptRes.json();
          setDepartments(deptData.items || []);
        }
        if (priorityRes.ok) {
          const priorityData = await priorityRes.json();
          setPriorities(priorityData.items || []);
        }
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setStatuses(statusData.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch master data:", error);
      }
    };

    fetchMasterData();
  }, []);

  // Use API hook for data fetching and mutations
  const {
    requests,
    isLoading,
    pagination,
    createRequest,
    updateRequest,
    deleteRequest,
    setFilters,
    setPage,
  } = useMaterialRequests(6);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<MaterialRequest | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Apply filters via API - only when filter values change (not on master data load)
  useEffect(() => {
    setFilters({
      search: searchQuery || undefined,
      department:
        departmentFilter !== "all"
          ? departments.find((d) => d.id === departmentFilter)?.name
          : undefined,
      status:
        statusFilter !== "all"
          ? statuses.find((s) => s.id === statusFilter)?.name
          : undefined,
      priority:
        priorityFilter !== "all"
          ? priorities.find((p) => p.id === priorityFilter)?.name
          : undefined,
    });
    // Only depend on actual filter values, not master data arrays
    // Master data arrays are used for lookups only, not as triggers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, departmentFilter, statusFilter, priorityFilter, setFilters]);

  const handleAdd = () => {
    const newRequestTemplate: MaterialRequest = {
      id: `YCVT-${new Date().getFullYear()}-XXX`,
      requesterId: users[0]?.id || "",
      departmentId: "",
      priorityId: priorities.find((p) => p.code === "NOR")?.id || priorities[0]?.id || "",
      statusId: "",
      reason: "",
      requestDate: new Date().toISOString(),
      items: [],
      step: 1,
    };
    setSelectedRequest(newRequestTemplate);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleEdit = (request: MaterialRequest) => {
    setSelectedRequest(request);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleView = (request: MaterialRequest) => {
    setSelectedRequest(request);
    setViewMode(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteRequest(id);
    if (success) {
      toast({
        title: "Thành công",
        description: `Đã xóa yêu cầu ${id}.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Lỗi",
        description: `Không thể xóa yêu cầu ${id}.`,
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (values: RequestFormValues) => {
    if (viewMode) {
      setIsFormOpen(false);
      return;
    }

    setIsSubmitting(true);
    const isEditing = requests.some((r) => r.id === selectedRequest?.id);

    try {
      if (isEditing) {
        const result = await updateRequest(selectedRequest!.id, {
          departmentId: values.departmentId,
          priorityId: values.priorityId,
          reason: values.reason,
          workOrder: values.workOrder,
          items: values.items.map((item) => ({
            materialId: item.materialId,
            unitId: item.unitId,
            requestedQuantity: item.requestedQuantity,
            stock: item.stock,
            notes: item.notes,
          })),
        });
        if (result) {
          toast({
            title: "Thành công",
            description: "Đã cập nhật yêu cầu.",
          });
        }
      } else {
        const result = await createRequest({
          requesterId: values.requesterId,
          departmentId: values.departmentId,
          priorityId: values.priorityId,
          reason: values.reason,
          workOrder: values.workOrder,
          requestDate: values.requestDate.toISOString(),
          items: values.items.map((item) => ({
            materialId: item.materialId,
            unitId: item.unitId,
            requestedQuantity: item.requestedQuantity,
            stock: item.stock,
            notes: item.notes,
          })),
        });
        if (result) {
          toast({
            title: "Thành công",
            description: "Đã tạo yêu cầu mới.",
          });
        }
      }
      setIsFormOpen(false);
    } catch {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi lưu dữ liệu.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status?: MasterDataItem) => {
    const code = status?.code;
    const name = status?.name;
    if (code === "APPR" || name === "Đã duyệt") {
      return "bg-green-100 text-green-800";
    }
    if (code === "PEND" || name === "Chờ duyệt") {
      return "bg-yellow-100 text-yellow-800";
    }
    if (code === "DONE" || name === "Hoàn thành") {
      return "bg-blue-100 text-blue-800";
    }
    // Use color from master data if available
    if (status?.color) {
      return status.color;
    }
    return "bg-gray-100 text-gray-800";
  };

  const getPriorityClass = (priority?: MasterDataItem) => {
    const code = priority?.code;
    const name = priority?.name;
    if (code === "URG" || name === "Khẩn cấp") {
      return "text-red-600 font-semibold";
    }
    return "";
  };

  return (
    <div className="w-full space-y-2">
      <PageHeader title="Yêu cầu Vật tư" breadcrumbs={<Breadcrumbs />}>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả bộ phận --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả bộ phận --</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Tìm mã phiếu, người YC, nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả trạng thái --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả trạng thái --</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả độ ưu tiên --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả độ ưu tiên --</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority.id} value={priority.id}>
                    {priority.name}
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
                <TableHead className="w-[50px]">STT</TableHead>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Người YC</TableHead>
                <TableHead>Lý do / Mục đích</TableHead>
                <TableHead>Ngày yêu cầu</TableHead>
                <TableHead>Ưu tiên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[120px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : requests.length > 0 ? (
                requests.map((request, index) => (
                  <TableRow key={request.id}>
                    <TableCell className="text-center">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </TableCell>
                    <TableCell
                      className="font-medium text-primary hover:underline cursor-pointer"
                      onClick={() => handleView(request)}
                    >
                      {request.id}
                    </TableCell>
                    <TableCell>
                      <div>{request.requester?.name || request.requesterName}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.department?.name || request.requesterDept}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {request.reason}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.requestDate), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell
                      className={cn(getPriorityClass(request.priority))}
                    >
                      {request.priority?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-semibold",
                          getStatusBadgeClass(request.status)
                        )}
                      >
                        {request.status?.name || "-"}
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
                                Hành động này không thể được hoàn tác. Yêu cầu "
                                {request.id}" sẽ bị xóa vĩnh viễn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(request.id)}
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
                    colSpan={8}
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
            Hiển thị{" "}
            {pagination.total > 0
              ? (pagination.page - 1) * pagination.limit + 1
              : 0}
            -{Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
            trên {pagination.total} bản ghi
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={pagination.page === page ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(page)}
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
                setPage(Math.min(pagination.totalPages, pagination.page + 1))
              }
              disabled={pagination.page === pagination.totalPages}
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
                ? `Chi tiết Yêu cầu: ${selectedRequest?.id}`
                : selectedRequest?.id &&
                  requests.some((r) => r.id === selectedRequest.id)
                ? "Cập nhật Yêu cầu"
                : "Tạo Yêu cầu mới"}
            </DialogTitle>
          </DialogHeader>
          <RequestForm
            request={selectedRequest}
            materials={materials}
            users={users}
            departments={departments}
            priorities={priorities}
            statuses={statuses}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            viewMode={viewMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
