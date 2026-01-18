"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { InboundReceipt } from "@/lib/types";

const formSchema = z.object({
  id: z.string(),
  inboundType: z.string({ required_error: "Vui lòng chọn loại nhập." }),
  reference: z.string().optional(),
  inboundDate: z.date({ required_error: "Vui lòng chọn ngày nhập." }),
  partner: z.string().min(1, "Đối tác là bắt buộc."),
  status: z.string({ required_error: "Vui lòng chọn trạng thái." }),
});

export type InboundFormValues = z.infer<typeof formSchema>;

type InboundFormProps = {
  receipt: InboundReceipt | null;
  onSubmit: (values: InboundFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
};

export function InboundForm({
  receipt,
  onSubmit,
  onCancel,
  viewMode,
}: InboundFormProps) {
  const form = useForm<InboundFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: receipt
      ? {
          ...receipt,
          inboundDate: new Date(receipt.inboundDate),
        }
      : {
          id: "",
          inboundType: "Theo PO",
          reference: "",
          inboundDate: new Date(),
          partner: "",
          status: "Đang nhập",
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số Phiếu</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="inboundDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày nhập</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        disabled={viewMode}
                      >
                        {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inboundType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại nhập kho</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={viewMode}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại nhập" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Theo PO">Theo PO</SelectItem>
                    <SelectItem value="Sau Sửa chữa">Sau Sửa chữa</SelectItem>
                    <SelectItem value="Hàng Mượn">Hàng Mượn</SelectItem>
                    <SelectItem value="Hoàn trả">Hoàn trả</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    <SelectItem value="Đang nhập">Đang nhập</SelectItem>
                    <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="partner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đối tác</FormLabel>
                <FormControl>
                  <Input {...field} disabled={viewMode} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tham chiếu</FormLabel>
                <FormControl>
                  <Input {...field} disabled={viewMode} placeholder="Vd: PO-2025-10"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          {!viewMode && <Button type="submit"><Save className="mr-2 h-4 w-4"/>Lưu</Button>}
        </DialogFooter>
      </form>
    </Form>
  );
}
