"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogFooter } from "@/components/ui/dialog";
import { CalendarIcon, Plus, Save, Check, Trash2, Package } from "lucide-react";
import type { Material, MaterialRequest, MasterDataItem } from "@/lib/types";
import { MaterialPickerDialog } from "./material-picker-dialog";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  id: z.string(),
  requestDate: z.date(),
  requesterId: z.string().min(1, "Vui lòng chọn người yêu cầu."),
  departmentId: z.string().min(1, "Vui lòng chọn đơn vị."),
  priorityId: z.string().min(1, "Vui lòng chọn độ ưu tiên."),
  statusId: z.string().optional(),
  approverId: z.string().optional(),
  workOrder: z.string().optional(),
  reason: z.string().min(1, "Lý do là bắt buộc."),
  items: z.array(
    z.object({
      materialId: z.string(),
      unitId: z.string(),
      materialCode: z.string().optional(),
      materialName: z.string().optional(),
      partNumber: z.string().optional(),
      requestedQuantity: z.coerce.number().min(1, "SL phải > 0"),
      stock: z.number(),
      notes: z.string().optional(),
    })
  ),
});

export type RequestFormValues = z.infer<typeof formSchema>;

type RequestFormProps = {
  request: MaterialRequest | null;
  materials: Material[];
  users?: Array<{ id: string; name: string; employeeCode: string }>;
  departments?: MasterDataItem[];
  priorities?: MasterDataItem[];
  statuses?: MasterDataItem[];
  onSubmit: (values: RequestFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
};

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, name: "Tạo yêu cầu" },
    { id: 2, name: "Chờ duyệt" },
    { id: 3, name: "Đã duyệt" },
    { id: 4, name: "Hoàn thành" },
  ];

  return (
    <div className="flex items-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center w-32 text-center">
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
            <p
              className={cn(
                "text-xs mt-2",
                step.id <= currentStep
                  ? "font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {step.name}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mb-6",
                step.id < currentStep ? "bg-green-500" : "bg-border"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const FormSectionHeader = ({ title }: { title: string }) => (
  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-primary border-b pb-2 mb-2">
    {title}
  </h3>
);

export function RequestForm({
  request,
  materials,
  users = [],
  departments = [],
  priorities = [],
  onSubmit,
  onCancel,
  viewMode,
}: RequestFormProps) {
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: request
      ? {
          id: request.id,
          requestDate: new Date(request.requestDate),
          requesterId: request.requesterId || "",
          departmentId: request.departmentId || "",
          priorityId: request.priorityId || "",
          statusId: request.statusId || "",
          approverId: request.approverId || "",
          workOrder: request.workOrder || "",
          reason: request.reason,
          items: request.items.map((item) => ({
            materialId: item.materialId,
            unitId: item.unitId || "",
            materialCode: item.materialCode || item.material?.code || "",
            materialName: item.materialName || item.material?.name || "",
            partNumber: item.partNumber || item.material?.partNo || "",
            requestedQuantity: item.requestedQuantity,
            stock: item.stock,
            notes: item.notes || "",
          })),
        }
      : {
          id: "",
          requestDate: new Date(),
          requesterId: "",
          departmentId: "",
          priorityId: priorities[0]?.id || "",
          statusId: "",
          approverId: "",
          workOrder: "",
          reason: "",
          items: [],
        },
  });

  // Reset form when request prop changes (important for edit mode)
  React.useEffect(() => {
    if (request) {
      form.reset({
        id: request.id,
        requestDate: new Date(request.requestDate),
        requesterId: request.requesterId || "",
        departmentId: request.departmentId || "",
        priorityId: request.priorityId || "",
        statusId: request.statusId || "",
        approverId: request.approverId || "",
        workOrder: request.workOrder || "",
        reason: request.reason,
        items: request.items.map((item) => ({
          materialId: item.materialId,
          unitId: item.unitId || "",
          materialCode: item.materialCode || item.material?.code || "",
          materialName: item.materialName || item.material?.name || "",
          partNumber: item.partNumber || item.material?.partNo || "",
          requestedQuantity: item.requestedQuantity,
          stock: item.stock,
          notes: item.notes || "",
        })),
      });
    } else {
      form.reset({
        id: "",
        requestDate: new Date(),
        requesterId: "",
        departmentId: "",
        priorityId: priorities[0]?.id || "",
        statusId: "",
        approverId: "",
        workOrder: "",
        reason: "",
        items: [],
      });
    }
  }, [request, form, priorities]);

  // State for material picker dialog
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);

  // Watch items to trigger re-render when items change
  const watchedItems = form.watch("items");

  // Get unit info for a material
  const getUnitInfo = (material: Material) => {
    if (material.materialUnit && typeof material.materialUnit === 'object') {
      return material.materialUnit as MasterDataItem;
    }
    return null;
  };

  // Add material item to form
  const handleAddMaterial = (material: Material, quantity: number) => {
    const currentItems = form.getValues("items");
    const unitInfo = getUnitInfo(material);
    
    const newItem = {
      materialId: material.id,
      unitId: unitInfo?.id || material.unitId || "",
      materialCode: material.code,
      materialName: material.name,
      partNumber: material.partNo || "",
      requestedQuantity: quantity,
      stock: material.stock || 0,
      notes: "",
    };

    form.setValue("items", [...currentItems, newItem], { shouldValidate: true });
    setIsPickerOpen(false);
  };

  // Remove item from form
  const handleRemoveItem = (index: number) => {
    const currentItems = form.getValues("items");
    form.setValue(
      "items",
      currentItems.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  // Update item field
  const handleUpdateItem = (index: number, field: 'requestedQuantity' | 'notes', value: string | number) => {
    const currentItems = form.getValues("items");
    const updatedItems = [...currentItems];
    if (field === 'requestedQuantity') {
      updatedItems[index].requestedQuantity = typeof value === 'number' ? value : parseInt(value) || 0;
    } else {
      updatedItems[index].notes = String(value);
    }
    form.setValue("items", updatedItems, { shouldValidate: true });
  };

  // Get selected material IDs
  const getSelectedMaterialIds = () => {
    return watchedItems.map(item => item.materialId);
  };

  // Get display values for readonly fields
  const getRequesterName = () => {
    if (request?.requester?.name) return request.requester.name;
    const user = users.find((u) => u.id === form.getValues("requesterId"));
    return user?.name || "";
  };

  const getDepartmentName = () => {
    if (request?.department?.name) return request.department.name;
    const dept = departments.find(
      (d) => d.id === form.getValues("departmentId")
    );
    return dept?.name || "";
  };

  const getPriorityName = () => {
    if (request?.priority?.name) return request.priority.name;
    const priority = priorities.find(
      (p) => p.id === form.getValues("priorityId")
    );
    return priority?.name || "";
  };

  const getStatusName = () => {
    return request?.status?.name || "";
  };

  const getApproverName = () => {
    return request?.approver?.name || "";
  };

  return (
    <>
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 pt-2 max-h-[80vh] overflow-y-auto pr-4"
      >
        {request && <Stepper currentStep={request.step} />}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã Phiếu</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requestDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày yêu cầu</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={viewMode}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priorityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Độ ưu tiên</FormLabel>
                {viewMode ? (
                  <Input value={getPriorityName()} disabled />
                ) : (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={viewMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn độ ưu tiên" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requesterId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Người yêu cầu</FormLabel>
                {viewMode ? (
                  <Input value={getRequesterName()} disabled />
                ) : (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={viewMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn người yêu cầu" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.employeeCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đơn vị sử dụng</FormLabel>
                {viewMode ? (
                  <Input value={getDepartmentName()} disabled />
                ) : (
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
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã WO/Công trình</FormLabel>
                <FormControl>
                  <Input {...field} disabled={viewMode} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-3">
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lý do / Mục đích</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={viewMode} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card className="mt-6">
          <CardContent className="pt-4">
            <FormSectionHeader title="Chi tiết vật tư đề nghị cấp" />
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[120px] font-semibold">Mã VT</TableHead>
                    <TableHead className="font-semibold">Tên Vật Tư</TableHead>
                    <TableHead className="w-[120px] font-semibold">Part Number</TableHead>
                    <TableHead className="w-[80px] font-semibold">ĐVT</TableHead>
                    <TableHead className="w-[100px] text-center font-semibold">SL YC</TableHead>
                    <TableHead className="w-[80px] text-right font-semibold">Tồn Kho</TableHead>
                    <TableHead className="w-[150px] font-semibold">Ghi Chú</TableHead>
                    {!viewMode && <TableHead className="w-[50px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {watchedItems.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={viewMode ? 7 : 8}
                        className="h-24 text-center"
                      >
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Package className="h-8 w-8 mb-2 opacity-40" />
                          <p>Chưa có vật tư nào</p>
                          {!viewMode && <p className="text-xs mt-1">Click &quot;+ Thêm vật tư&quot; để bắt đầu</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                ) : (
                  watchedItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.materialCode}
                      </TableCell>
                      <TableCell>{item.materialName}</TableCell>
                      <TableCell>{item.partNumber}</TableCell>
                      <TableCell>
                        {materials.find((m) => m.id === item.materialId)
                          ?.materialUnit &&
                        typeof materials.find((m) => m.id === item.materialId)
                          ?.materialUnit === "object"
                          ? (
                              materials.find((m) => m.id === item.materialId)
                                ?.materialUnit as MasterDataItem
                            ).name
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {viewMode ? (
                          <span className="text-center block">{item.requestedQuantity}</span>
                        ) : (
                          <Input
                            type="number"
                            min={1}
                            value={item.requestedQuantity}
                            onChange={(e) =>
                              handleUpdateItem(index, "requestedQuantity", e.target.value)
                            }
                            className="h-8 text-center w-20"
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.stock}</TableCell>
                      <TableCell>
                        {viewMode ? (
                          item.notes || "-"
                        ) : (
                          <Input
                            value={item.notes || ""}
                            onChange={(e) =>
                              handleUpdateItem(index, "notes", e.target.value)
                            }
                            className="h-8"
                            placeholder="Ghi chú..."
                          />
                        )}
                      </TableCell>
                      {!viewMode && (
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
                </TableBody>
              </Table>
            </div>
            {!viewMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 border-dashed border-primary/50 text-primary hover:bg-primary/5 hover:text-primary"
                onClick={() => setIsPickerOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm vật tư
              </Button>
            )}
          </CardContent>
        </Card>

        <DialogFooter className="!justify-between items-center pt-4 sticky bottom-0 bg-background py-4 -mx-4 px-4 border-t">
          <div className="text-sm text-muted-foreground">
            {getApproverName() && (
              <span>
                Người duyệt:{" "}
                <span className="font-semibold">{getApproverName()}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {getStatusName() && (
                <span>
                  Tình trạng:{" "}
                  <span
                    className={cn("font-semibold", {
                      "text-green-600":
                        request?.status?.code === "APPR" ||
                        request?.status?.name === "Đã duyệt",
                      "text-yellow-600":
                        request?.status?.code === "PEND" ||
                        request?.status?.name === "Chờ duyệt",
                      "text-blue-600":
                        request?.status?.code === "DONE" ||
                        request?.status?.name === "Hoàn thành",
                    })}
                  >
                    {getStatusName()}
                  </span>
                </span>
              )}
            </div>
            <Button type="button" variant="outline" onClick={onCancel}>
              Đóng
            </Button>
            {!viewMode && (
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Lưu dữ liệu
              </Button>
            )}
          </div>
        </DialogFooter>
      </form>
    </Form>

      {/* Material Picker Dialog */}
      <MaterialPickerDialog
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        materials={materials}
        onSelect={handleAddMaterial}
        selectedMaterialIds={getSelectedMaterialIds()}
      />
    </>
  );
}
