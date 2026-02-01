"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Stocktake, MasterDataItem } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Tên đợt kiểm kê là bắt buộc"),
  areaId: z.string().min(1, "Khu vực là bắt buộc"),
  takeDate: z.date({ required_error: "Ngày kiểm kê là bắt buộc" }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type StocktakeFormProps = {
  stocktake?: Stocktake | null;
  stocktakeAreas: MasterDataItem[];
  onSuccess: (stocktake: Stocktake) => void;
  onCancel: () => void;
};

export function StocktakeForm({
  stocktake,
  stocktakeAreas,
  onSuccess,
  onCancel,
}: StocktakeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: stocktake?.name || "",
      areaId: stocktake?.areaId || "",
      takeDate: stocktake?.takeDate
        ? new Date(stocktake.takeDate)
        : new Date(),
      notes: stocktake?.notes || "",
    },
  });

  useEffect(() => {
    if (stocktake) {
      form.reset({
        name: stocktake.name,
        areaId: stocktake.areaId,
        takeDate: new Date(stocktake.takeDate),
        notes: stocktake.notes || "",
      });
    }
  }, [stocktake, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const url = stocktake
        ? `/api/stocktake/${stocktake.id}`
        : "/api/stocktake";
      const method = stocktake ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          takeDate: values.takeDate.toISOString(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }

      const savedStocktake = await res.json();
      onSuccess(savedStocktake);
    } catch (error) {
      console.error("Error saving stocktake:", error);
      form.setError("root", {
        message:
          error instanceof Error ? error.message : "Không thể lưu đợt kiểm kê",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {form.formState.errors.root && (
          <div className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên đợt kiểm kê *</FormLabel>
              <FormControl>
                <Input
                  placeholder="VD: Kiểm kê tháng 1/2026"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="areaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Khu vực kiểm kê *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stocktakeAreas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
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
          name="takeDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Ngày kiểm kê *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy", { locale: vi })
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
                    locale={vi}
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ghi chú thêm về đợt kiểm kê..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {stocktake ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
