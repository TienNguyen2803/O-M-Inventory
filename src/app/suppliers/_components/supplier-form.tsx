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
import type { Supplier } from "@/lib/types";
import { DialogFooter } from "@/components/ui/dialog";
import { Save } from "lucide-react";

const formSchema = z.object({
  code: z.string().min(1, "Mã số là bắt buộc."),
  name: z.string().min(1, "Tên/Tham chiếu là bắt buộc."),
  info: z.string().min(1, "Thông tin là bắt buộc."),
  status: z.enum(["Active", "Inactive"]),
});

export type SupplierFormValues = z.infer<typeof formSchema>;

type SupplierFormProps = {
  supplier: Supplier | null;
  onSubmit: (values: SupplierFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
};

export function SupplierForm({
  supplier,
  onSubmit,
  onCancel,
  viewMode,
}: SupplierFormProps) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: supplier
      ? { ...supplier }
      : {
          code: "",
          name: "",
          info: "",
          status: "Active",
        },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 pt-4"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã số</FormLabel>
                <FormControl>
                  <Input {...field} disabled={viewMode} placeholder="Vd: NCC-001" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên/Tham chiếu</FormLabel>
                <FormControl>
                  <Input {...field} disabled={viewMode} placeholder="Vd: Siemens Energy"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thông tin</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={viewMode} placeholder="Vd: Germany" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={viewMode}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Hoạt động</SelectItem>
                    <SelectItem value="Inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="!justify-end items-center pt-6 sticky bottom-0 bg-background py-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Đóng
          </Button>
          {!viewMode && (
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" /> Lưu dữ liệu
            </Button>
          )}
        </DialogFooter>
      </form>
    </Form>
  );
}
