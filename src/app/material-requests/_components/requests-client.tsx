"use client";

import { useState, useMemo, useEffect } from "react";
import type { MaterialRequest } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type MaterialRequestsClientProps = {
  initialRequests: MaterialRequest[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Yêu cầu Vật tư</span>
  </div>
);

export function MaterialRequestsClient({ initialRequests }: MaterialRequestsClientProps) {
  const [requests, setRequests] = useState<MaterialRequest[]>(initialRequests);
  const { toast } = useToast();

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const departments = useMemo(
    () => [...new Set(requests.map((r) => r.requesterDept))],
    [requests]
  );

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        request.id.toLowerCase().includes(searchLower) ||
        request.requesterName.toLowerCase().includes(searchLower) ||
        request.content.toLowerCase().includes(searchLower);

      const matchesDepartment =
        departmentFilter === "all" || request.requesterDept === departmentFilter;
      
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || request.priority === priorityFilter;

      return matchesSearch && matchesDepartment && matchesStatus && matchesPriority;
    });
  }, [requests, searchQuery, departmentFilter, statusFilter, priorityFilter]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, statusFilter, priorityFilter]);

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
  
  const handleDelete = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id));
    toast({
      title: "Thành công",
      description: `Đã xóa yêu cầu ${id}.`,
      variant: "destructive",
    });
  };

  const getStatusBadgeClass = (status: MaterialRequest["status"]) => {
    switch (status) {
      case "Đã duyệt":
        return "bg-green-100 text-green-800";
      case "Chờ duyệt":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
   const getPriorityClass = (priority: MaterialRequest["priority"]) => {
    switch (priority) {
      case "Khẩn cấp":
        return "text-red-600 font-semibold";
      default:
        return "";
    }
  };

  return (
    <div className="w-full space-y-2">
      <PageHeader
        title="Yêu cầu Vật tư"
        breadcrumbs={<Breadcrumbs />}
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </PageHeader>
      
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả bộ phận --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả bộ phận --</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
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
                <SelectItem value="Chờ duyệt">Chờ duyệt</SelectItem>
                <SelectItem value="Đã duyệt">Đã duyệt</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả độ ưu tiên --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả độ ưu tiên --</SelectItem>
                <SelectItem value="Bình thường">Bình thường</SelectItem>
                <SelectItem value="Khẩn cấp">Khẩn cấp</SelectItem>
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
                <TableHead>Nội dung</TableHead>
                <TableHead>Ngày cần</TableHead>
                <TableHead>Ưu tiên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[120px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map((request, index) => (
                  <TableRow key={request.id}>
                    <TableCell className="text-center">
                      {startItem + index}
                    </TableCell>
                    <TableCell className="font-medium text-primary hover:underline cursor-pointer">
                      {request.id}
                    </TableCell>
                    <TableCell>
                      <div>{request.requesterName}</div>
                      <div className="text-xs text-muted-foreground">{request.requesterDept}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {request.content}
                    </TableCell>
                    <TableCell>{format(new Date(request.neededDate), "dd/MM/yyyy")}</TableCell>
                    <TableCell className={cn(getPriorityClass(request.priority))}>{request.priority}</TableCell>
                     <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-semibold",
                          getStatusBadgeClass(request.status)
                        )}
                      >
                        {request.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
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
            Hiển thị {filteredRequests.length > 0 ? startItem : 0}-{endItem}{" "}
            trên {filteredRequests.length} bản ghi
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(page)}
                >
                    {page}
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
  );
}
