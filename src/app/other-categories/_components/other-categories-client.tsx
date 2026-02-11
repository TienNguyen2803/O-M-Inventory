"use client";

import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { MasterDataCategory, MasterDataItem } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Dữ liệu Danh mục</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Các danh mục khác</span>
  </div>
);

const formSchema = z.object({
  value: z.string().min(1, "Giá trị là bắt buộc."),
});
type FormValues = z.infer<typeof formSchema>;

export function OtherCategoriesClient({ initialCategories }: { initialCategories: MasterDataCategory[] }) {
  const [categories, setCategories] = useState<MasterDataCategory[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<MasterDataCategory>(initialCategories[0]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);

  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { value: "" },
  });

  const handleAddNew = () => {
    setEditingItem(null);
    form.reset({ value: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: MasterDataItem) => {
    setEditingItem(item);
    form.reset({ value: item.value });
    setIsDialogOpen(true);
  };

  const handleDelete = (itemId: string) => {
    setCategories(categories.map(cat => {
      if (cat.id === selectedCategory.id) {
        return { ...cat, items: cat.items.filter(item => item.id !== itemId) };
      }
      return cat;
    }));
    // Also update selectedCategory to reflect the change immediately
    setSelectedCategory(prev => ({
        ...prev!,
        items: prev!.items.filter(item => item.id !== itemId)
    }));
    toast({ variant: "destructive", title: "Thành công", description: "Đã xóa mục khỏi danh mục." });
  };

  const onSubmit = (data: FormValues) => {
    if (editingItem) { // Editing existing item
      const updatedItems = selectedCategory.items.map(item => item.id === editingItem.id ? { ...item, value: data.value } : item);
      const updatedCategory = { ...selectedCategory, items: updatedItems };
      
      setCategories(categories.map(cat => cat.id === selectedCategory.id ? updatedCategory : cat));
      setSelectedCategory(updatedCategory);
      
      toast({ title: "Thành công", description: "Đã cập nhật mục." });

    } else { // Adding new item
      const newItem: MasterDataItem = { id: `item-${Date.now()}`, value: data.value };
      const updatedCategory = { ...selectedCategory, items: [...selectedCategory.items, newItem] };

      setCategories(categories.map(cat => cat.id === selectedCategory.id ? updatedCategory : cat));
      setSelectedCategory(updatedCategory);
      
      toast({ title: "Thành công", description: "Đã thêm mục mới vào danh mục." });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Quản lý Danh mục dùng chung" 
        breadcrumbs={<Breadcrumbs />} 
        description="Quản lý các danh sách lựa chọn (master data) được sử dụng trong toàn bộ hệ thống."
      />

      <div className="grid md:grid-cols-4 gap-6 items-start">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Loại danh mục</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory?.id === cat.id ? "secondary" : "ghost"}
                  onClick={() => setSelectedCategory(cat)}
                  className="w-full justify-start"
                >
                  {cat.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{selectedCategory?.name}</CardTitle>
                    <CardDescription>{selectedCategory?.description}</CardDescription>
                  </div>
                  <Button onClick={handleAddNew}>
                      <Plus className="mr-2 h-4 w-4" /> Thêm mới
                  </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">STT</TableHead>
                    <TableHead>Giá trị</TableHead>
                    <TableHead className="w-[120px] text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCategory?.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.value}</TableCell>
                      <TableCell className="text-right">
                         <div className="flex items-center justify-end space-x-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/80 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                                    <AlertDialogDescription>Hành động này không thể hoàn tác. Mục "{item.value}" sẽ bị xóa vĩnh viễn.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Xóa</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         </div>
                      </TableCell>
                    </TableRow>
                  ))}
                   {selectedCategory?.items.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Chưa có dữ liệu.</TableCell>
                        </TableRow>
                   )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Chỉnh sửa mục' : 'Thêm mục mới'}</DialogTitle>
          </DialogHeader>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá trị</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit">Lưu</Button>
              </DialogFooter>
            </form>
           </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
