"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import type { Supplier, MasterDataItem } from "@/lib/types";
import { DialogFooter } from "@/components/ui/dialog";
import { Save, Plus, Trash2 } from "lucide-react";

const contactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tên là bắt buộc"),
  position: z.string().min(1, "Chức vụ là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(1, "SĐT là bắt buộc"),
});

const formSchema = z.object({
  code: z.string().min(1, "Mã NCC là bắt buộc."),
  taxCode: z.string().min(1, "Mã số thuế là bắt buộc."),
  name: z.string().min(1, "Tên công ty là bắt buộc."),
  address: z.string().min(1, "Địa chỉ là bắt buộc."),
  countryId: z.string({ required_error: "Vui lòng chọn quốc gia." }),
  typeId: z.string({ required_error: "Vui lòng chọn loại hình." }),
  paymentTermId: z.string({ required_error: "Vui lòng chọn điều khoản thanh toán." }),
  currencyId: z.string({ required_error: "Vui lòng chọn tiền tệ." }),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  contacts: z.array(contactSchema).default([]),
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
  const [countries, setCountries] = useState<MasterDataItem[]>([]);
  const [supplierTypes, setSupplierTypes] = useState<MasterDataItem[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<MasterDataItem[]>([]);
  const [currencies, setCurrencies] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [countriesRes, typesRes, termsRes, currenciesRes] = await Promise.all([
          fetch('/api/master-data/country'),
          fetch('/api/master-data/supplier-type'),
          fetch('/api/master-data/payment-term'),
          fetch('/api/master-data/currency'),
        ]);

        if (countriesRes.ok) {
          const data = await countriesRes.json();
          setCountries(data.items || []);
        }
        if (typesRes.ok) {
          const data = await typesRes.json();
          setSupplierTypes(data.items || []);
        }
        if (termsRes.ok) {
          const data = await termsRes.json();
          setPaymentTerms(data.items || []);
        }
        if (currenciesRes.ok) {
          const data = await currenciesRes.json();
          setCurrencies(data.items || []);
        }
      } catch (error) {
        console.error('Error fetching master data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: supplier
      ? {
          code: supplier.code,
          taxCode: supplier.taxCode,
          name: supplier.name,
          address: supplier.address,
          countryId: supplier.countryId,
          typeId: supplier.typeId,
          paymentTermId: supplier.paymentTermId,
          currencyId: supplier.currencyId,
          status: supplier.status,
          contacts: supplier.contacts || [],
        }
      : {
          code: "",
          taxCode: "",
          name: "",
          address: "",
          countryId: "",
          typeId: "",
          paymentTermId: "",
          currencyId: "",
          status: "Active",
          contacts: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const handleAddContact = () => {
    append({ name: "", position: "", email: "", phone: "" });
  };

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Đang tải dữ liệu...</div>;
  }

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
              name="countryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quốc gia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={viewMode}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Chọn quốc gia" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="typeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại hình</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={viewMode}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Chọn loại hình" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supplierTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
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
              name="paymentTermId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thanh toán</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={viewMode}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Chọn điều khoản" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentTerms.map((term) => (
                        <SelectItem key={term.id} value={term.id}>
                          {term.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="currencyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiền tệ</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={viewMode}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Chọn tiền tệ" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id}>
                          {currency.name}
                        </SelectItem>
                      ))}
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
          <div className="flex items-center justify-between bg-primary/10 px-4 py-2 rounded-t-md border-b border-primary/20">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Người liên hệ</h3>
            {!viewMode && (
              <Button type="button" variant="outline" size="sm" onClick={handleAddContact}>
                <Plus className="h-4 w-4 mr-1" /> Thêm
              </Button>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>HỌ TÊN</TableHead>
                <TableHead>CHỨC VỤ</TableHead>
                <TableHead>EMAIL</TableHead>
                <TableHead>SĐT</TableHead>
                {!viewMode && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    {viewMode ? (
                      form.watch(`contacts.${index}.name`)
                    ) : (
                      <Input
                        {...form.register(`contacts.${index}.name`)}
                        placeholder="Họ tên"
                        className="h-8"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {viewMode ? (
                      form.watch(`contacts.${index}.position`)
                    ) : (
                      <Input
                        {...form.register(`contacts.${index}.position`)}
                        placeholder="Chức vụ"
                        className="h-8"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {viewMode ? (
                      form.watch(`contacts.${index}.email`)
                    ) : (
                      <Input
                        {...form.register(`contacts.${index}.email`)}
                        placeholder="Email"
                        className="h-8"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {viewMode ? (
                      form.watch(`contacts.${index}.phone`)
                    ) : (
                      <Input
                        {...form.register(`contacts.${index}.phone`)}
                        placeholder="SĐT"
                        className="h-8"
                      />
                    )}
                  </TableCell>
                  {!viewMode && (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {fields.length === 0 && (
                <TableRow>
                  <TableCell colSpan={viewMode ? 4 : 5} className="text-center text-muted-foreground h-24">
                    Chưa có người liên hệ.
                  </TableCell>
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
