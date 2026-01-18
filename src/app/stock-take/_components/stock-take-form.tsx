"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";

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
import type { StockTake } from "@/lib/types";

const formSchema = z.object({
  id: z.string(),
  date: z.date(),
  area: z.string(),
  leader: z.string().min(1, "Trưởng ban là bắt buộc."),
  results: z.array(
    z.object({
      id: z.string(),
      materialCode: z.string(),
      location: z.string(),
      bookQuantity: z.number(),
      actualQuantity: z.coerce.number(),
      notes: z.string().optional(),
    })
  ).optional(),
});

export type StockTakeFormValues = z.infer<typeof formSchema>;

type StockTakeFormProps = {
  stockTake: StockTake | null;
  onSubmit: (values: StockTakeFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
};

const FormSectionHeader = ({ title }: { title: string }) => (
  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-primary border-b pb-2 my-4">
    {title}
  </h3>
);

export function StockTakeForm({ stockTake, onSubmit, onCancel, viewMode }: StockTakeFormProps) {
  const form = useForm<StockTakeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: stockTake
      ? {
          ...stockTake,
          date: new Date(stockTake.date),
        }
      : {
          id: "",
          date: new Date(),
          area: "Toàn bộ",
          leader: "",
          results: [],
        },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "results",
  });

  const results = form.watch("results");

  return (
    <div className="max-h-[75vh] overflow-y-auto pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã Đợt Kiểm</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="bg-muted/50 font-semibold" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày chốt sổ</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          disabled={viewMode}
                        >
                          {field.value ? format(field.value, "MM/dd/yyyy") : <span>Chọn ngày</span>}
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
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khu vực kiểm</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={viewMode}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Toàn bộ">Toàn bộ</SelectItem>
                      <SelectItem value="Khu A">Khu A</SelectItem>
                      <SelectItem value="Khu B">Khu B</SelectItem>
                      <SelectItem value="Kho Lạnh">Kho Lạnh</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leader"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trưởng ban</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={viewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormSectionHeader title="Kết quả kiểm kê" />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MÃ VT</TableHead>
                  <TableHead>VỊ TRÍ</TableHead>
                  <TableHead className="text-right">TỒN SỐ</TableHead>
                  <TableHead className="text-right">THỰC TẾ</TableHead>
                  <TableHead className="text-right">LỆCH</TableHead>
                  <TableHead>GHI CHÚ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((item, index) => {
                  const currentActualQuantity = results?.[index]?.actualQuantity;
                  const bookQuantity = item.bookQuantity;
                  // Ensure actualQuantity is a number for calculation
                  const actualQuantity = typeof currentActualQuantity === 'number' ? currentActualQuantity : bookQuantity;
                  const difference = actualQuantity - bookQuantity;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground text-xs">{item.materialCode}</TableCell>
                      <TableCell className="font-medium">{item.location}</TableCell>
                      <TableCell className="text-right">{item.bookQuantity}</TableCell>
                      <TableCell className="p-1">
                        <Input
                          type="number"
                          {...form.register(`results.${index}.actualQuantity`)}
                          disabled={viewMode}
                          className={cn("w-24 text-right", difference !== 0 ? 'bg-yellow-100 font-bold' : '')}
                        />
                      </TableCell>
                      <TableCell className={cn("text-right font-bold", difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : '')}>
                        {difference}
                      </TableCell>
                      <TableCell className="p-1">
                         <Input
                          {...form.register(`results.${index}.notes`)}
                          disabled={viewMode}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                 {fields.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground h-24">Không có dữ liệu kiểm kê.</TableCell></TableRow>
                 )}
              </TableBody>
            </Table>
          </div>

           <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Đóng
            </Button>
            {!viewMode && (
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Lưu dữ liệu
              </Button>
            )}
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
