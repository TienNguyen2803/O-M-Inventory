"use client";

import { useState, useEffect } from "react";
import type { User } from "@/lib/types";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { UserForm, type UserFormValues } from "./user-form";
import { useUsers, useRoles, useDepartments } from "@/hooks/use-users";
import { Skeleton } from "@/components/ui/skeleton";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Danh mục</span>
  </div>
);

export function UsersClient() {
  const {
    users,
    isLoading,
    error,
    pagination,
    createUser,
    updateUser,
    deleteUser,
    setSearch,
    setPage,
  } = useUsers(10);
  
  const { roles: rolesData } = useRoles();
  const { departments } = useDepartments();
  
  // Helper functions to lookup names from IDs
  const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || id;
  const getRoleName = (id: string) => rolesData.find(r => r.id === id)?.name || id;
  
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, setSearch]);
  
  const handleAdd = () => {
    setSelectedUser({
      id: "",
      employeeCode: "",
      name: "",
      email: "",
      department: "",
      role: "",
      status: "Active",
    });
    setViewMode(false);
    setIsFormOpen(true);
  };
  
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setViewMode(false);
    setIsFormOpen(true);
  };
  
  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewMode(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (userId: string) => {
    const success = await deleteUser(userId);
    if (success) {
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng thành công.",
      });
    } else {
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (values: UserFormValues) => {
    if (viewMode) {
      setIsFormOpen(false);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const isEditing = selectedUser?.id && selectedUser.id !== "";
      
      if (isEditing) {
        const result = await updateUser(selectedUser!.id, values);
        if (result) {
          toast({
            title: "Thành công!",
            description: "Đã cập nhật thông tin người dùng.",
          });
          setIsFormOpen(false);
        } else {
          toast({
            title: "Lỗi",
            description: error || "Không thể cập nhật người dùng.",
            variant: "destructive",
          });
        }
      } else {
        const result = await createUser(values);
        if (result) {
          toast({
            title: "Thành công!",
            description: "Đã tạo người dùng mới thành công.",
          });
          setIsFormOpen(false);
        } else {
          toast({
            title: "Lỗi",
            description: error || "Không thể tạo người dùng.",
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: User["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    const end = Math.min(pagination.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="w-full space-y-4">
      <PageHeader title="Quản lý Người dùng" breadcrumbs={<Breadcrumbs />}>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="w-full max-w-sm">
            <label htmlFor="search" className="text-sm font-medium">Tìm kiếm</label>
            <Input
              id="search"
              placeholder="Tìm kiếm theo mã, tên, phòng ban, vai trò..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1"
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
                <TableHead>MÃ NV</TableHead>
                <TableHead>HỌ TÊN</TableHead>
                <TableHead>PHÒNG BAN</TableHead>
                <TableHead>VAI TRÒ</TableHead>
                <TableHead>TRẠNG THÁI</TableHead>
                <TableHead className="w-[120px]">THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-center">{startItem + index}</TableCell>
                    <TableCell className="font-medium text-primary hover:underline cursor-pointer" onClick={() => handleView(user)}>
                      {user.employeeCode}
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{getDepartmentName(user.department)}</TableCell>
                    <TableCell>{getRoleName(user.role)}</TableCell>
                    <TableCell>
                      <span className={cn("rounded-md px-2.5 py-1 text-xs font-semibold", getStatusBadgeClass(user.status))}>
                        {user.status === 'Active' ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleView(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleEdit(user)}
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
                                Hành động này không thể được hoàn tác. Người dùng &quot;{user.name}&quot; sẽ bị xóa vĩnh viễn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(user.id)}
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
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {error ? `Lỗi: ${error}` : "Không tìm thấy người dùng nào."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {pagination.total > 0 ? startItem : 0}-{endItem} trên {pagination.total} bản ghi
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {getPageNumbers().map((page) => (
              <Button
                key={page}
                variant={pagination.page === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(page)}
                disabled={isLoading}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {viewMode
                ? `Chi tiết người dùng: ${selectedUser?.name}`
                : selectedUser?.id
                ? 'Cập nhật Người dùng'
                : 'Tạo Người dùng mới'}
            </DialogTitle>
          </DialogHeader>
          {isFormOpen && (
            <UserForm
              user={selectedUser}
              roles={rolesData}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              viewMode={viewMode}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
