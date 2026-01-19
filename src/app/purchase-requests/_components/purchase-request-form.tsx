"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Plus, Save, Trash2, Check } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogFooter } from "@/components/ui/dialog";
import type { PurchaseRequest } from "@/lib/types";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  id: z.string(),
  fundingSource: z.string().min(1, "Nguồn vốn là bắt buộc."),
  source: z.string().min(1, "Nguồn gốc là bắt buộc."),
  description: z.string().min(1, "Diễn giải là bắt buộc."),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Tên hàng hóa là bắt buộc"),
      unit: z.string().min(1, "ĐVT là bắt buộc"),
      quantity: z.coerce.number().min(1, "SL phải > 0"),
      estimatedPrice: z.coerce.number().min(0, "Đơn giá không được âm"),
      suggestedSupplier: z.string().min(1, "NCC là bắt buộc"),
    })
  ).min(1, "Phải có ít nhất một mặt hàng."),
});

export type PurchaseRequestFormValues = z.infer<typeof formSchema>;

type PurchaseRequestFormProps = {
  request: PurchaseRequest | null;
  onSubmit: (values: PurchaseRequestFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
};

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, name: "Tạo yêu cầu" },
    { id: 2, name: "Chờ duyệt" },
    { id: 3, name: "Đã duyệt" },
    { id: 4, name: "Hoàn thành" },
  ];

  return (
    <div className="flex items-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center w-32 text-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg",
                step.id < currentStep
                  ? "bg-green-500 text-white"
                  : step.id === currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
            </div>
            <p
              className={cn(
                "text-xs mt-2",
                step.id <= currentStep
                  ? "font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {step.name}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mb-6",
                step.id < currentStep ? "bg-green-500" : "bg-border"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const FormSectionHeader = ({ title }: { title: string }) => (
  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-primary border-b pb-2 mb-2">
    {title}
  </h3>
);

export function PurchaseRequestForm({
  request,
  onSubmit,
  onCancel,
  viewMode,
}: PurchaseRequestFormProps) {
  const form = useForm<PurchaseRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: request
      ? { ...request }
      : {
          id: "",
          fundingSource: "SCL",
          source: "Nhập khẩu",
          description: "",
          items: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const items = form.watch("items");
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.estimatedPrice || 0), 0);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 pt-2 max-h-[80vh] overflow-y-auto pr-4"
      >
        {request?.step && <Stepper currentStep={request.step} />}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã PR</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fundingSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nguồn vốn</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={viewMode}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nguồn vốn" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SCL">SCL</SelectItem>
                    <SelectItem value="ĐTXD">ĐTXD</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nguồn gốc</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={viewMode}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nguồn gốc" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Trong nước">Trong nước</SelectItem>
                    <SelectItem value="Nhập khẩu">Nhập khẩu</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diễn giải mua sắm</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={viewMode} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <FormSectionHeader title="CHI TIẾT HÀNG HÓA" />
           {form.formState.errors.items?.message && <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">TÊN HÀNG HÓA / QUY CÁCH</TableHead>
                  <TableHead>ĐVT</TableHead>
                  <TableHead className="text-right">SL</TableHead>
                  <TableHead className="text-right">ĐƠN GIÁ (EST)</TableHead>
                  <TableHead className="text-right">THÀNH TIỀN</TableHead>
                  <TableHead>NCC ĐỀ XUẤT</TableHead>
                   {!viewMode && <TableHead className="w-[50px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium align-top p-1">
                       <Input {...form.register(`items.${index}.name`)} disabled={viewMode} className={cn("border-0 p-0", form.formState.errors?.items?.[index]?.name && "text-destructive")} />
                       {form.formState.errors?.items?.[index]?.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.items[index]?.name?.message}</p>}
                    </TableCell>
                    <TableCell className="align-top p-1">
                      <Input {...form.register(`items.${index}.unit`)} disabled={viewMode} className="border-0 p-0 w-16" />
                    </TableCell>
                    <TableCell className="align-top p-1">
                      <Input type="number" {...form.register(`items.${index}.quantity`)} disabled={viewMode} className="border-0 p-0 text-right w-20" />
                    </TableCell>
                    <TableCell className="align-top p-1">
                       <Input type="number" {...form.register(`items.${index}.estimatedPrice`)} disabled={viewMode} className="border-0 p-0 text-right w-32" />
                    </TableCell>
                    <TableCell className="text-right font-medium align-top p-1">
                      {((items[index]?.quantity || 0) * (items[index]?.estimatedPrice || 0)).toLocaleString('vi-VN')}
                    </TableCell>
                    <TableCell className="align-top p-1">
                      <Input {...form.register(`items.${index}.suggestedSupplier`)} disabled={viewMode} className="border-0 p-0" />
                    </TableCell>
                    {!viewMode && (
                        <TableCell className="align-top p-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/80 hover:text-destructive" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    )}
                  </TableRow>
                ))}
                 {fields.length === 0 && !viewMode && (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">Chưa có hàng hóa. Nhấn "Thêm dòng" để bắt đầu.</TableCell>
                    </TableRow>
                )}
                {fields.length === 0 && viewMode && (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">Không có mặt hàng nào trong yêu cầu này.</TableCell>
                    </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-bold p-2">Tổng cộng (VNĐ):</TableCell>
                  <TableCell className="text-right font-bold text-red-600 p-2">{totalAmount.toLocaleString('vi-VN')}</TableCell>
                  <TableCell colSpan={viewMode ? 1 : 2} className="p-2"></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          {!viewMode && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={() => append({ id: `new-${Date.now()}`, name: '', unit: '', quantity: 1, estimatedPrice: 0, suggestedSupplier: ''})}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm dòng
            </Button>
          )}
        </div>

        <DialogFooter className="!justify-end items-center pt-4 sticky bottom-0 bg-background py-4">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Đóng
            </Button>
            {!viewMode && (
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Lưu dữ liệu
              </Button>
            )}
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
}
