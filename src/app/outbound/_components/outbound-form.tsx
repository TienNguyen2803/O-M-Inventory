"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { CalendarIcon, Save, Check, Printer } from "lucide-react";
import type { OutboundVoucher } from "@/lib/types";

const formSchema = z.object({
  id: z.string(),
  issueDate: z.date(),
  purpose: z.string(),
  departmentAndReceiver: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      materialCode: z.string(),
      materialName: z.string(),
      unit: z.string(),
      requestedQuantity: z.number(),
      issuedQuantity: z.coerce.number(),
      pickLocationSuggestion: z.string(),
      actualSerial: z.string(),
    })
  ).optional(),
});

export type OutboundFormValues = z.infer<typeof formSchema>;

type OutboundFormProps = {
  voucher: OutboundVoucher | null;
  onSubmit: (values: OutboundFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
};

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, name: "Yêu cầu VT" },
    { id: 2, name: "Phê duyệt" },
    { id: 3, name: "Soạn hàng (Picking)" },
    { id: 4, name: "Xuất kho (Issue)" },
  ];

  return (
    <div className="flex items-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center w-32">
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


const FormSectionHeader = ({ title }: { title: string }) => (
  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-primary border-b pb-2 my-4">
    {title}
  </h3>
);

export function OutboundForm({
  voucher,
  onSubmit,
  onCancel,
  viewMode,
}: OutboundFormProps) {
  const form = useForm<OutboundFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: voucher
      ? {
          ...voucher,
          issueDate: new Date(voucher.issueDate),
          departmentAndReceiver: `${voucher.department} - ${voucher.receiverName}`,
          items: voucher.items || [],
        }
      : {
          id: "",
          issueDate: new Date(),
          purpose: "Cấp O&M",
          departmentAndReceiver: "",
          items: [],
        },
  });
  
  const { fields } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 pt-2 max-h-[85vh] overflow-y-auto pr-4"
      >
        {voucher && <Stepper currentStep={voucher.step} />}

        <div className="grid grid-cols-3 gap-x-6 gap-y-4 items-end">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số Phiếu Xuất</FormLabel>
                <FormControl>
                  <Input {...field} disabled className="font-semibold text-primary bg-muted/50"/>
                </FormControl>
              </FormItem>
            )}
          />

           <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mục đích Xuất</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={viewMode}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mục đích" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Cấp O&M">Cấp O&M</SelectItem>
                    <SelectItem value="Khẩn cấp">Khẩn cấp</SelectItem>
                    <SelectItem value="Cho mượn">Cho mượn</SelectItem>
                    <SelectItem value="Đi Sửa chữa">Đi Sửa chữa</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày xuất</FormLabel>
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
              </FormItem>
            )}
          />

          <div className="col-span-3">
             <FormField
                control={form.control}
                name="departmentAndReceiver"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị/Người nhận</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={viewMode} />
                    </FormControl>
                  </FormItem>
                )}
              />
          </div>
        </div>
       
        <div className="space-y-2 pt-2">
          <FormSectionHeader title="CHI TIẾT HÀNG XUẤT (PICKING LIST)" />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MÃ VT</TableHead>
                  <TableHead>TÊN VẬT TƯ</TableHead>
                  <TableHead className="text-right">SL YC</TableHead>
                  <TableHead className="text-right">SL XUẤT</TableHead>
                  <TableHead>ĐVT</TableHead>
                  <TableHead>LẤY TỪ VỊ TRÍ (GỢI Ý)</TableHead>
                  <TableHead>SERIAL THỰC XUẤT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-xs">{item.materialCode}</TableCell>
                    <TableCell>{item.materialName}</TableCell>
                    <TableCell className="text-right">{item.requestedQuantity}</TableCell>
                    <TableCell><Input type="number" {...form.register(`items.${index}.issuedQuantity`)} disabled={viewMode} className="w-20 text-right"/></TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.pickLocationSuggestion}</TableCell>
                    <TableCell><Input {...form.register(`items.${index}.actualSerial`)} disabled={viewMode} /></TableCell>
                  </TableRow>
                ))}
                 {fields.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Chưa có vật tư nào.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="!justify-between items-center pt-4 sticky bottom-0 bg-background py-4 -mx-4 px-4 border-t">
          <div className="flex gap-2">
             <Button type="button" variant="outline"><Printer className="mr-2 h-4 w-4"/> In Phiếu Xuất</Button>
             <Button type="button" variant="outline"><Printer className="mr-2 h-4 w-4"/> In BB Bàn Giao</Button>
          </div>
          <div className="flex items-center gap-2">
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
