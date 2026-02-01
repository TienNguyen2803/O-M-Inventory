"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { CalendarIcon, Save, Check, Trash2, Printer, Plus } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { outboundSchema, type OutboundFormValues } from "@/lib/validations/outbound";
import type { OutboundReceipt, MasterDataItem, Material, WarehouseLocation, User } from "@/lib/types";

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

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, name: "Yêu cầu Xuất" },
    { id: 2, name: "Đã duyệt" },
    { id: 3, name: "Đang soạn" },
    { id: 4, name: "Đã xuất" },
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

export function OutboundForm({
  receipt,
  onSubmit,
  onCancel,
  viewMode,
  outboundPurposes,
  outboundStatuses,
}: OutboundFormProps) {
  // Fetch lookup data
  const [users, setUsers] = React.useState<User[]>([]);
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [units, setUnits] = React.useState<MasterDataItem[]>([]);
  const [locations, setLocations] = React.useState<WarehouseLocation[]>([]);

  React.useEffect(() => {
    // Fetch lookup data in parallel
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
    }).catch(console.error);
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

  // Get user display name with department
  const getUserDisplay = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return userId;
    const dept = typeof user.department === 'object' ? user.department?.name : user.department;
    return dept ? `${user.name} - ${dept}` : user.name;
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
                <FormLabel>Số Phiếu Xuất</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} disabled className="bg-muted/60" placeholder="Tự động tạo" />
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
                <FormLabel>Mục đích Xuất</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Chọn mục đích" /></SelectTrigger></FormControl>
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
                <FormLabel>Ngày xuất</FormLabel>
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
                    {outboundStatuses.map((status) => (
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
            name="receiverId"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Người/Đơn vị nhận</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Chọn người nhận" /></SelectTrigger></FormControl>
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
              <FormItem className="col-span-2">
                <FormLabel>Lý do xuất</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ""} disabled={viewMode} rows={2} placeholder="Nhập lý do xuất kho..." />
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
          <FormSectionHeader title="Chi tiết hàng xuất">
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
                  <TableHead className="text-right w-[100px]">SL Yêu cầu</TableHead>
                  <TableHead className="text-right w-[100px]">SL Xuất</TableHead>
                  <TableHead className="w-[150px]">Vị trí lấy hàng</TableHead>
                  <TableHead className="w-[120px]">Serial/Batch</TableHead>
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
                    <TableCell><Input type="number" {...form.register(`items.${index}.requestedQuantity`)} disabled={viewMode} className="w-full text-right"/></TableCell>
                    <TableCell><Input type="number" {...form.register(`items.${index}.issuedQuantity`)} disabled={viewMode} className="w-full text-right"/></TableCell>
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
                    <TableCell><Input {...form.register(`items.${index}.serialBatch`)} disabled={viewMode} /></TableCell>
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
                    <TableCell colSpan={viewMode ? 6 : 7} className="text-center text-muted-foreground h-24">
                      Chưa có hàng xuất. {!viewMode && "Nhấn \"Thêm dòng\" để thêm."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="!justify-between pt-8">
          <div>
            {!viewMode && <Button type="button" variant="outline"><Printer className="mr-2 h-4 w-4"/>In Phiếu Xuất</Button>}
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
