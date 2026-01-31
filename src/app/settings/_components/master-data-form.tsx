"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BADGE_COLORS } from "@/lib/master-data";

interface MasterDataItem {
  id: string;
  code: string;
  name: string;
  color?: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface MasterDataFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MasterDataItem | null;
  onSubmit: (values: { name: string; code: string; color?: string; sortOrder?: number }) => void;
  categoryName: string;
}

interface FormValues {
  name: string;
  code: string;
  color: string;
  isActive: boolean;
}

export function MasterDataForm({
  open,
  onOpenChange,
  item,
  onSubmit,
  categoryName,
}: MasterDataFormProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: "",
      code: "",
      color: "",
      isActive: true,
    },
  });

  // Reset form when item changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        name: item?.name || "",
        code: item?.code || "",
        color: item?.color || "",
        isActive: item?.isActive ?? true,
      });
    }
  }, [open, item, reset]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const onFormSubmit = (data: FormValues) => {
    onSubmit({
      name: data.name,
      code: data.code || "",
      color: data.color || undefined,
    });
    reset();
  };

  const selectedColor = watch("color");
  const isActive = watch("isActive");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {item ? "Cập nhật" : "Thêm mới"} - {categoryName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name", { required: "Tên là bắt buộc" })}
              placeholder="Nhập tên..."
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Mã</Label>
            <Input
              id="code"
              {...register("code")}
              placeholder="Nhập mã (tùy chọn)..."
            />
          </div>

          <div className="space-y-2">
            <Label>Màu badge</Label>
            <Select
              value={selectedColor}
              onValueChange={(value) => setValue("color", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn màu (tùy chọn)">
                  {selectedColor ? (
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        selectedColor
                      )}
                    >
                      {BADGE_COLORS.find((c) => c.value === selectedColor)?.name || "Màu tùy chọn"}
                    </span>
                  ) : (
                    "Chọn màu (tùy chọn)"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không có màu</SelectItem>
                {BADGE_COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        color.value
                      )}
                    >
                      {color.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Trạng thái hoạt động</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit">{item ? "Cập nhật" : "Thêm"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
