"use client";

import { useState } from "react";
import type { Material } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { MaterialForm } from "./material-form";
import { useToast } from "@/hooks/use-toast";

type MaterialsClientProps = {
  initialMaterials: Material[];
};

export function MaterialsClient({ initialMaterials }: MaterialsClientProps) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const { toast } = useToast();

  const handleAdd = () => {
    setSelectedMaterial(null);
    setIsFormOpen(true);
  };

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setIsFormOpen(true);
  };

  const handleDelete = (materialId: string) => {
    setMaterials(materials.filter((m) => m.id !== materialId));
    toast({
      title: "Thành công",
      description: "Đã xóa vật tư thành công.",
    });
  };

  const handleFormSubmit = (values: Omit<Material, "id" | "stock">) => {
    const isEditing = !!selectedMaterial;
    if (isEditing) {
      const updatedMaterial = { ...selectedMaterial, ...values };
      setMaterials(
        materials.map((m) =>
          m.id === selectedMaterial.id ? updatedMaterial : m
        )
      );
    } else {
      const newMaterial: Material = {
        ...values,
        id: `mat-${Date.now()}`,
        stock: 0,
      };
      setMaterials([newMaterial, ...materials]);
    }
    setIsFormOpen(false);
    toast({
      title: "Thành công",
      description: isEditing ? "Đã cập nhật vật tư." : "Đã thêm vật tư mới.",
    });
  };

  return (
    <>
      <PageHeader
        title="Quản lý vật tư"
        description="Thêm, sửa, xóa và xem thông tin chi tiết các loại vật tư."
      >
        <Button
          onClick={handleAdd}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm vật tư
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên vật tư</TableHead>
                <TableHead>Mã</TableHead>
                <TableHead>Phân loại</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead className="text-right">Tồn kho</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {material.code}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {material.category}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {material.unit}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {material.stock.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(material)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Chỉnh sửa</span>
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Xóa</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Bạn có chắc chắn muốn xóa?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này không thể được hoàn tác. Vật tư "
                                {material.name}" sẽ bị xóa vĩnh viễn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(material.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedMaterial ? "Chỉnh sửa vật tư" : "Thêm vật tư mới"}
            </DialogTitle>
            <DialogDescription>
              {selectedMaterial
                ? "Cập nhật thông tin cho vật tư."
                : "Điền thông tin chi tiết cho vật tư mới."}
            </DialogDescription>
          </DialogHeader>
          <MaterialForm
            material={selectedMaterial}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
