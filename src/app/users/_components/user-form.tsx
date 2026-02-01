
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, Loader2 } from "lucide-react";

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
import type { User } from "@/lib/types";
import { DialogFooter } from "@/components/ui/dialog";
import { useDepartments } from "@/hooks/use-users";
import { useMasterDataItems } from "@/hooks/use-master-data";

const formSchema = z.object({
  employeeCode: z.string().min(1, "Mã nhân viên là bắt buộc."),
  name: z.string().min(1, "Họ tên là bắt buộc."),
  email: z.string().email("Email không hợp lệ."),
  phone: z.string().optional(),
  departmentId: z.string().min(1, "Phòng ban là bắt buộc."),
  statusId: z.string().min(1, "Trạng thái là bắt buộc."),
});

export type UserFormValues = z.infer<typeof formSchema>;

type UserFormProps = {
  user: User | null;
  roles: { id: string; name: string }[];
  onSubmit: (values: UserFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
  isSubmitting?: boolean;
};


export function UserForm({
  user,
  roles,
  onSubmit,
  onCancel,
  viewMode,
  isSubmitting = false,
}: UserFormProps) {
  const { departments } = useDepartments();
  const { items: userStatuses } = useMasterDataItems('user-status');
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: user
      ? { 
          employeeCode: user.employeeCode || "",
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          departmentId: user.departmentId || "",
          statusId: user.statusId || "",
        }
      : {
          employeeCode: "",
          name: "",
          email: "",
          phone: "",
          departmentId: "",
          statusId: "",
        },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto pr-4"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <FormField
              control={form.control}
              name="employeeCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã nhân viên</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={viewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={viewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={viewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={viewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phòng ban</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={viewMode}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng ban" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map(dept => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={viewMode}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {userStatuses.map(status => <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <DialogFooter className="!justify-end items-center pt-6 sticky bottom-0 bg-background py-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          {!viewMode && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          )}
        </DialogFooter>
      </form>
    </Form>
  );
}
