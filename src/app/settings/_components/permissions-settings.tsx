"use client";

import { useState } from "react";
import { useActions, useFeatures, useFeatureActions } from "@/hooks/use-permissions";
import type { Action, Feature } from "@/hooks/use-permissions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

// ==================== Actions Tab ====================
function ActionsTab() {
  const { actions, isLoading, createAction, updateAction, deleteAction } = useActions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [formData, setFormData] = useState({ code: "", name: "", sortOrder: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDialog = (action?: Action) => {
    if (action) {
      setEditingAction(action);
      setFormData({ code: action.code, name: action.name, sortOrder: action.sortOrder });
    } else {
      setEditingAction(null);
      setFormData({ code: "", name: "", sortOrder: actions.length + 1 });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (editingAction) {
      await updateAction(editingAction.id, formData);
    } else {
      await createAction({ ...formData, isActive: true });
    }
    setIsSubmitting(false);
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hành động này?")) {
      await deleteAction(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Danh sách Hành động</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAction ? "Sửa hành động" : "Thêm hành động"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Mã (code)</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="view, create, edit..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Tên hiển thị</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Xem, Tạo, Sửa..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sortOrder">Thứ tự</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingAction ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">STT</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Tên hiển thị</TableHead>
              <TableHead className="w-24 text-center">Thứ tự</TableHead>
              <TableHead className="w-24 text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.map((action, index) => (
              <TableRow key={action.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell><Badge variant="outline">{action.code}</Badge></TableCell>
                <TableCell>{action.name}</TableCell>
                <TableCell className="text-center">{action.sortOrder}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(action)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(action.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ==================== Features Tab ====================
function FeaturesTab() {
  // Data hooks
  const { features, isLoading, fetchFeatures } = useFeatures();
  const { actions } = useActions();
  const { toast } = useToast();
  
  // Simple state - CHỈ CẦN 3 STATE
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [tempSelectedActions, setTempSelectedActions] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Get selected feature from ID
  const selectedFeature = features.find(f => f.id === selectedFeatureId);

  // Open modal
  const openEditModal = (feature: Feature) => {
    setSelectedFeatureId(feature.id);
    setTempSelectedActions(new Set(feature.actions?.map(a => a.id) || []));
  };

  // Close modal
  const closeModal = () => {
    setSelectedFeatureId(null);
    setTempSelectedActions(new Set());
  };

  // Toggle action
  const toggleAction = (actionId: string) => {
    setTempSelectedActions(prev => {
      const next = new Set(prev);
      if (next.has(actionId)) {
        next.delete(actionId);
      } else {
        next.add(actionId);
      }
      return next;
    });
  };

  // Save changes
  const handleSave = async () => {
    if (!selectedFeatureId || !selectedFeature) return;
    
    setIsSaving(true);
    
    try {
      const currentActionIds = new Set(selectedFeature.actions?.map(a => a.id) || []);
      const apiCalls: Promise<Response>[] = [];
      
      // Add new actions
      for (const actionId of tempSelectedActions) {
        if (!currentActionIds.has(actionId)) {
          apiCalls.push(
            fetch('/api/feature-actions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ featureId: selectedFeatureId, actionId }),
            })
          );
        }
      }
      
      // Remove deselected actions
      for (const actionId of currentActionIds) {
        if (!tempSelectedActions.has(actionId)) {
          apiCalls.push(
            fetch(`/api/feature-actions?featureId=${selectedFeatureId}&actionId=${actionId}`, {
              method: 'DELETE',
            })
          );
        }
      }
      
      // Execute all API calls
      await Promise.all(apiCalls);
      
      // Close modal BEFORE fetching
      setSelectedFeatureId(null);
      setTempSelectedActions(new Set());
      setIsSaving(false);
      
      // Refresh data
      await fetchFeatures();
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật actions",
      });
    } catch (error) {
      console.error('Error saving:', error);
      setIsSaving(false);
      toast({
        title: "Lỗi",
        description: "Không thể lưu. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // Group features
  const groupedFeatures = features.reduce((acc, feature) => {
    const group = feature.groupCode;
    if (!acc[group]) acc[group] = [];
    acc[group].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      {/* Simple Modal - Conditional Render */}
      {selectedFeatureId && selectedFeature && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-background border rounded-lg shadow-lg w-[450px] max-w-[90vw]">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Cập nhật Actions</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tính năng: <span className="font-medium">{selectedFeature.name}</span>
              </p>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-sm font-medium mb-3">Chọn Actions được phép:</p>
              <div className="flex flex-wrap gap-3">
                {actions.map((action) => (
                  <label 
                    key={action.id} 
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-3 py-2 rounded border"
                  >
                    <Checkbox
                      checked={tempSelectedActions.has(action.id)}
                      onCheckedChange={() => toggleAction(action.id)}
                      className="h-5 w-5"
                    />
                    <span className="text-sm font-medium">{action.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={closeModal} disabled={isSaving}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Tính năng</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-350px)]">
            {Object.entries(groupedFeatures).map(([group, groupFeatures]) => (
              <div key={group} className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{group}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">STT</TableHead>
                      <TableHead className="w-40">Mã</TableHead>
                      <TableHead>Tên tính năng</TableHead>
                      <TableHead>Actions được phép</TableHead>
                      <TableHead className="w-20 text-center">Sửa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupFeatures.map((feature, index) => (
                      <TableRow key={feature.id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">{feature.code}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{feature.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {feature.actions && feature.actions.length > 0 ? (
                              feature.actions.map((action) => (
                                <Badge key={action.id} variant="secondary" className="text-xs">{action.name}</Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm italic">Chưa có</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditModal(feature)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}

// ==================== Main Component ====================
export function PermissionsSettings() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="actions">
        <TabsList>
          <TabsTrigger value="actions">Hành động (Actions)</TabsTrigger>
          <TabsTrigger value="features">Tính năng (Features)</TabsTrigger>
        </TabsList>
        <TabsContent value="actions">
          <ActionsTab />
        </TabsContent>
        <TabsContent value="features">
          <FeaturesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
