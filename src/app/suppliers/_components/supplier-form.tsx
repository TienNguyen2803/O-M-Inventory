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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Supplier } from "@/lib/types";
import { DialogFooter } from "@/components/ui/dialog";
import { Save } from "lucide-react";

const formSchema = z.object({
  code: z.string().min(1, "Mã NCC là bắt buộc."),
  taxCode: z.string().min(1, "Mã số thuế là bắt buộc."),
  name: z.string().min(1, "Tên công ty là bắt buộc."),
  address: z.string().min(1, "Địa chỉ là bắt buộc."),
  country: z.string({ required_error: "Vui lòng chọn quốc gia." }),
  type: z.string({ required_error: "Vui lòng chọn loại hình." }),
  paymentTerm: z.string({ required_error: "Vui lòng chọn điều khoản thanh toán." }),
  currency: z.string({ required_error: "Vui lòng chọn tiền tệ." }),
});

export type SupplierFormValues = z.infer<typeof formSchema>;

type SupplierFormProps = {
  supplier: Supplier | null;
  onSubmit: (values: SupplierFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
};

const FormSectionHeader = ({ title }: { title: string }) => (
  <div className="bg-primary/10 px-4 py-2 rounded-t-md border-b border-primary/20">
    <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">{title}</h3>
  </div>
);

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
          taxCode: "",
          name: "",
          address: "",
          country: "",
          type: "",
          paymentTerm: "",
          currency: "",
        },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto pr-4"
      >
        {/* THÔNG TIN DOANH NGHIỆP */}
        <div className="rounded-md border">
          <FormSectionHeader title="Thông tin doanh nghiệp" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã NCC</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={viewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã số thuế</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={viewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên Công ty</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={viewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ</FormLabel>
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
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quốc gia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={viewMode}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Chọn quốc gia" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Vietnam">Vietnam</SelectItem>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="Switzerland">Switzerland</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại hình</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={viewMode}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Chọn loại hình" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OEM">OEM</SelectItem>
                      <SelectItem value="Distributor">Distributor</SelectItem>
                      <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                      <SelectItem value="Agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* THƯƠNG MẠI & LIÊN HỆ */}
        <div className="rounded-md border">
          <FormSectionHeader title="Thương mại & Liên hệ" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-4">
             <FormField
              control={form.control}
              name="paymentTerm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thanh toán</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={viewMode}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Chọn điều khoản" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                      <SelectItem value="COD">COD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiền tệ</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={viewMode}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Chọn tiền tệ" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="VND">VND</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* NGƯỜI LIÊN HỆ */}
        <div className="rounded-md border">
          <FormSectionHeader title="Người liên hệ" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>HỌ TÊN</TableHead>
                <TableHead>CHỨC VỤ</TableHead>
                <TableHead>EMAIL</TableHead>
                <TableHead>SĐT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplier?.contacts?.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.position}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                </TableRow>
              ))}
               {(!supplier?.contacts || supplier.contacts.length === 0) && (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">Chưa có người liên hệ.</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </div>


        <DialogFooter className="!justify-end items-center pt-6 sticky bottom-0 bg-background py-4 -mx-4 px-4 border-t">
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
