"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Material } from "@/lib/types";
import { DialogFooter } from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(2, "Tên vật tư phải có ít nhất 2 ký tự."),
  code: z.string().min(2, "Mã vật tư phải có ít nhất 2 ký tự."),
  partNo: z.string().min(1, "Part No. không được để trống."),
  managementType: z.enum(["Batch", "Serial"], {
    required_error: "Vui lòng chọn loại quản lý.",
  }),
  category: z.string().min(2, "Phân loại phải có ít nhất 2 ký tự."),
  unit: z.string().min(1, "Đơn vị không được để trống."),
  description: z.string().optional(),
});

type MaterialFormValues = Omit<Material, "id" | "stock">;

type MaterialFormProps = {
  material: Material | null;
  onSubmit: (values: MaterialFormValues) => void;
  onCancel: () => void;
};

export function MaterialForm({
  material,
  onSubmit,
  onCancel,
}: MaterialFormProps) {
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: material
      ? {
          name: material.name,
          code: material.code,
          partNo: material.partNo,
          managementType: material.managementType,
          category: material.category,
          unit: material.unit,
          description: material.description,
        }
      : {
          description: "",
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên vật tư</FormLabel>
                <FormControl>
                  <Input placeholder="Vd: Mỡ hàn Amtech 100g" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đơn vị</FormLabel>
                <FormControl>
                  <Input placeholder="Vd: Hộp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã vật tư</FormLabel>
                <FormControl>
                  <Input placeholder="Vd: 1.51.45.001.USA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="partNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Part No.</FormLabel>
                <FormControl>
                  <Input placeholder="Vd: NC-559-ASM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nhóm</FormLabel>
                <FormControl>
                  <Input placeholder="Vd: Vật tư tiêu hao" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="managementType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại quản lý</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại quản lý" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Batch">Batch</SelectItem>
                    <SelectItem value="Serial">Serial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả chi tiết về vật tư..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">Lưu</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
