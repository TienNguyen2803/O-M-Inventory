"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, Save, Check, Upload, Trash2, Printer } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { InboundReceipt } from "@/lib/types";

const formSchema = z.object({
  id: z.string(),
  inboundType: z.string({ required_error: "Vui lòng chọn loại nhập." }),
  reference: z.string().optional(),
  inboundDate: z.date({ required_error: "Vui lòng chọn ngày nhập." }),
  partner: z.string().min(1, "Đối tác là bắt buộc."),
  items: z.array(
    z.object({
      id: z.string(),
      materialCode: z.string(),
      materialName: z.string(),
      orderedQuantity: z.number(),
      receivedQuantity: z.number(),
      receivingQuantity: z.coerce.number().min(0, "Số lượng không hợp lệ"),
      serialBatch: z.string(),
      location: z.string(),
      kcs: z.boolean(),
    })
  ).optional(),
  documents: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      fileName: z.string(),
    })
  ).optional(),
});

export type InboundFormValues = z.infer<typeof formSchema>;

type InboundFormProps = {
  receipt: InboundReceipt | null;
  onSubmit: (values: InboundFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
};

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, name: "Mua sắm (PO)" },
    { id: 2, name: "Yêu cầu Nhập" },
    { id: 3, name: "KCS & Hồ sơ" },
    { id: 4, name: "Nhập kho (GRN)" },
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
}: InboundFormProps) {
  const form = useForm<InboundFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: receipt
      ? {
          ...receipt,
          inboundDate: new Date(receipt.inboundDate),
          items: receipt.items || [],
          documents: receipt.documents || [],
        }
      : {
          id: "",
          inboundType: "Theo PO",
          reference: "",
          inboundDate: new Date(),
          partner: "",
          status: "Đang nhập",
          items: [],
          documents: [],
        },
  });

  const { fields: itemFields } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const { fields: docFields, remove: removeDoc } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2 max-h-[85vh] overflow-y-auto pr-4">
        {receipt && <Stepper currentStep={receipt.step} />}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số Phiếu Nhập</FormLabel>
                <FormControl>
                  <Input {...field} disabled className="bg-muted/60" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inboundType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại Nhập kho</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={viewMode}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Theo PO">Theo PO</SelectItem>
                    <SelectItem value="Sau Sửa chữa">Sau Sửa chữa</SelectItem>
                    <SelectItem value="Hàng Mượn">Hàng Mượn</SelectItem>
                    <SelectItem value="Hoàn trả">Hoàn trả</SelectItem>
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
           <div />
           <FormField
            control={form.control}
            name="partner"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Nguồn (NCC)</FormLabel>
                <FormControl>
                  <Input {...field} disabled={viewMode} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormSectionHeader title="Chi tiết hàng nhập (kế thừa từ PO)" />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã VT</TableHead>
                  <TableHead>Tên Vật tư</TableHead>
                  <TableHead className="text-right">SL Đặt</TableHead>
                  <TableHead className="text-right">Đã Nhập</TableHead>
                  <TableHead className="text-right">Nhập Lần Này</TableHead>
                  <TableHead>Serial/Batch</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>KCS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemFields.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-xs">{item.materialCode}</TableCell>
                    <TableCell>{item.materialName}</TableCell>
                    <TableCell className="text-right">{item.orderedQuantity}</TableCell>
                    <TableCell className="text-right">{item.receivedQuantity}</TableCell>
                    <TableCell><Input type="number" {...form.register(`items.${index}.receivingQuantity`)} disabled={viewMode} className="w-20 text-right"/></TableCell>
                    <TableCell><Input {...form.register(`items.${index}.serialBatch`)} disabled={viewMode} /></TableCell>
                    <TableCell><Input {...form.register(`items.${index}.location`)} disabled={viewMode} /></TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="space-y-2">
            <FormSectionHeader title="Hồ sơ chứng từ kèm theo">
                {!viewMode && <Button type="button" variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" /> Tải lên</Button>}
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
                                <TableCell>{doc.type}</TableCell>
                                <TableCell><Button variant="link" className="p-0 h-auto text-primary">{doc.fileName}</Button></TableCell>
                                <TableCell>
                                    {!viewMode && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeDoc(index)}><Trash2 className="h-4 w-4" /></Button>}
                                </TableCell>
                             </TableRow>
                        ))}
                         {docFields.length === 0 && (
                            <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground h-24">Chưa có chứng từ.</TableCell></TableRow>
                         )}
                    </TableBody>
                </Table>
            </div>
        </div>

        <DialogFooter className="!justify-between pt-8">
            <div>
                 {!viewMode && <Button type="button" variant="outline"><Printer className="mr-2 h-4 w-4"/> In Phiếu Nhập</Button>}
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
