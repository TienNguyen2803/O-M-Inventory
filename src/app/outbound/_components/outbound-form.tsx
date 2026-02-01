"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { CalendarIcon, Save, Check, Trash2, Printer, Plus, Package, FileText, User, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { outboundSchema, type OutboundFormValues } from "@/lib/validations/outbound";
import type { OutboundReceipt, MasterDataItem, Material, WarehouseLocation, User as UserType } from "@/lib/types";

// Re-export for backward compatibility
export type { OutboundFormValues } from "@/lib/validations/outbound";

type OutboundFormProps = {
  receipt: OutboundReceipt | null;
  onSubmit: (values: OutboundFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
  outboundPurposes: MasterDataItem[];
  outboundStatuses: MasterDataItem[];
};

// Enhanced Stepper with better styling
const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, name: "Yêu cầu Xuất", icon: FileText },
    { id: 2, name: "Đã duyệt", icon: Check },
    { id: 3, name: "Đang soạn", icon: Package },
    { id: 4, name: "Đã xuất", icon: Check },
  ];

  return (
    <div className="relative mb-8">
      {/* Progress line background */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
      {/* Progress line filled */}
      <div 
        className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all duration-500"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      />
      
      <div className="relative flex justify-between">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 z-10 bg-background",
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white shadow-md shadow-green-500/30"
                    : isCurrent
                    ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "bg-muted border-muted-foreground/20 text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <span>{step.id}</span>}
              </div>
              <p className={cn(
                "text-xs mt-2 text-center font-medium transition-colors",
                isCompleted ? "text-green-600" : isCurrent ? "text-primary" : "text-muted-foreground"
              )}>
                {step.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Section Header with icon
const FormSectionHeader = ({ 
  title, 
  icon: Icon, 
  children,
  badge 
}: { 
  title: string; 
  icon?: React.ElementType;
  children?: React.ReactNode;
  badge?: string;
}) => (
  <div className="flex justify-between items-center py-3 border-b border-border/50">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-primary" />}
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
        {title}
      </h3>
      {badge && (
        <Badge variant="secondary" className="ml-2 text-xs">
          {badge}
        </Badge>
      )}
    </div>
    {children}
  </div>
);

// Loading Skeleton for form
const FormSkeleton = () => (
  <div className="space-y-6 p-4">
    <div className="flex justify-between mb-8">
      {[1,2,3,4].map(i => (
        <div key={i} className="flex flex-col items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-16 h-3" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-4 gap-4">
      {[1,2,3,4,5,6].map(i => (
        <Skeleton key={i} className="h-10" />
      ))}
    </div>
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-48 w-full" />
  </div>
);

export function OutboundForm({
  receipt,
  onSubmit,
  onCancel,
  viewMode,
  outboundPurposes,
  outboundStatuses,
}: OutboundFormProps) {
  // Fetch lookup data
  const [users, setUsers] = React.useState<UserType[]>([]);
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [units, setUnits] = React.useState<MasterDataItem[]>([]);
  const [locations, setLocations] = React.useState<WarehouseLocation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch("/api/users").then(r => r.json()),
      fetch("/api/materials").then(r => r.json()),
      fetch("/api/master-data/material-unit").then(r => r.json()),
      fetch("/api/warehouse-locations").then(r => r.json()),
    ]).then(([usersRes, materialsRes, unitsRes, locationsRes]) => {
      setUsers(usersRes.data || usersRes || []);
      setMaterials(materialsRes.data || materialsRes || []);
      setUnits(unitsRes.items || unitsRes || []);
      setLocations(locationsRes.data || locationsRes || []);
      setIsLoading(false);
    }).catch((err) => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const form = useForm<OutboundFormValues>({
    resolver: zodResolver(outboundSchema),
    defaultValues: receipt
      ? {
          id: receipt.id,
          receiptCode: receipt.receiptCode,
          purposeId: receipt.purposeId,
          statusId: receipt.statusId,
          receiverId: receipt.receiverId,
          materialRequestId: receipt.materialRequestId || null,
          reason: receipt.reason || null,
          outboundDate: new Date(receipt.outboundDate),
          notes: receipt.notes || null,
          step: receipt.step,
          items: receipt.items?.map(item => ({
            id: item.id,
            materialId: item.materialId,
            unitId: item.unitId,
            locationId: item.locationId || null,
            requestedQuantity: item.requestedQuantity,
            issuedQuantity: item.issuedQuantity,
            serialBatch: item.serialBatch || null,
          })) || [],
        }
      : {
          id: "",
          receiptCode: "",
          purposeId: outboundPurposes[0]?.id || "",
          statusId: outboundStatuses.find(s => s.code === "DRAFT")?.id || outboundStatuses[0]?.id || "",
          receiverId: "",
          materialRequestId: null,
          reason: null,
          outboundDate: new Date(),
          notes: null,
          step: 1,
          items: [],
        },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleAddItem = () => {
    const defaultMaterial = materials[0];
    const defaultUnit = units[0];
    appendItem({
      materialId: defaultMaterial?.id || "",
      unitId: defaultUnit?.id || "",
      locationId: null,
      requestedQuantity: 1,
      issuedQuantity: 0,
      serialBatch: null,
    });
  };

  // Show skeleton while loading
  if (isLoading) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2 max-h-[85vh] overflow-y-auto pr-2">
        {/* Stepper */}
        {receipt && <Stepper currentStep={receipt.step} />}

        {/* Main Info Card */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="py-3 px-4 bg-muted/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Thông tin phiếu xuất
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-4">
              {/* Row 1 */}
              <FormField
                control={form.control}
                name="receiptCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-muted-foreground">Số Phiếu Xuất</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ""} 
                        disabled 
                        className="bg-muted/50 border-dashed h-9 text-sm" 
                        placeholder="Tự động tạo" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purposeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-muted-foreground">Mục đích Xuất <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Chọn mục đích" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {outboundPurposes.map((purpose) => (
                          <SelectItem key={purpose.id} value={purpose.id}>{purpose.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="outboundDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-medium text-muted-foreground">Ngày xuất <span className="text-destructive">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal h-9 text-sm", !field.value && "text-muted-foreground")}
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
                    <FormLabel className="text-xs font-medium text-muted-foreground">Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {outboundStatuses.map((status) => (
                          <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Row 2 */}
              <FormField
                control={form.control}
                name="receiverId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Người/Đơn vị nhận <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Chọn người nhận" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => {
                          const dept = typeof user.department === 'object' ? user.department?.name : user.department;
                          return (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}{dept ? ` - ${dept}` : ""}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-medium text-muted-foreground">Lý do xuất</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""} 
                        disabled={viewMode} 
                        rows={2} 
                        placeholder="Nhập lý do xuất kho..." 
                        className="text-sm resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Row 3 - Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-4">
                    <FormLabel className="text-xs font-medium text-muted-foreground">Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""} 
                        disabled={viewMode} 
                        rows={2} 
                        className="text-sm resize-none"
                        placeholder="Ghi chú thêm..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items Card */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="py-3 px-4 bg-muted/30">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Chi tiết hàng xuất
                {itemFields.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {itemFields.length} dòng
                  </Badge>
                )}
              </CardTitle>
              {!viewMode && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddItem}
                  className="h-8 text-xs"
                >
                  <Plus className="mr-1 h-3 w-3" /> Thêm dòng
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-[220px] text-xs font-semibold">Vật tư</TableHead>
                    <TableHead className="w-[90px] text-xs font-semibold">Đơn vị</TableHead>
                    <TableHead className="text-right w-[90px] text-xs font-semibold">SL Yêu cầu</TableHead>
                    <TableHead className="text-right w-[90px] text-xs font-semibold">SL Xuất</TableHead>
                    <TableHead className="w-[140px] text-xs font-semibold">Vị trí lấy hàng</TableHead>
                    <TableHead className="w-[120px] text-xs font-semibold">Serial/Batch</TableHead>
                    {!viewMode && <TableHead className="w-[50px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemFields.map((item, index) => (
                    <TableRow key={item.id} className="group hover:bg-muted/20">
                      <TableCell className="py-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.materialId`}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                              <SelectTrigger className="w-full h-8 text-xs">
                                <SelectValue placeholder="Chọn vật tư" />
                              </SelectTrigger>
                              <SelectContent>
                                {materials.map((m) => (
                                  <SelectItem key={m.id} value={m.id} className="text-xs">
                                    {m.code} - {m.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitId`}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {units.map((u) => (
                                  <SelectItem key={u.id} value={u.id} className="text-xs">{u.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Input 
                          type="number" 
                          {...form.register(`items.${index}.requestedQuantity`)} 
                          disabled={viewMode} 
                          className="w-full text-right h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Input 
                          type="number" 
                          {...form.register(`items.${index}.issuedQuantity`)} 
                          disabled={viewMode} 
                          className="w-full text-right h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.locationId`}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""} disabled={viewMode}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Chọn vị trí" />
                              </SelectTrigger>
                              <SelectContent>
                                {locations.map((loc) => (
                                  <SelectItem key={loc.id} value={loc.id} className="text-xs">{loc.code}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Input 
                          {...form.register(`items.${index}.serialBatch`)} 
                          disabled={viewMode}
                          className="h-8 text-xs"
                          placeholder="S/N..."
                        />
                      </TableCell>
                      {!viewMode && (
                        <TableCell className="py-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" 
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {itemFields.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={viewMode ? 6 : 7} className="text-center text-muted-foreground h-24">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-8 w-8 text-muted-foreground/50" />
                          <span className="text-sm">Chưa có hàng xuất.</span>
                          {!viewMode && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={handleAddItem}
                              className="mt-2"
                            >
                              <Plus className="mr-1 h-3 w-3" /> Thêm dòng đầu tiên
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <DialogFooter className="!justify-between pt-4 border-t">
          <div>
            {!viewMode && (
              <Button type="button" variant="outline" className="h-9">
                <Printer className="mr-2 h-4 w-4"/>
                In Phiếu Xuất
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} className="h-9">
              Đóng
            </Button>
            {!viewMode && (
              <Button type="submit" className="h-9 px-6 bg-primary hover:bg-primary/90">
                <Save className="mr-2 h-4 w-4"/>
                Lưu dữ liệu
              </Button>
            )}
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
}
