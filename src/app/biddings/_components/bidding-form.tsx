"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  TableFooter,
} from "@/components/ui/table";
import { DialogFooter } from "@/components/ui/dialog";
import { CalendarIcon, Save } from "lucide-react";
import type { BiddingPackage } from "@/lib/types";

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Tên gói thầu là bắt buộc."),
  purchaseRequestId: z.string(),
  method: z.string(),
  estimatedPrice: z.coerce.number(),
  openingDate: z.date().optional(),
  closingDate: z.date().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      unit: z.string(),
      quantity: z.number(),
      amount: z.number(),
    })
  ).optional(),
  result: z.object({
    winner: z.string(),
    winningPrice: z.coerce.number(),
    technicalScore: z.string(),
    negotiationStatus: z.string(),
  }).optional(),
  status: z.string(), // To decide whether to show results
});

export type BiddingFormValues = z.infer<typeof formSchema>;

type BiddingFormProps = {
  biddingPackage: BiddingPackage | null;
  onSubmit: (values: BiddingFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
};

const FormSectionHeader = ({ title }: { title: string }) => (
  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider border-b pb-2 my-4">
    {title}
  </h3>
);

export function BiddingForm({
  biddingPackage,
  onSubmit,
  onCancel,
  viewMode,
}: BiddingFormProps) {
  const form = useForm<BiddingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: biddingPackage
      ? {
          ...biddingPackage,
          openingDate: biddingPackage.openingDate ? new Date(biddingPackage.openingDate) : undefined,
          closingDate: biddingPackage.closingDate ? new Date(biddingPackage.closingDate) : undefined,
        }
      : {
          id: "",
          name: "",
          purchaseRequestId: "",
          method: "Đấu thầu rộng rãi",
          estimatedPrice: 0,
          items: [],
          status: "Đang mời thầu",
        },
  });

  const totalAmount = form.watch("items")?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  const showResults = form.watch("status") === "Đã có kết quả";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 pt-2 max-h-[80vh] overflow-y-auto pr-4"
      >
        <div className="grid grid-cols-4 gap-x-6 gap-y-4">
          <div className="col-span-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Gói thầu</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={viewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã Gói</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseRequestId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Căn cứ PR</FormLabel>
                <FormControl>
                   <Button variant="link" className="p-0 h-auto font-semibold text-base" type="button" disabled={viewMode}>{field.value}</Button>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hình thức</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={viewMode}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Đấu thầu rộng rãi">Đấu thầu rộng rãi</SelectItem>
                    <SelectItem value="Chỉ định thầu">Chỉ định thầu</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimatedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá dự toán</FormLabel>
                <FormControl>
                  <Input type="text" value={field.value.toLocaleString('vi-VN')} disabled={viewMode} className="font-semibold text-right" onChange={(e) => {
                     const numValue = parseInt(e.target.value.replace(/,/g, ''), 10);
                     field.onChange(isNaN(numValue) ? 0 : numValue);
                  }} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="col-span-2">
            <FormField
              control={form.control}
              name="openingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày Mở thầu</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          disabled={viewMode}
                        >
                          {field.value ? format(field.value, "dd/MM/yyyy hh:mm a") : <span>Chọn ngày</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-2">
            <FormField
              control={form.control}
              name="closingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày Đóng thầu</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          disabled={viewMode}
                        >
                          {field.value ? format(field.value, "dd/MM/yyyy hh:mm a") : <span>Chọn ngày</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <FormSectionHeader title="Phạm vi cung cấp" />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">HẠNG MỤC</TableHead>
                  <TableHead>ĐVT</TableHead>
                  <TableHead className="text-right">KHỐI LƯỢNG</TableHead>
                  <TableHead className="text-right">THÀNH TIỀN</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.getValues("items")?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">{item.quantity.toLocaleString('vi-VN')}</TableCell>
                    <TableCell className="text-right">{item.amount.toLocaleString('vi-VN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">Tổng cộng</TableCell>
                  <TableCell className="text-right font-bold text-red-600">{totalAmount.toLocaleString('vi-VN')}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>

        {showResults && biddingPackage?.result && (
          <div className="space-y-4 pt-2">
            <FormSectionHeader title="Kết quả lựa chọn" />
            <div className="bg-yellow-50/80 p-4 rounded-lg border border-yellow-200 grid grid-cols-2 gap-x-6 gap-y-4">
               <FormField
                  control={form.control}
                  name="result.winner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhà thầu trúng</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="font-bold bg-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="result.winningPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá trúng thầu</FormLabel>
                      <FormControl>
                        <Input value={field.value.toLocaleString('vi-VN')} disabled className="font-bold text-right bg-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="result.technicalScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điểm kỹ thuật</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="font-bold bg-white"/>
                      </FormControl>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="result.negotiationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thương thảo HĐ</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
            </div>
          </div>
        )}

        <DialogFooter className="pt-4">
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
