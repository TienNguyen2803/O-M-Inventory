"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Globe, Pencil, QrCode, Save, Loader2 } from "lucide-react";

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
import { useMasterDataItems } from "@/hooks/use-master-data";

// Form schema with ID fields for master data
const formSchema = z.object({
  evnCode: z.string().optional(),
  code: z.string().min(1, "Mã nội bộ là bắt buộc."),
  name: z.string().min(2, "Tên vật tư (Tiếng Việt) phải có ít nhất 2 ký tự."),
  nameEn: z.string().optional(),
  partNo: z.string().min(1, "Part Number không được để trống."),
  // ID fields for master data - must have min(1) to catch empty strings
  unitId: z.string().min(1, "Vui lòng chọn đơn vị tính."),
  statusId: z.string().min(1, "Vui lòng chọn trạng thái vật tư."),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục."),
  managementTypeId: z.string().min(1, "Vui lòng chọn loại quản lý."),
  countryId: z.string().optional(),
  manufacturer: z.string().optional(),
  minStock: z.coerce.number().optional(),
  maxStock: z.coerce.number().optional(),
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
  const [isGeneratingCode, setIsGeneratingCode] = React.useState(false);
  
  // Fetch master data for dropdowns
  const { items: unitItems, isLoading: unitsLoading } = useMasterDataItems('material-unit');
  const { items: statusItems, isLoading: statusLoading } = useMasterDataItems('material-status');
  const { items: countryItems, isLoading: countriesLoading } = useMasterDataItems('country');
  const { items: categoryItems, isLoading: categoriesLoading } = useMasterDataItems('material-category');
  const { items: managementTypeItems, isLoading: managementTypesLoading } = useMasterDataItems('management-type');
  
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched", // Show validation errors when field is touched/blurred
    defaultValues: material
      ? {
          evnCode: material.evnCode || "",
          code: material.code,
          name: material.name,
          nameEn: material.nameEn || "",
          partNo: material.partNo,
          unitId: material.unitId,
          statusId: material.statusId,
          categoryId: material.categoryId,
          managementTypeId: material.managementTypeId,
          countryId: material.countryId || "",
          manufacturer: material.manufacturer || "",
          minStock: material.minStock ?? undefined,
          maxStock: material.maxStock ?? undefined,
          description: material.description || "",
          technicalSpecs: material.technicalSpecs || [],
        }
      : {
          evnCode: "Chưa cấp",
          code: "",
          name: "",
          nameEn: "",
          partNo: "",
          unitId: "",
          statusId: "",
          categoryId: "",
          managementTypeId: "",
          countryId: "",
          manufacturer: "",
          description: "",
          technicalSpecs: [],
        },
  });

  const handleGenerateEvnCode = () => {
    setIsGeneratingCode(true);

    setTimeout(() => {
      const generateRandomString = (length: number, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') => {
          let result = '';
          const charactersLength = chars.length;
          for (let i = 0; i < length; i++) {
              result += chars.charAt(Math.floor(Math.random() * charactersLength));
          }
          return result;
      }
      const newCode = `EVN-${generateRandomString(3)}-${generateRandomString(4)}`;
      form.setValue("evnCode", newCode);
      setIsGeneratingCode(false);
    }, 1000);
  };

  const technicalSpecs = material?.technicalSpecs || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* MÃ - ID Section */}
        <div className="border rounded-md">
          <FormSectionHeader title="MÃ - ID" />
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="evnCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã Vật tư (EVN eCat)</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        placeholder="Chưa cấp"
                        {...field}
                        disabled
                        className="flex-1"
                      />
                    </FormControl>
                    {!viewMode && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateEvnCode}
                        disabled={isGeneratingCode}
                      >
                        {isGeneratingCode ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <QrCode className="mr-1.5 h-4 w-4" />
                            Xin cấp mã
                          </>
                        )}
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
                  <FormLabel>Mã nội bộ (PhuMyTPC) *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Vd: PM-CAP-ABC-013"
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
              name="partNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part Number (PN) *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập part number"
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

        {/* THÔNG TIN CƠ BẢN Section */}
        <div className="border rounded-md">
          <FormSectionHeader title="THÔNG TIN CƠ BẢN" />
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Vật tư (Tiếng Việt) *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên vật tư"
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
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    Tên Vật tư (Tiếng Anh) <Globe className="h-4 w-4 text-muted-foreground" />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter material name"
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={viewMode}
                    onOpenChange={(open) => { if (!open) field.onBlur(); }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                      ) : categoryItems.length > 0 ? (
                        categoryItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
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
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn vị tính *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={viewMode}
                    onOpenChange={(open) => { if (!open) field.onBlur(); }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn đơn vị" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unitsLoading ? (
                        <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                      ) : unitItems.length > 0 ? (
                        unitItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
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
              name="statusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái vật tư *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={viewMode}
                    onOpenChange={(open) => { if (!open) field.onBlur(); }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusLoading ? (
                        <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                      ) : statusItems.length > 0 ? (
                        statusItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
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
              name="managementTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại quản lý *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={viewMode}
                    onOpenChange={(open) => { if (!open) field.onBlur(); }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại quản lý" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {managementTypesLoading ? (
                        <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                      ) : managementTypeItems.length > 0 ? (
                        managementTypeItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
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
              name="countryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xuất xứ</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={viewMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn xuất xứ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countriesLoading ? (
                        <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                      ) : countryItems.length > 0 ? (
                        countryItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
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
                      placeholder="1000"
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

        {/* GHI CHÚ Section */}
        <div className="border rounded-md">
          <FormSectionHeader title="GHI CHÚ" />
          <div className="p-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập ghi chú..."
                      className="min-h-[80px]"
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

        {/* THÔNG SỐ KỸ THUẬT Section */}
        {technicalSpecs && technicalSpecs.length > 0 && (
          <div className="border rounded-md">
            <FormSectionHeader title="THÔNG SỐ KỸ THUẬT">
              {!viewMode && (
                <Button variant="ghost" size="sm" type="button">
                  <Pencil className="mr-1.5 h-4 w-4" /> Sửa
                </Button>
              )}
            </FormSectionHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 font-semibold">Thuộc tính</TableHead>
                  <TableHead className="font-semibold">Giá trị</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(technicalSpecs) && technicalSpecs.map((spec, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{spec.property}</TableCell>
                    <TableCell>{spec.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {viewMode ? "Đóng" : "Hủy"}
          </Button>
          {!viewMode && (
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Lưu
            </Button>
          )}
        </DialogFooter>
      </form>
    </Form>
  );
}
