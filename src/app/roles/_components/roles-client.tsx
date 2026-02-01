"use client";

import { useState, useEffect, useMemo } from "react";
import { useRolesManagement, useFeatures, useActions, useFeatureActions, getPermissionsMap, type Role, type Feature, type Action } from "@/hooks/use-permissions";
import { UserAssignmentDialog } from "./user-assignment-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users, Pencil, Save, Loader2, Trash2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Hệ thống</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Phân quyền & Vai trò</span>
  </div>
);

export function RolesClient() {
  const { roles, isLoading: rolesLoading, createRole, updateRole, deleteRole, fetchRoles } = useRolesManagement();
  const { groupedFeatures, isLoading: featuresLoading } = useFeatures(true);
  const { actions, isLoading: actionsLoading } = useActions();
  const { featureActions } = useFeatureActions();
  
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [localPermissions, setLocalPermissions] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User assignment dialog state
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [userDialogRole, setUserDialogRole] = useState<Role | null>(null);

  // Select first role when loaded
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  // Keep selectedRole in sync with roles array (after fetch)
  useEffect(() => {
    if (selectedRole && roles.length > 0) {
      const updatedRole = roles.find(r => r.id === selectedRole.id);
      if (updatedRole && updatedRole !== selectedRole) {
        setSelectedRole(updatedRole);
      }
    }
  }, [roles, selectedRole]);

  // Update local permissions when selectedRole changes
  useEffect(() => {
    if (selectedRole) {
      const permissions = getPermissionsMap(selectedRole);
      setLocalPermissions(permissions);
      setHasChanges(false);
    }
  }, [selectedRole]);

  const handlePermissionChange = (featureCode: string, actionCode: string, checked: boolean) => {
    setLocalPermissions(prev => {
      const current = prev[featureCode] || [];
      const updated = checked
        ? [...current, actionCode]
        : current.filter(a => a !== actionCode);
      return { ...prev, [featureCode]: updated };
    });
    setHasChanges(true);
  };

  const handleSelectAll = (groupCode: string, actionCode: string, checked: boolean) => {
    const featuresInGroup = groupedFeatures[groupCode] || [];
    setLocalPermissions(prev => {
      const newPerms = { ...prev };
      featuresInGroup.forEach((feature: Feature) => {
        const current = newPerms[feature.code] || [];
        newPerms[feature.code] = checked
          ? [...new Set([...current, actionCode])]
          : current.filter(a => a !== actionCode);
      });
      return newPerms;
    });
    setHasChanges(true);
  };

  const isActionSelected = (featureCode: string, actionCode: string) => {
    return (localPermissions[featureCode] || []).includes(actionCode);
  };

  const isAllSelected = (groupCode: string, actionCode: string) => {
    const featuresInGroup = groupedFeatures[groupCode] || [];
    if (featuresInGroup.length === 0) return false;
    return featuresInGroup.every((feature: Feature) => 
      (localPermissions[feature.code] || []).includes(actionCode)
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setIsSaving(true);
    
    // Convert localPermissions (featureCode -> actionCodes[]) to featureActionIds
    const featureActionIds: string[] = [];
    for (const [featureCode, actionCodes] of Object.entries(localPermissions)) {
      for (const actionCode of actionCodes) {
        const fa = featureActions.find(
          f => f.feature?.code === featureCode && f.action?.code === actionCode
        );
        if (fa) {
          featureActionIds.push(fa.id);
        }
      }
    }
    
    await updateRole(selectedRole.id, { featureActionIds });
    setHasChanges(false);
    setIsSaving(false);
  };

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({ name: role.name, description: role.description || "" });
    } else {
      setEditingRole(null);
      setFormData({ name: "", description: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (editingRole) {
      await updateRole(editingRole.id, { name: formData.name, description: formData.description });
    } else {
      await createRole({ name: formData.name, description: formData.description });
    }
    setIsSubmitting(false);
    setIsDialogOpen(false);
  };

  const handleDeleteRole = async (role: Role) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`)) {
      await deleteRole(role.id);
      if (selectedRole?.id === role.id) {
        setSelectedRole(roles.find(r => r.id !== role.id) || null);
      }
    }
  };

  // Get actions that are available for a feature
  const getFeatureActions = (feature: Feature): Action[] => {
    if (!feature.actions || feature.actions.length === 0) {
      return actions; // fallback to all actions
    }
    return feature.actions;
  };

  const isLoading = rolesLoading || featuresLoading || actionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader 
          title="Phân quyền & Vai trò" 
          breadcrumbs={<Breadcrumbs />} 
          description="Quản lý quyền truy cập chi tiết cho từng vai trò người dùng trong hệ thống."
        />
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
          <Card className="md:col-span-1">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="p-4">
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Phân quyền & Vai trò" 
        breadcrumbs={<Breadcrumbs />} 
        description="Quản lý quyền truy cập chi tiết cho từng vai trò người dùng trong hệ thống."
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Thêm vai trò mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRole ? "Sửa vai trò" : "Thêm vai trò mới"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên vai trò</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Quản trị viên, Thủ kho..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả vai trò và quyền hạn..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingRole ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
        <div className="md:col-span-1 lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách vai trò</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {roles.map((role) => (
                <div 
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedRole(role);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selectedRole?.id === role.id 
                      ? 'bg-primary/10 border-primary/50' 
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{role.name}</p>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={(e) => { e.stopPropagation(); handleOpenDialog(role); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteRole(role); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1.5" />
                      <span>{role.userCount} người dùng</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setUserDialogRole(role); 
                        setIsUserDialogOpen(true); 
                      }}
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Quản lý
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2 lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Chi tiết Quyền cho vai trò</CardTitle>
                <CardDescription className="font-bold text-primary text-base">{selectedRole?.name}</CardDescription>
              </div>
              <Button onClick={handleSavePermissions} disabled={isSaving || !hasChanges}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Lưu thay đổi
              </Button>
            </CardHeader>
            <CardContent>
              {selectedRole && (
                <Accordion type="multiple" defaultValue={Object.keys(groupedFeatures)} className="w-full">
                  {Object.entries(groupedFeatures).map(([groupCode, features]) => (
                    (features as Feature[]).length > 0 && (
                      <AccordionItem value={groupCode} key={groupCode}>
                        <AccordionTrigger className="text-base font-semibold">{groupCode}</AccordionTrigger>
                        <AccordionContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-1/4">Tính năng</TableHead>
                                <TableHead>Quyền được phép</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(features as Feature[]).map((feature) => {
                                const featureActions = getFeatureActions(feature);
                                return (
                                  <TableRow key={feature.id}>
                                    <TableCell className="font-medium align-top py-3">{feature.name}</TableCell>
                                    <TableCell className="py-3">
                                      <div className="flex flex-wrap gap-3">
                                        {featureActions.length > 0 ? (
                                          featureActions.map((action) => (
                                            <label 
                                              key={action.id}
                                              className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-3 py-1.5 rounded border bg-background"
                                            >
                                              <Checkbox 
                                                checked={isActionSelected(feature.code, action.code)}
                                                onCheckedChange={(checked) => handlePermissionChange(feature.code, action.code, !!checked)}
                                              />
                                              <span className="text-sm">{action.name}</span>
                                            </label>
                                          ))
                                        ) : (
                                          <span className="text-muted-foreground text-sm italic">Chưa có action nào</span>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Assignment Dialog */}
      <UserAssignmentDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        role={userDialogRole}
        onUserCountChange={fetchRoles}
      />
    </div>
  );
}
