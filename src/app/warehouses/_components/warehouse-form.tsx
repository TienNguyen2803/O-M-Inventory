"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as React from "react";
import * as z from "zod";
import { QrCode, Save } from "lucide-react";

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
import type { WarehouseLocation } from "@/lib/types";
import { DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  warehouse: z.string().min(1, "Kho là bắt buộc."),
  area: z.string().min(1, "Khu vực là bắt buộc."),
  aisle: z.string().optional(),
  rack: z.string().optional(),
  level: z.string().optional(),
  code: z.string().min(1, "Mã vị trí là bắt buộc."),
  name: z.string().min(1, "Tên/Mô tả là bắt buộc."),
  barcode: z.string().optional(),
  type: z.string({ required_error: "Vui lòng chọn loại lưu trữ." }),
  maxWeight: z.coerce.number().optional(),
  dimensions: z.string().optional(),
});

export type WarehouseFormValues = z.infer<typeof formSchema>;

type WarehouseFormProps = {
  location: WarehouseLocation | null;
  onSubmit: (values: WarehouseFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
};

const warehouseOptions = [
  { value: "Kho Nhà máy Phú Mỹ 1", label: "Kho Nhà máy Phú Mỹ 1", shortCode: "PM1" },
  { value: "Kho Nhà máy Vĩnh Tân 2", label: "Kho Nhà máy Vĩnh Tân 2", shortCode: "VT2" },
  { value: "Kho Tổng công ty", label: "Kho Tổng công ty (GENCO3)", shortCode: "G3" },
];

const FormSectionHeader = ({ title }: { title: string }) => (
  <div className="bg-muted/70 px-4 py-2 rounded-t-md border-b">
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
  </div>
);

export function WarehouseForm({
  location,
  onSubmit,
  onCancel,
  viewMode,
}: WarehouseFormProps) {
  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: location
      ? {
          ...location,
          maxWeight: location.maxWeight ?? undefined,
        }
      : {
          warehouse: "",
          area: "",
          aisle: "",
          rack: "",
          level: "",
          code: "",
          name: "",
          barcode: "",
          type: "Kệ Pallet",
          dimensions: "",
        },
  });
  
  const { watch, setValue } = form;
  const warehouse = watch("warehouse");
  const area = watch("area");
  const aisle = watch("aisle");
  const rack = watch("rack");
  const level = watch("level");

  React.useEffect(() => {
    const warehouseShortCode = warehouseOptions.find(w => w.value === warehouse)?.shortCode || '';
    const parts = [
        warehouseShortCode, 
        area?.toUpperCase(), 
        aisle ? `D${aisle}` : '', 
        rack ? `K${rack}`: '', 
        level ? `T${level}` : ''
    ].filter(Boolean);
    const code = parts.join('-');
    setValue("code", code);

    const nameParts = [
      level ? `Tầng ${level}` : '',
      rack ? `Kệ ${rack}` : '',
      aisle ? `Dãy ${aisle}` : '',
      area ? `Khu vực ${area}` : '',
      warehouse || '',
    ].filter(Boolean);
    const name = nameParts.join(', ');
    setValue("name", name);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouse, area, aisle, rack, level, setValue]);


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto pr-4"
      >
        {/* THÔNG TIN VỊ TRÍ */}
        <div className="space-y-4">
          <FormSectionHeader title="Định nghĩa Vị trí Phân cấp" />
          <div className="grid grid-cols-5 gap-x-4 gap-y-4">
            <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="warehouse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kho</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={viewMode}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Chọn kho" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouseOptions.map(w => <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField control={form.control} name="area" render={({ field }) => ( <FormItem><FormLabel>Khu vực</FormLabel><FormControl><Input {...field} disabled={viewMode} placeholder="A, B..." /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="aisle" render={({ field }) => ( <FormItem><FormLabel>Dãy</FormLabel><FormControl><Input {...field} disabled={viewMode} placeholder="01, 02..." /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="rack" render={({ field }) => ( <FormItem><FormLabel>Kệ</FormLabel><FormControl><Input {...field} disabled={viewMode} placeholder="01, 02..." /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="level" render={({ field }) => ( <FormItem><FormLabel>Tầng</FormLabel><FormControl><Input {...field} disabled={viewMode} placeholder="01, 02..." /></FormControl><FormMessage /></FormItem> )} />
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã Vị trí (Tự động)</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
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
                  <FormLabel>Tên/Mô tả (Tự động)</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* THÔNG TIN BỔ SUNG */}
        <div className="space-y-4">
          <FormSectionHeader title="Thông tin Bổ sung & Điều kiện" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã Barcode (Nếu có)</FormLabel>
                   <div className="relative">
                    <FormControl>
                      <Input {...field} disabled={viewMode} className="pr-10" />
                    </FormControl>
                     <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại lưu trữ</FormLabel>
                   <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={viewMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Kệ Pallet">Kệ Pallet</SelectItem>
                      <SelectItem value="Kệ Trung Tải">Kệ Trung Tải</SelectItem>
                       <SelectItem value="Sàn">Sàn</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="maxWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tải trọng Max (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled={viewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="dimensions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kích thước</FormLabel>
                  <FormControl>
                    <Input placeholder="Vd: 2.7m x 1.2m" {...field} disabled={viewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {viewMode && (
          <div className="space-y-4">
            <FormSectionHeader title="TỒN KHO HIỆN TẠI" />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-muted">MÃ VT</TableHead>
                  <TableHead className="bg-muted">TÊN</TableHead>
                  <TableHead className="bg-muted text-right">SL</TableHead>
                  <TableHead className="bg-muted">ĐVT</TableHead>
                  <TableHead className="bg-muted">BATCH/SERIAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {location?.items?.map((item) => (
                  <TableRow key={item.materialId}>
                    <TableCell className="font-medium text-primary hover:underline cursor-pointer">{item.materialCode}</TableCell>
                    <TableCell>{item.materialName}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.batchSerial}</TableCell>
                  </TableRow>
                ))}
                {(!location?.items || location.items.length === 0) && (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">Không có vật tư trong vị trí này.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

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
