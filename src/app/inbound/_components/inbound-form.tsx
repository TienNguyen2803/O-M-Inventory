"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, Save, Check, Upload, Trash2, Printer, Plus } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { InboundReceipt, MasterDataItem, Supplier, Material, WarehouseLocation } from "@/lib/types";

const formSchema = z.object({
  id: z.string().optional(),
  receiptCode: z.string().optional(),
  typeId: z.string().min(1, "Loại nhập kho là bắt buộc"),
  statusId: z.string().min(1, "Trạng thái là bắt buộc"),
  supplierId: z.string().min(1, "Nhà cung cấp là bắt buộc"),
  purchaseRequestId: z.string().optional().nullable(),
  referenceCode: z.string().optional().nullable(),
  inboundDate: z.date({ required_error: "Vui lòng chọn ngày nhập." }),
  notes: z.string().optional().nullable(),
  step: z.number().optional(),
  items: z.array(
    z.object({
      id: z.string().optional(),
      materialId: z.string().min(1, "Vật tư là bắt buộc"),
      unitId: z.string().min(1, "Đơn vị là bắt buộc"),
      locationId: z.string().optional().nullable(),
      orderedQuantity: z.coerce.number().int().nonnegative(),
      receivedQuantity: z.coerce.number().int().nonnegative(),
      receivingQuantity: z.coerce.number().int().nonnegative(),
      serialBatch: z.string().optional().nullable(),
      kcs: z.boolean(),
    })
  ).optional(),
  documents: z.array(
    z.object({
      id: z.string().optional(),
      typeId: z.string().min(1, "Loại hồ sơ là bắt buộc"),
      fileName: z.string().min(1, "Tên file là bắt buộc"),
      fileUrl: z.string().optional().nullable(),
    })
  ).optional(),
});

export type InboundFormValues = z.infer<typeof formSchema>;

type InboundFormProps = {
  receipt: InboundReceipt | null;
  onSubmit: (values: InboundFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
  inboundTypes: MasterDataItem[];
  inboundStatuses: MasterDataItem[];
};

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, name: "Yêu cầu Nhập" },
    { id: 2, name: "KCS & Hồ sơ" },
    { id: 3, name: "Đang nhập" },
    { id: 4, name: "Hoàn thành" },
  ];

  return (
    <div className="flex items-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg",
                step.id < currentStep
                  ? "bg-green-500 text-white"
                  : step.id === currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
            </div>
            <p className={cn("text-xs mt-2 text-center", step.id <= currentStep ? 'font-semibold' : 'text-muted-foreground')}>{step.name}</p>
          </div>
          {index < steps.length - 1 && (
            <div className={cn("flex-1 h-0.5 mb-6", step.id < currentStep ? 'bg-green-500' : 'bg-border')} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const FormSectionHeader = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="flex justify-between items-center mt-6 mb-2">
    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-primary">
      {title}
    </h3>
    {children}
  </div>
);


export function InboundForm({
  receipt,
  onSubmit,
  onCancel,
  viewMode,
  inboundTypes,
  inboundStatuses,
}: InboundFormProps) {
  // Fetch lookup data
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [units, setUnits] = React.useState<MasterDataItem[]>([]);
  const [locations, setLocations] = React.useState<WarehouseLocation[]>([]);
  const [documentTypes, setDocumentTypes] = React.useState<MasterDataItem[]>([]);

  React.useEffect(() => {
    // Fetch lookup data in parallel
    Promise.all([
      fetch("/api/suppliers").then(r => r.json()),
      fetch("/api/materials").then(r => r.json()),
      fetch("/api/master-data/material-unit").then(r => r.json()),
      fetch("/api/warehouse-locations").then(r => r.json()),
      fetch("/api/master-data/inbound-document-type").then(r => r.json()),
    ]).then(([suppliersRes, materialsRes, unitsRes, locationsRes, docTypesRes]) => {
      setSuppliers(suppliersRes.data || suppliersRes || []);
      setMaterials(materialsRes.data || materialsRes || []);
      setUnits(unitsRes.items || unitsRes || []);
      setLocations(locationsRes.data || locationsRes || []);
      setDocumentTypes(docTypesRes.items || docTypesRes || []);
    }).catch(console.error);
  }, []);

  const form = useForm<InboundFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: receipt
      ? {
          id: receipt.id,
          receiptCode: receipt.receiptCode,
          typeId: receipt.typeId,
          statusId: receipt.statusId,
          supplierId: receipt.supplierId,
          purchaseRequestId: receipt.purchaseRequestId || null,
          referenceCode: receipt.referenceCode || null,
          inboundDate: new Date(receipt.inboundDate),
          notes: receipt.notes || null,
          step: receipt.step,
          items: receipt.items?.map(item => ({
            id: item.id,
            materialId: item.materialId,
            unitId: item.unitId,
            locationId: item.locationId || null,
            orderedQuantity: item.orderedQuantity,
            receivedQuantity: item.receivedQuantity,
            receivingQuantity: item.receivingQuantity,
            serialBatch: item.serialBatch || null,
            kcs: item.kcs,
          })) || [],
          documents: receipt.documents?.map(doc => ({
            id: doc.id,
            typeId: doc.typeId,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl || null,
          })) || [],
        }
      : {
          id: "",
          receiptCode: "",
          typeId: inboundTypes[0]?.id || "",
          statusId: inboundStatuses.find(s => s.code === "DRAFT")?.id || inboundStatuses[0]?.id || "",
          supplierId: "",
          purchaseRequestId: null,
          referenceCode: null,
          inboundDate: new Date(),
          notes: null,
          step: 1,
          items: [],
          documents: [],
        },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { fields: docFields, append: appendDoc, remove: removeDoc } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  const handleAddItem = () => {
    const defaultMaterial = materials[0];
    const defaultUnit = units[0];
    appendItem({
      materialId: defaultMaterial?.id || "",
      unitId: defaultUnit?.id || "",
      locationId: null,
      orderedQuantity: 0,
      receivedQuantity: 0,
      receivingQuantity: 0,
      serialBatch: null,
      kcs: false,
    });
  };

  const handleAddDocument = () => {
    const defaultDocType = documentTypes[0];
    appendDoc({
      typeId: defaultDocType?.id || "",
      fileName: "",
      fileUrl: null,
    });
  };

  // Get material name for display
  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material ? `${material.code} - ${material.name}` : materialId;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2 max-h-[85vh] overflow-y-auto pr-4">
        {receipt && <Stepper currentStep={receipt.step} />}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="receiptCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số Phiếu Nhập</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} disabled className="bg-muted/60" placeholder="Tự động tạo" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="typeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại Nhập kho</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {inboundTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            name="statusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {inboundStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Nhà cung cấp</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Chọn nhà cung cấp" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>{supplier.code} - {supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="referenceCode"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Mã tham chiếu (PR/PO)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} disabled={viewMode} placeholder="VD: PR-2026-001" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>Ghi chú</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ""} disabled={viewMode} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormSectionHeader title="Chi tiết hàng nhập">
            {!viewMode && (
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" /> Thêm dòng
              </Button>
            )}
          </FormSectionHeader>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Vật tư</TableHead>
                  <TableHead className="w-[100px]">Đơn vị</TableHead>
                  <TableHead className="text-right w-[80px]">SL Đặt</TableHead>
                  <TableHead className="text-right w-[80px]">Đã Nhập</TableHead>
                  <TableHead className="text-right w-[80px]">Nhập LN</TableHead>
                  <TableHead className="w-[120px]">Serial/Batch</TableHead>
                  <TableHead className="w-[150px]">Vị trí</TableHead>
                  <TableHead className="w-[60px]">KCS</TableHead>
                  {!viewMode && <TableHead className="w-[50px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemFields.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.materialId`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn vật tư" />
                            </SelectTrigger>
                            <SelectContent>
                              {materials.map((m) => (
                                <SelectItem key={m.id} value={m.id}>{m.code} - {m.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitId`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((u) => (
                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>
                    <TableCell><Input type="number" {...form.register(`items.${index}.orderedQuantity`)} disabled={viewMode} className="w-full text-right"/></TableCell>
                    <TableCell><Input type="number" {...form.register(`items.${index}.receivedQuantity`)} disabled={viewMode} className="w-full text-right"/></TableCell>
                    <TableCell><Input type="number" {...form.register(`items.${index}.receivingQuantity`)} disabled={viewMode} className="w-full text-right"/></TableCell>
                    <TableCell><Input {...form.register(`items.${index}.serialBatch`)} disabled={viewMode} /></TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.locationId`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value || ""} disabled={viewMode}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((loc) => (
                                <SelectItem key={loc.id} value={loc.id}>{loc.code}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <FormField
                        control={form.control}
                        name={`items.${index}.kcs`}
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-center">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={viewMode}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    {!viewMode && (
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {itemFields.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={viewMode ? 8 : 9} className="text-center text-muted-foreground h-24">
                      Chưa có hàng nhập. {!viewMode && "Nhấn \"Thêm dòng\" để thêm."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-2">
          <FormSectionHeader title="Hồ sơ chứng từ kèm theo">
            {!viewMode && (
              <Button type="button" variant="outline" size="sm" onClick={handleAddDocument}>
                <Upload className="mr-2 h-4 w-4" /> Thêm hồ sơ
              </Button>
            )}
          </FormSectionHeader>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Loại Hồ sơ</TableHead>
                  <TableHead>Tên File</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docFields.map((doc, index) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`documents.${index}.typeId`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {documentTypes.map((dt) => (
                                <SelectItem key={dt.id} value={dt.id}>{dt.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Input {...form.register(`documents.${index}.fileName`)} disabled={viewMode} placeholder="Tên file" />
                    </TableCell>
                    <TableCell>
                      {!viewMode && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeDoc(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {docFields.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                      Chưa có chứng từ. {!viewMode && "Nhấn \"Thêm hồ sơ\" để thêm."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="!justify-between pt-8">
          <div>
            {!viewMode && <Button type="button" variant="outline"><Printer className="mr-2 h-4 w-4"/>In Phiếu Nhập</Button>}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Đóng
            </Button>
            {!viewMode && <Button type="submit"><Save className="mr-2 h-4 w-4"/>Lưu dữ liệu</Button>}
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
}
