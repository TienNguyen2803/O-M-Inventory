"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserPlus,
  Trash2,
  Loader2,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useRoleUsers, type Role, type RoleUser } from "@/hooks/use-permissions";

interface UserAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onUserCountChange?: () => void;
}

interface AvailableUser {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  department: string;
}

export function UserAssignmentDialog({
  open,
  onOpenChange,
  role,
  onUserCountChange,
}: UserAssignmentDialogProps) {
  const { users, isLoading, addUsers, removeUser, fetchUsers } = useRoleUsers(
    role?.id || null
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<AvailableUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  // Fetch all available users when dialog opens
  const fetchAllUsers = useCallback(async () => {
    if (!open || !role) return;
    
    setIsLoadingUsers(true);
    try {
      const response = await fetch(`/api/users?limit=100`);
      const data = await response.json();
      if (response.ok) {
        setAllUsers(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [open, role]);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedUserIds([]);
    }
  }, [open]);

  // Get available users (not already in role)
  const availableUsers = allUsers.filter(
    (u) => !users.some((ru) => ru.id === u.id)
  );

  // Filter by search query
  const filteredAvailableUsers = availableUsers.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.employeeCode.toLowerCase().includes(query)
    );
  });

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddUsers = async () => {
    if (selectedUserIds.length === 0) return;
    setIsAdding(true);
    await addUsers(selectedUserIds);
    setSelectedUserIds([]);
    onUserCountChange?.();
    await fetchAllUsers();
    setIsAdding(false);
  };

  const handleRemoveUser = async (userId: string) => {
    setRemovingUserId(userId);
    await removeUser(userId);
    onUserCountChange?.();
    await fetchAllUsers();
    setRemovingUserId(null);
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Quản lý thành viên - <span className="text-primary">{role.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
          {/* Left Panel - Available Users */}
          <div className="flex flex-col border-r bg-muted/30">
            <div className="p-4 border-b bg-background">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-500" />
                Người dùng có thể thêm ({availableUsers.length})
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên, email, mã NV..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredAvailableUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? "Không tìm thấy người dùng" : "Tất cả người dùng đã được thêm"}
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredAvailableUsers.map((user) => {
                    const isSelected = selectedUserIds.includes(user.id);
                    return (
                      <button
                        type="button"
                        key={user.id}
                        onClick={() => handleSelectUser(user.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary/10 border-2 border-primary ring-2 ring-primary/20"
                            : "bg-background border border-border hover:bg-muted hover:border-muted-foreground/20"
                        }`}
                      >
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarFallback className={isSelected ? "bg-primary text-primary-foreground" : ""}>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {user.department}
                        </Badge>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Add Button */}
            {selectedUserIds.length > 0 && (
              <div className="p-4 border-t bg-background">
                <Button
                  className="w-full"
                  onClick={handleAddUsers}
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  Thêm {selectedUserIds.length} người vào vai trò
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel - Current Members */}
          <div className="flex flex-col">
            <div className="p-4 border-b bg-background">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-500" />
                Thành viên hiện tại ({users.length})
              </h3>
            </div>

            <ScrollArea className="flex-1 bg-muted/10">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mb-2 opacity-50" />
                  <p className="font-medium">Chưa có thành viên</p>
                  <p className="text-xs mt-1">Chọn người dùng từ danh sách bên trái</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="secondary" className="text-xs">
                          {user.department}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveUser(user.id)}
                          disabled={removingUserId === user.id}
                        >
                          {removingUserId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
