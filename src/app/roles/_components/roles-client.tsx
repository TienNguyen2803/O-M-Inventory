"use client";

import { useState } from "react";
import type { Role, RolePermission } from "@/lib/types";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Users, Pencil, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Hệ thống</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Phân quyền & Vai trò</span>
  </div>
);

export function RolesClient({ initialRoles }: { initialRoles: Role[] }) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selectedRole, setSelectedRole] = useState<Role>(initialRoles[0]);

  const handlePermissionChange = (
    group: string,
    featureName: string,
    permission: keyof Omit<RolePermission, "feature">,
    value: boolean
  ) => {
    if (!selectedRole) return;

    const updatedPermissions = JSON.parse(JSON.stringify(selectedRole.permissions));
    
    const permissionGroup = updatedPermissions[group];
    if (permissionGroup) {
      const featurePermission = permissionGroup.find((p: RolePermission) => p.feature === featureName);
      if (featurePermission) {
        featurePermission[permission] = value;
      }
    }

    const updatedRole = { ...selectedRole, permissions: updatedPermissions };
    setSelectedRole(updatedRole);
    setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
  };
  
  const handleSelectAll = (group: string, permission: keyof Omit<RolePermission, 'feature'>, value: boolean) => {
    if (!selectedRole) return;

    const updatedPermissions = JSON.parse(JSON.stringify(selectedRole.permissions));
    const permissionGroup = updatedPermissions[group];
    if (permissionGroup) {
        permissionGroup.forEach((p: RolePermission) => {
            p[permission] = value;
        });
    }

    const updatedRole = { ...selectedRole, permissions: updatedPermissions };
    setSelectedRole(updatedRole);
    setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
  }
  
  const isAllSelected = (group: string, permission: keyof Omit<RolePermission, 'feature'>) => {
      const permissionGroup = selectedRole?.permissions[group];
      if (!permissionGroup || permissionGroup.length === 0) return false;
      return permissionGroup.every(p => p[permission]);
  }


  return (
    <div className="space-y-4">
      <PageHeader 
        title="Phân quyền & Vai trò" 
        breadcrumbs={<Breadcrumbs />} 
        description="Quản lý quyền truy cập chi tiết cho từng vai trò người dùng trong hệ thống."
      >
        <Button><Plus className="mr-2 h-4 w-4" /> Thêm vai trò mới</Button>
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
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><Pencil className="h-4 w-4" /></Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Users className="h-3 w-3 mr-1.5" />
                    <span>{role.userCount} người dùng</span>
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
              <Button><Save className="mr-2 h-4 w-4" /> Lưu thay đổi</Button>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={Object.keys(selectedRole?.permissions || {})} className="w-full">
                {selectedRole && Object.entries(selectedRole.permissions).map(([group, permissions]) => (
                  permissions.length > 0 && <AccordionItem value={group} key={group}>
                    <AccordionTrigger className="text-base font-semibold">{group}</AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-2/5">Tính năng</TableHead>
                            <TableHead className="text-center">
                                <Checkbox checked={isAllSelected(group, 'view')} onCheckedChange={(checked) => handleSelectAll(group, 'view', !!checked)} id={`view-all-${group}`} />
                                <label htmlFor={`view-all-${group}`} className="ml-2">Xem</label>
                            </TableHead>
                            <TableHead className="text-center">
                                <Checkbox checked={isAllSelected(group, 'create')} onCheckedChange={(checked) => handleSelectAll(group, 'create', !!checked)} id={`create-all-${group}`} />
                                <label htmlFor={`create-all-${group}`} className="ml-2">Tạo</label>
                            </TableHead>
                            <TableHead className="text-center">
                                <Checkbox checked={isAllSelected(group, 'edit')} onCheckedChange={(checked) => handleSelectAll(group, 'edit', !!checked)} id={`edit-all-${group}`} />
                                <label htmlFor={`edit-all-${group}`} className="ml-2">Sửa</label>
                            </TableHead>
                            <TableHead className="text-center">
                                <Checkbox checked={isAllSelected(group, 'delete')} onCheckedChange={(checked) => handleSelectAll(group, 'delete', !!checked)} id={`delete-all-${group}`} />
                                <label htmlFor={`delete-all-${group}`} className="ml-2">Xóa</label>
                            </TableHead>
                            <TableHead className="text-center">
                                <Checkbox checked={isAllSelected(group, 'approve')} onCheckedChange={(checked) => handleSelectAll(group, 'approve', !!checked)} id={`approve-all-${group}`} />
                                <label htmlFor={`approve-all-${group}`} className="ml-2">Duyệt</label>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {permissions.map((permission) => (
                            <TableRow key={permission.feature}>
                              <TableCell className="font-medium">{permission.feature}</TableCell>
                              <TableCell className="text-center"><Checkbox checked={permission.view} onCheckedChange={(checked) => handlePermissionChange(group, permission.feature, 'view', !!checked)} /></TableCell>
                              <TableCell className="text-center"><Checkbox checked={permission.create} onCheckedChange={(checked) => handlePermissionChange(group, permission.feature, 'create', !!checked)} /></TableCell>
                              <TableCell className="text-center"><Checkbox checked={permission.edit} onCheckedChange={(checked) => handlePermissionChange(group, permission.feature, 'edit', !!checked)} /></TableCell>
                              <TableCell className="text-center"><Checkbox checked={permission.delete} onCheckedChange={(checked) => handlePermissionChange(group, permission.feature, 'delete', !!checked)} /></TableCell>
                              <TableCell className="text-center"><Checkbox checked={permission.approve} onCheckedChange={(checked) => handlePermissionChange(group, permission.feature, 'approve', !!checked)} /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
