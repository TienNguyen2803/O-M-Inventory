"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Globe, Pencil, QrCode, Save } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import type { Material } from "@/lib/types";
import { DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  evnCode: z.string().optional(),
  code: z.string().min(1, "Mã nội bộ là bắt buộc."),
  name: z.string().min(2, "Tên vật tư (Tiếng Việt) phải có ít nhất 2 ký tự."),
  nameEn: z.string().optional(),
  partNo: z.string().min(1, "Part Number không được để trống."),
  unit: z.string({ required_error: "Vui lòng chọn đơn vị tính." }),
  manufacturer: z.string().optional(),
  origin: z.string().optional(),
  minStock: z.coerce.number().optional(),
  maxStock: z.coerce.number().optional(),
  isSerial: z.boolean().default(false),
  description: z.string().optional(),
  technicalSpecs: z
    .array(
      z.object({
        property: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

export type MaterialFormValues = z.infer<typeof formSchema>;

type MaterialFormProps = {
  material: Material | null;
  onSubmit: (values: MaterialFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
};

const FormSectionHeader = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => (
  <div className="flex justify-between items-center bg-muted/70 px-4 py-2 rounded-t-md border-b">
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    {children}
  </div>
);

export function MaterialForm({
  material,
  onSubmit,
  onCancel,
  viewMode,
}: MaterialFormProps) {
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: material
      ? {
          ...material,
          isSerial: material.managementType === "Serial",
          minStock: material.minStock ?? undefined,
          maxStock: material.maxStock ?? undefined,
          description: material.description ?? "",
        }
      : {
          evnCode: "Chưa cấp",
          isSerial: false,
          technicalSpecs: [],
          description: "",
          name: "",
          nameEn: "",
          code: "",
          partNo: "",
          unit: "",
          manufacturer: "",
          origin: "",
        },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto pr-4"
      >
        {/* THÔNG TIN ĐỊNH DANH */}
        <div className="space-y-4">
          <FormSectionHeader title="THÔNG TIN ĐỊNH DANH">
            {viewMode && (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="text-sm p-0 h-auto"
              >
                Soạn thảo
              </Button>
            )}
          </FormSectionHeader>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <FormField
              control={form.control}
              name="evnCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã Vật tư (EVN eCat)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} disabled={viewMode} />
                    </FormControl>
                    {!viewMode && (
                      <Button type="button">
                        <Globe className="mr-2" /> Xin cấp mã
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã nội bộ (PhuMyTPC)</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input {...field} disabled={viewMode} />
                    </FormControl>
                    {viewMode && (
                      <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    )}
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
                    <FormLabel>Tên Vật tư (Tiếng Việt)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Vd: Mỡ hàn Amtech 100g"
                        {...field}
                        disabled={viewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên Vật tư (Tiếng Anh)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Vd: Amtech Solder Paste 100g"
                        {...field}
                        disabled={viewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* THÔNG SỐ & QUẢN LÝ */}
        <div className="space-y-4">
          <FormSectionHeader title="THÔNG SỐ & QUẢN LÝ" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <FormField
              control={form.control}
              name="partNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Vd: NC-559-ASM"
                      {...field}
                      disabled={viewMode}
                    />
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
                  <FormLabel>Đơn vị tính</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={viewMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn đơn vị" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Hộp">Hộp</SelectItem>
                      <SelectItem value="Cái">Cái</SelectItem>
                      <SelectItem value="Kg">Kg</SelectItem>
                      <SelectItem value="Lít">Lít</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhà sản xuất</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Vd: AMTECH Inc."
                      {...field}
                      disabled={viewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xuất xứ</FormLabel>
                   <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={viewMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn xuất xứ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="Việt Nam">Việt Nam</SelectItem>
                      <SelectItem value="Trung Quốc">Trung Quốc</SelectItem>
                      <SelectItem value="Nhật Bản">Nhật Bản</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tồn kho Tối thiểu</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10"
                      {...field}
                      disabled={viewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tồn kho Tối đa</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="200"
                      {...field}
                      disabled={viewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="isSerial"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={viewMode}
                  />
                </FormControl>
                <FormLabel className="font-normal mb-0 mt-0!">
                  Quản lý theo Serial/IMEI
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* THÔNG SỐ KỸ THUẬT */}
        <div className="space-y-4">
          <FormSectionHeader title="THÔNG SỐ KỸ THUẬT" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-muted">THUỘC TÍNH</TableHead>
                <TableHead className="bg-muted">GIÁ TRỊ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(form.getValues("technicalSpecs") || []).map((spec, index) => (
                <TableRow key={index}>
                  <TableCell>{spec.property}</TableCell>
                  <TableCell>{spec.value}</TableCell>
                </TableRow>
              ))}
              {(form.getValues("technicalSpecs") || []).length === 0 && (
                 <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">Không có thông số kỹ thuật.</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ghi chú chi tiết về vật tư..."
                  className="min-h-[100px]"
                  {...field}
                  disabled={viewMode}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="!justify-start items-center pt-6 sticky bottom-0 bg-background py-4">
          <Button type="button" variant="outline" disabled={viewMode}>
            <QrCode className="mr-2" /> In Tem QR
          </Button>
          <div className="flex-grow" />
          <Button type="button" variant="outline" onClick={onCancel}>
            Đóng
          </Button>
          {!viewMode && (
            <Button type="submit">
              <Save className="mr-2" /> Lưu dữ liệu
            </Button>
          )}
        </DialogFooter>
      </form>
    </Form>
  );
}
