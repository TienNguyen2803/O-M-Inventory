"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { ShieldCheck, Paperclip, X, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { InboundReceipt } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      kcsResult: z.enum(["passed", "failed"], { required_error: "Vui lòng chọn kết quả." }),
      kcsNotes: z.string().optional(),
    })
  ),
});

export type KcsFormValues = z.infer<typeof formSchema>;

type KcsFormProps = {
  receipt: InboundReceipt | null;
  onSubmit: (values: KcsFormValues) => void;
  onCancel: () => void;
};

export function KcsForm({ receipt, onSubmit, onCancel }: KcsFormProps) {
  const form = useForm<KcsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: receipt?.items?.map(item => ({
        id: item.id,
        kcsResult: "passed", // Default to passed
        kcsNotes: "",
      })) || [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const allPassed = form.watch("items").every(item => item.kcsResult === "passed");

  return (
    <div className="max-h-[75vh] overflow-y-auto pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <Card className="col-span-1">
                <CardHeader className="p-4">
                    <CardTitle className="text-base">Thông tin phiếu nhập</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Số phiếu:</span> <span className="font-semibold">{receipt?.id}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Ngày nhập:</span> <span className="font-semibold">{receipt ? format(new Date(receipt.inboundDate), "dd/MM/yyyy") : ''}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Nhà cung cấp:</span> <span className="font-semibold">{receipt?.partner}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Tham chiếu PO:</span> <span className="font-semibold">{receipt?.reference}</span></div>
                </CardContent>
            </Card>
             <Card className="col-span-2">
                <CardHeader className="p-4">
                    <CardTitle className="text-base">Hồ sơ & Chứng từ đính kèm</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                    {receipt?.documents && receipt.documents.length > 0 ? receipt.documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between rounded-md border p-2 bg-muted/40">
                           <div className="flex items-center gap-2">
                             <Paperclip className="h-4 w-4 text-muted-foreground"/>
                             <div>
                                 <p className="font-medium text-primary cursor-pointer hover:underline">{doc.fileName}</p>
                                 <p className="text-xs text-muted-foreground">{doc.type}</p>
                             </div>
                           </div>
                           <Button size="sm" variant="secondary"><Check className="h-4 w-4 mr-2 text-green-600"/> Đã đối chiếu</Button>
                        </div>
                    )) : (
                        <p className="text-muted-foreground text-center p-4">Không có chứng từ nào.</p>
                    )}
                </CardContent>
            </Card>
          </div>

          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-primary border-b pb-2 my-4">
            Kết quả kiểm tra
          </h3>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Tên Vật tư / Mã</TableHead>
                  <TableHead>SL Nhập</TableHead>
                  <TableHead>Serial / Batch</TableHead>
                  <TableHead className="w-[180px]">Kết quả</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipt?.items?.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-semibold">{item.materialName}</div>
                      <div className="text-xs text-muted-foreground">{item.materialCode}</div>
                    </TableCell>
                    <TableCell className="font-medium">{item.receivingQuantity} {item.unit}</TableCell>
                    <TableCell className="text-muted-foreground">{item.serialBatch}</TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.kcsResult`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex gap-4"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl><RadioGroupItem value="passed" id={`passed-${index}`} /></FormControl>
                                  <FormLabel htmlFor={`passed-${index}`} className="font-normal text-green-700">Đạt</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl><RadioGroupItem value="failed" id={`failed-${index}`} /></FormControl>
                                  <FormLabel htmlFor={`failed-${index}`} className="font-normal text-red-700">Không đạt</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                        <FormField
                            control={form.control}
                            name={`items.${index}.kcsNotes`}
                            render={({ field }) => (
                                <Input {...field} placeholder="Lý do (nếu không đạt)..." />
                            )}
                        />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

           <DialogFooter className="pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit" disabled={!allPassed}>
              <ShieldCheck className="mr-2 h-4 w-4" /> 
              {allPassed ? 'Xác nhận & Chuyển giao' : 'Tất cả phải "Đạt"'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
