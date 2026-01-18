"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { cn } from "@/lib/utils";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogFooter } from "@/components/ui/dialog";
import { CalendarIcon, Save } from "lucide-react";
import type { OutboundVoucher } from "@/lib/types";

const formSchema = z.object({
  id: z.string(),
  issueDate: z.date(),
  purpose: z.string(),
  department: z.string().min(1, "Bộ phận là bắt buộc."),
  materialRequestId: z.string().optional(),
  reason: z.string().min(1, "Lý do là bắt buộc."),
  items: z.array(
    z.object({
      id: z.string(),
      materialCode: z.string(),
      materialName: z.string(),
      unit: z.string(),
      quantity: z.coerce.number().min(1, "SL phải > 0"),
      notes: z.string().optional(),
    })
  ),
  status: z.string(),
});

export type OutboundFormValues = z.infer<typeof formSchema>;

type OutboundFormProps = {
  voucher: OutboundVoucher | null;
  onSubmit: (values: OutboundFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
};

const FormSectionHeader = ({ title }: { title: string }) => (
  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-primary border-b pb-2 mb-2">
    {title}
  </h3>
);

export function OutboundForm({
  voucher,
  onSubmit,
  onCancel,
  viewMode,
}: OutboundFormProps) {
  const form = useForm<OutboundFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: voucher
      ? {
          ...voucher,
          issueDate: new Date(voucher.issueDate),
        }
      : {
          id: "",
          issueDate: new Date(),
          purpose: "Cấp O&M",
          department: "",
          materialRequestId: "",
          reason: "",
          items: [],
          status: "Chờ xuất",
        },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 pt-2 max-h-[80vh] overflow-y-auto pr-4"
      >
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã Phiếu</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày xuất</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={viewMode}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mục đích</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={viewMode}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mục đích" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Cấp O&M">Cấp O&M</SelectItem>
                    <SelectItem value="Khẩn cấp">Khẩn cấp</SelectItem>
                    <SelectItem value="Cho mượn">Cho mượn</SelectItem>
                    <SelectItem value="Đi Sửa chữa">Đi Sửa chữa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bộ phận</FormLabel>
                <FormControl>
                  <Input {...field} disabled={viewMode} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="materialRequestId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Căn cứ YCVT</FormLabel>
                <FormControl>
                  <Input {...field} disabled={viewMode} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-3">
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lý do / Mục đích</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={viewMode} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2 pt-2">
          <FormSectionHeader title="Chi tiết vật tư xuất kho" />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã VT</TableHead>
                  <TableHead>Tên Vật Tư</TableHead>
                  <TableHead>ĐVT</TableHead>
                  <TableHead className="text-right">SL Xuất</TableHead>
                  <TableHead>Ghi Chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.getValues("items")?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.materialCode}
                    </TableCell>
                    <TableCell>{item.materialName}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell>{item.notes}</TableCell>
                  </TableRow>
                ))}
                 {form.getValues("items")?.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Chưa có vật tư nào.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="!justify-between items-center pt-4 sticky bottom-0 bg-background py-4 -mx-4 px-4 border-t">
          <div className="flex items-center gap-4">
             <div className="text-sm text-muted-foreground">
              {voucher?.status && (
                <span>
                  Tình trạng:{" "}
                  <span
                    className={cn("font-semibold", {
                      "text-green-600": voucher.status === "Đã xuất",
                      "text-yellow-600": voucher.status === "Chờ xuất",
                       "text-red-600": voucher.status === "Đã hủy",
                    })}
                  >
                    {voucher.status}
                  </span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
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
