"use client";

import { useState, useMemo, useEffect } from "react";
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
import { getRoles } from "@/lib/data";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Danh mục</span>
  </div>
);

export function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [roles, setRoles] = useState<string[]>([]);
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    async function fetchRoles() {
      const fetchedRoles = await getRoles();
      setRoles(fetchedRoles.map(r => r.name));
    }
    fetchRoles();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        !searchQuery ||
        user.name.toLowerCase().includes(searchLower) ||
        user.employeeCode.toLowerCase().includes(searchLower) ||
        user.department.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
      );
    });
  }, [users, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredUsers.length
  );
  
  const handleAdd = () => {
    setSelectedUser({
      id: `user-${Date.now()}`,
      employeeCode: `NV${String(users.length + 1).padStart(3, '0')}`,
      name: '',
      email: '',
      department: '',
      role: '',
      status: 'Active',
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

  const handleDelete = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
    toast({
      title: "Thành công",
      description: "Đã xóa người dùng thành công.",
      variant: "destructive",
    });
  };

  const handleFormSubmit = (values: UserFormValues) => {
     if (viewMode) {
      setIsFormOpen(false);
      return;
    }
    const isEditing = users.some((u) => u.id === selectedUser?.id);
    
    if (isEditing) {
      setUsers(users.map((u) => u.id === selectedUser!.id ? { ...selectedUser!, ...values } : u));
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        ...values,
      };
      setUsers([newUser, ...users].sort((a,b) => a.employeeCode.localeCompare(b.employeeCode)));
    }
    
    setIsFormOpen(false);
    toast({
      title: 'Thành công!',
      description: isEditing ? 'Đã cập nhật thông tin người dùng.' : 'Đã tạo người dùng mới thành công.',
    });
  }

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
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-center">{startItem + index}</TableCell>
                    <TableCell className="font-medium text-primary hover:underline cursor-pointer" onClick={() => handleView(user)}>
                      {user.employeeCode}
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.role}</TableCell>
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
                                Hành động này không thể được hoàn tác. Người dùng "{user.name}" sẽ bị xóa vĩnh viễn.
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
                    Không tìm thấy người dùng nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredUsers.length > 0 ? startItem : 0}-{endItem} trên {filteredUsers.length} bản ghi
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
                variant={currentPage === page ? "default" : "outline"}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
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
                : users.some(u => u.id === selectedUser?.id)
                ? 'Cập nhật Người dùng'
                : 'Tạo Người dùng mới'}
            </DialogTitle>
          </DialogHeader>
          {isFormOpen && (
            <UserForm
              user={selectedUser}
              roles={roles}
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
