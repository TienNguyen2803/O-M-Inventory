"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Plus, Save, Trash2, Check, Loader2, Package, Search } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PurchaseRequest, MasterDataItem, Material } from "@/lib/types";
import { cn } from "@/lib/utils";

// Form schema using FK IDs
const formSchema = z.object({
  id: z.string(),
  fundingSourceId: z.string().min(1, "Nguồn vốn là bắt buộc"),
  sourceId: z.string().min(1, "Nguồn gốc là bắt buộc"),
  description: z.string().min(1, "Diễn giải là bắt buộc."),
  items: z.array(
    z.object({
      id: z.string(),
      materialId: z.string().optional(),
      name: z.string().min(1, "Tên hàng hóa là bắt buộc"),
      unitId: z.string().min(1, "Đơn vị tính là bắt buộc"),
      quantity: z.coerce.number().min(1, "SL phải > 0"),
      estimatedPrice: z.coerce.number().min(0, "Đơn giá không được âm"),
      suggestedSupplierId: z.string().optional(),
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

type Supplier = { id: string; name: string };

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, name: "Tạo yêu cầu" },
    { id: 2, name: "Chờ duyệt" },
    { id: 3, name: "Đã duyệt" },
    { id: 4, name: "Hoàn thành" },
  ];

  return (
    <div className="flex items-center mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center w-28 text-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200",
                step.id < currentStep
                  ? "bg-green-500 text-white shadow-sm"
                  : step.id === currentStep
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
            </div>
            <p
              className={cn(
                "text-xs mt-1.5",
                step.id <= currentStep
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.name}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mb-5 transition-colors duration-200",
                step.id < currentStep ? "bg-green-500" : "bg-border"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const FormSectionHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between border-b pb-2 mb-3">
    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
      {title}
    </h3>
    {action}
  </div>
);

// Material Picker Dialog Component
function MaterialPickerDialog({
  open,
  onOpenChange,
  materials,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: Material[];
  onSelect: (material: Material) => void;
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const filteredMaterials = React.useMemo(() => {
    if (!searchQuery.trim()) return materials;
    const query = searchQuery.toLowerCase();
    return materials.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.code.toLowerCase().includes(query)
    );
  }, [materials, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chọn vật tư từ kho</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã hoặc tên vật tư..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <ScrollArea className="h-[400px] border rounded-md">
            <div className="p-2 space-y-1">
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Không tìm thấy vật tư phù hợp</p>
                </div>
              ) : (
                filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer transition-colors group"
                    onClick={() => {
                      onSelect(material);
                      onOpenChange(false);
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {material.code}
                        </Badge>
                        <span className="font-medium">{material.name}</span>
                      </div>
                      {material.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {material.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {typeof material.unit === 'string' 
                          ? material.unit 
                          : (typeof material.materialUnit === 'object' && material.materialUnit?.name) || '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tồn: {material.stock?.toLocaleString('vi-VN') || 0}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PurchaseRequestForm({
  request,
  onSubmit,
  onCancel,
  viewMode,
}: PurchaseRequestFormProps) {
  // Master data state
  const [fundingSources, setFundingSources] = React.useState<MasterDataItem[]>([]);
  const [materialOrigins, setMaterialOrigins] = React.useState<MasterDataItem[]>([]);
  const [materialUnits, setMaterialUnits] = React.useState<MasterDataItem[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [materialPickerOpen, setMaterialPickerOpen] = React.useState(false);

  // Fetch master data on mount
  React.useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [fundingRes, originRes, unitRes, supplierRes, materialRes] = await Promise.all([
          fetch('/api/master-data/funding-source'),
          fetch('/api/master-data/material-origin'),
          fetch('/api/master-data/material-unit'),
          fetch('/api/suppliers'),
          fetch('/api/materials?limit=500'),
        ]);

        if (fundingRes.ok) {
          const data = await fundingRes.json();
          setFundingSources(data.items || []);
        }
        if (originRes.ok) {
          const data = await originRes.json();
          setMaterialOrigins(data.items || []);
        }
        if (unitRes.ok) {
          const data = await unitRes.json();
          setMaterialUnits(data.items || []);
        }
        if (supplierRes.ok) {
          const data = await supplierRes.json();
          // API returns array directly, not wrapped in { data: [...] }
          setSuppliers(Array.isArray(data) ? data : (data.data || []));
        }
        if (materialRes.ok) {
          const data = await materialRes.json();
          setMaterials(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch master data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  const form = useForm<PurchaseRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: request
      ? {
          id: request.id,
          fundingSourceId: request.fundingSourceId || '',
          sourceId: request.sourceId || '',
          description: request.description || '',
          items: request.items?.map(item => ({
            id: item.id,
            materialId: item.materialId || '',
            name: item.name,
            unitId: item.unitId || '',
            quantity: item.quantity,
            estimatedPrice: item.estimatedPrice,
            suggestedSupplierId: item.suggestedSupplierId || '',
          })) || [],
        }
      : {
          id: "",
          fundingSourceId: "",
          sourceId: "",
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

  // Helper to get display name from ID
  const getUnitName = (unitId: string) => materialUnits.find(u => u.id === unitId)?.name || '';
  const getSupplierName = (supplierId: string) => suppliers.find(s => s.id === supplierId)?.name || '';

  // Handle material selection from picker
  const handleMaterialSelect = (material: Material) => {
    append({
      id: `new-${Date.now()}`,
      materialId: material.id,
      name: material.name,
      unitId: material.unitId || '',
      quantity: 1,
      estimatedPrice: 0,
      suggestedSupplierId: '',
    });
  };

  // Handle manual item add
  const handleAddManualItem = () => {
    append({
      id: `new-${Date.now()}`,
      materialId: '',
      name: '',
      unitId: '',
      quantity: 1,
      estimatedPrice: 0,
      suggestedSupplierId: '',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 pt-2 max-h-[80vh] overflow-y-auto px-1"
      >
        {request?.step && <Stepper currentStep={request.step} />}
        
        {/* Main Form Fields - 2 Columns Layout */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã PR</FormLabel>
                <FormControl>
                  <Input {...field} disabled placeholder="Tự động tạo" className="bg-muted/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fundingSourceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  Nguồn vốn
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={viewMode}
                >
                  <FormControl>
                    <SelectTrigger className={cn(!field.value && "text-muted-foreground")}>
                      <SelectValue placeholder="Chọn nguồn vốn" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fundingSources.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
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
            name="sourceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  Nguồn gốc
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={viewMode}
                >
                  <FormControl>
                    <SelectTrigger className={cn(!field.value && "text-muted-foreground")}>
                      <SelectValue placeholder="Chọn nguồn gốc" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {materialOrigins.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                    Diễn giải mua sắm
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      disabled={viewMode} 
                      rows={2} 
                      placeholder="Nhập mô tả chi tiết về yêu cầu mua sắm..."
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="space-y-3 pt-2">
          <FormSectionHeader 
            title="CHI TIẾT HÀNG HÓA" 
            action={
              !viewMode && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMaterialPickerOpen(true)}
                    className="h-7 text-xs"
                  >
                    <Package className="mr-1.5 h-3.5 w-3.5" />
                    Chọn từ kho
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddManualItem}
                    className="h-7 text-xs"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Thêm thủ công
                  </Button>
                </div>
              )
            }
          />
          
          {form.formState.errors.items?.message && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.items.message}
            </p>
          )}

          {fields.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-3">
                  {viewMode 
                    ? "Không có mặt hàng nào trong yêu cầu này." 
                    : "Chưa có hàng hóa. Thêm từ kho hoặc nhập thủ công."}
                </p>
                {!viewMode && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMaterialPickerOpen(true)}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Chọn từ kho
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAddManualItem}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nhập thủ công
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[30%] font-semibold">TÊN HÀNG HÓA / QUY CÁCH</TableHead>
                      <TableHead className="w-[100px] font-semibold">ĐVT</TableHead>
                      <TableHead className="text-right w-[80px] font-semibold">SL</TableHead>
                      <TableHead className="text-right w-[130px] font-semibold">ĐƠN GIÁ (EST)</TableHead>
                      <TableHead className="text-right w-[130px] font-semibold">THÀNH TIỀN</TableHead>
                      <TableHead className="w-[150px] font-semibold">NCC ĐỀ XUẤT</TableHead>
                      {!viewMode && <TableHead className="w-[50px]"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((item, index) => (
                      <TableRow 
                        key={item.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium align-top py-2 px-3">
                          <Input
                            {...form.register(`items.${index}.name`)}
                            disabled={viewMode}
                            placeholder="Nhập tên hàng hóa..."
                            className={cn(
                              "h-9 bg-transparent border-transparent hover:border-input focus:border-input transition-colors",
                              form.formState.errors?.items?.[index]?.name && "border-destructive"
                            )}
                          />
                          {form.formState.errors?.items?.[index]?.name && (
                            <p className="text-xs text-destructive mt-1">
                              {form.formState.errors.items[index]?.name?.message}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="align-top py-2 px-2">
                          {viewMode ? (
                            <span className="text-sm">{getUnitName(items[index]?.unitId || '')}</span>
                          ) : (
                            <Select
                              value={items[index]?.unitId || ''}
                              onValueChange={(value) => form.setValue(`items.${index}.unitId`, value)}
                            >
                              <SelectTrigger className="h-9 bg-transparent border-transparent hover:border-input">
                                <SelectValue placeholder="Chọn" />
                              </SelectTrigger>
                              <SelectContent>
                                {materialUnits.map((unit) => (
                                  <SelectItem key={unit.id} value={unit.id}>
                                    {unit.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="align-top py-2 px-2">
                          <Input
                            type="number"
                            {...form.register(`items.${index}.quantity`)}
                            disabled={viewMode}
                            className="h-9 text-right bg-transparent border-transparent hover:border-input focus:border-input w-20"
                          />
                        </TableCell>
                        <TableCell className="align-top py-2 px-2">
                          <Input
                            type="number"
                            {...form.register(`items.${index}.estimatedPrice`)}
                            disabled={viewMode}
                            placeholder="0"
                            className="h-9 text-right bg-transparent border-transparent hover:border-input focus:border-input w-32"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium align-middle py-2 px-3 tabular-nums">
                          {((items[index]?.quantity || 0) * (items[index]?.estimatedPrice || 0)).toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell className="align-top py-2 px-2">
                          {viewMode ? (
                            <span className="text-sm">
                              {getSupplierName(items[index]?.suggestedSupplierId || '')}
                            </span>
                          ) : (
                            <Select
                              value={items[index]?.suggestedSupplierId || ''}
                              onValueChange={(value) => form.setValue(`items.${index}.suggestedSupplierId`, value)}
                            >
                              <SelectTrigger className="h-9 bg-transparent border-transparent hover:border-input">
                                <SelectValue placeholder="Chọn NCC" />
                              </SelectTrigger>
                              <SelectContent>
                                {suppliers.map((supplier) => (
                                  <SelectItem key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        {!viewMode && (
                          <TableCell className="align-middle py-2 px-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={4} className="text-right font-bold py-3">
                        Tổng cộng (VNĐ):
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary py-3 tabular-nums text-lg">
                        {totalAmount.toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell colSpan={viewMode ? 1 : 2}></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="!justify-end items-center pt-4 sticky bottom-0 bg-background py-4 border-t -mx-1 px-1">
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Đóng
            </Button>
            {!viewMode && (
              <Button type="submit" className="min-w-[120px]">
                <Save className="mr-2 h-4 w-4" /> Lưu dữ liệu
              </Button>
            )}
          </div>
        </DialogFooter>
      </form>

      {/* Material Picker Dialog */}
      <MaterialPickerDialog
        open={materialPickerOpen}
        onOpenChange={setMaterialPickerOpen}
        materials={materials}
        onSelect={handleMaterialSelect}
      />
    </Form>
  );
}
