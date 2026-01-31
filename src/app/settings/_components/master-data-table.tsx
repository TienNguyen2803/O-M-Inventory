"use client";

import { useState } from "react";
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
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMasterDataTable, type MasterDataItem } from "@/hooks/use-master-data";
import { MasterDataForm } from "./master-data-form";

interface MasterDataTableProps {
  tableId: string;
  tableName: string;
}

export function MasterDataTable({ tableId, tableName }: MasterDataTableProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MasterDataItem | null>(null);

  const {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
  } = useMasterDataTable(tableId);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAdd = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: MasterDataItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    const success = await deleteItem(itemId);
    if (success) {
      toast({
        title: "Thành công",
        description: "Đã xóa mục thành công.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Lỗi",
        description: "Không thể xóa mục.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (values: { name: string; code: string; color?: string; sortOrder?: number }) => {
    if (selectedItem) {
      // Update existing
      const result = await updateItem(selectedItem.id, values);
      if (result) {
        toast({
          title: "Thành công",
          description: "Đã cập nhật mục.",
        });
        setIsFormOpen(false);
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật mục.",
          variant: "destructive",
        });
      }
    } else {
      // Add new
      const result = await addItem({
        ...values,
        sortOrder: values.sortOrder || 0,
      });
      if (result) {
        toast({
          title: "Thành công",
          description: "Đã thêm mục mới.",
        });
        setIsFormOpen(false);
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể thêm mục.",
          variant: "destructive",
        });
      }
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          <p>Lỗi: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg">{tableName}</CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Thêm mới
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Mã</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>
                        {item.color ? (
                          <span
                            className={cn(
                              "rounded-md px-2.5 py-1 text-xs font-semibold",
                              item.color
                            )}
                          >
                            {item.name}
                          </span>
                        ) : (
                          item.name
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.code || "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-semibold",
                            item.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {item.isActive ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => handleEdit(item)}
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
                                  Hành động này không thể được hoàn tác. Mục &quot;
                                  {item.name}&quot; sẽ bị xóa vĩnh viễn.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(item.id)}
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
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {searchQuery
                        ? "Không tìm thấy kết quả phù hợp."
                        : "Chưa có dữ liệu."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Hiển thị {filteredItems.length} trên {items.length} bản ghi
          </div>
        </CardContent>
      </Card>

      <MasterDataForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        item={selectedItem}
        onSubmit={handleFormSubmit}
        categoryName={tableName}
      />
    </>
  );
}
