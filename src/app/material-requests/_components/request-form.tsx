"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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
import { CalendarIcon, Plus, Save, Check } from "lucide-react";
import type { Material, MaterialRequest } from "@/lib/types";

const formSchema = z.object({
  id: z.string(),
  requestDate: z.date(),
  priority: z.string(),
  requesterDept: z.string().min(1, "Đơn vị sử dụng là bắt buộc."),
  workOrder: z.string().optional(),
  reason: z.string().min(1, "Lý do là bắt buộc."),
  items: z.array(
    z.object({
      materialId: z.string(),
      materialCode: z.string(),
      materialName: z.string(),
      partNumber: z.string(),
      unit: z.string(),
      requestedQuantity: z.coerce.number().min(1, "SL phải > 0"),
      stock: z.number(),
      notes: z.string().optional(),
    })
  ),
  approver: z.string().optional(),
  status: z.string(),
});

export type RequestFormValues = z.infer<typeof formSchema>;

type RequestFormProps = {
  request: MaterialRequest | null;
  materials: Material[]; // To select new materials
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
  onSubmit,
  onCancel,
  viewMode,
}: RequestFormProps) {
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: request
      ? {
          ...request,
          requestDate: new Date(request.requestDate),
        }
      : {
          id: "",
          requestDate: new Date(),
          priority: "Bình thường",
          requesterDept: "",
          workOrder: "",
          reason: "",
          items: [],
          status: "Chờ duyệt",
        },
  });

  const { fields, append, remove } = form.control;

  return (
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
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Độ ưu tiên</FormLabel>
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
                    <SelectItem value="Bình thường">Bình thường</SelectItem>
                    <SelectItem value="Khẩn cấp">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requesterDept"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đơn vị sử dụng</FormLabel>
                <FormControl>
                  <Input {...field} disabled={viewMode} />
                </FormControl>
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

        <div className="space-y-2 pt-2">
          <FormSectionHeader title="Chi tiết vật tư đề nghị cấp" />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã VT</TableHead>
                  <TableHead>Tên Vật Tư</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead>ĐVT</TableHead>
                  <TableHead className="text-right">SL YC</TableHead>
                  <TableHead className="text-right">Tồn Kho</TableHead>
                  <TableHead>Ghi Chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.getValues("items").map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.materialCode}
                    </TableCell>
                    <TableCell>{item.materialName}</TableCell>
                    <TableCell>{item.partNumber}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">
                      {item.requestedQuantity}
                    </TableCell>
                    <TableCell className="text-right">{item.stock}</TableCell>
                    <TableCell>{item.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {!viewMode && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="p-0 h-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm dòng
            </Button>
          )}
        </div>

        <DialogFooter className="!justify-between items-center pt-4 sticky bottom-0 bg-background py-4 -mx-4 px-4 border-t">
          <div className="text-sm text-muted-foreground">
            {request?.approver && (
              <span>
                Người duyệt:{" "}
                <span className="font-semibold">{request.approver}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
             <div className="text-sm text-muted-foreground">
              {request?.status && (
                <span>
                  Tình trạng:{" "}
                  <span
                    className={cn("font-semibold", {
                      "text-green-600": request.status === "Đã duyệt",
                      "text-yellow-600": request.status === "Chờ duyệt",
                    })}
                  >
                    {request.status}
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
  );
}
