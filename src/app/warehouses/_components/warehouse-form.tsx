"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useMasterDataItems } from "@/hooks/use-master-data";

const formSchema = z.object({
  code: z.string().min(1, "Mã vị trí là bắt buộc."),
  name: z.string().min(1, "Tên/Mô tả là bắt buộc."),
  barcode: z.string().optional(),
  area: z.string().min(1, "Vui lòng chọn khu vực."),
  type: z.string().min(1, "Vui lòng chọn loại lưu trữ."),
  status: z.string().optional(),
  maxWeight: z.coerce.number().optional().nullable(),
  dimensions: z.string().optional(),
});

export type WarehouseFormValues = z.infer<typeof formSchema>;

type WarehouseFormProps = {
  location: WarehouseLocation | null;
  onSubmit: (values: WarehouseFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
};

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
  // Master data for dropdowns
  const { items: areas, isLoading: areasLoading } = useMasterDataItems("warehouse-area");
  const { items: types, isLoading: typesLoading } = useMasterDataItems("warehouse-type");

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: location
      ? {
          code: location.code,
          name: location.name,
          barcode: location.barcode || "",
          area: location.area,
          type: location.type,
          status: location.status,
          maxWeight: location.maxWeight ?? undefined,
          dimensions: location.dimensions || "",
        }
      : {
          code: "",
          name: "",
          barcode: "",
          area: "",
          type: "",
          status: "Active",
          dimensions: "",
        },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto pr-4"
      >
        {/* THÔNG TIN VỊ TRÍ */}
        <div className="space-y-4">
          <FormSectionHeader title="THÔNG TIN VỊ TRÍ" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã Vị trí (Bin) *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={viewMode} placeholder="VD: A1-01-01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã Barcode</FormLabel>
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
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên/Mô tả *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={viewMode} placeholder="VD: Kệ 01 - Tầng 1 - Dãy A" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khu vực *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={viewMode}
                    onOpenChange={(open) => { if (!open) field.onBlur(); }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn khu vực" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areasLoading ? (
                        <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                      ) : areas.length > 0 ? (
                        areas.map((area) => (
                          <SelectItem key={area.id} value={area.name}>
                            {area.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>Không có dữ liệu</SelectItem>
                      )}
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
                  <FormLabel>Loại lưu trữ *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={viewMode}
                    onOpenChange={(open) => { if (!open) field.onBlur(); }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {typesLoading ? (
                        <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                      ) : types.length > 0 ? (
                        types.map((type) => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>Không có dữ liệu</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SỨC CHỨA & ĐIỀU KIỆN */}
        <div className="space-y-4">
          <FormSectionHeader title="SỨC CHỨA & ĐIỀU KIỆN" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <FormField
              control={form.control}
              name="maxWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tải trọng Max (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      disabled={viewMode}
                    />
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

        {/* TỒN KHO HIỆN TẠI - Only show in view mode when editing */}
        {location && (
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
                {location.items?.map((item) => (
                  <TableRow key={item.materialId}>
                    <TableCell className="font-medium text-primary hover:underline cursor-pointer">
                      {item.materialCode}
                    </TableCell>
                    <TableCell>{item.materialName}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.batchSerial}</TableCell>
                  </TableRow>
                ))}
                {(!location.items || location.items.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Không có vật tư trong vị trí này.
                    </TableCell>
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
