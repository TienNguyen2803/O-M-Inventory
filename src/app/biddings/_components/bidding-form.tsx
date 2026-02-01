"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
  TableFooter,
} from "@/components/ui/table";
import { DialogFooter } from "@/components/ui/dialog";
import { CalendarIcon, Save, Check, Loader2 } from "lucide-react";
import type { BiddingPackage, BiddingParticipant, MasterDataItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { BiddingParticipantsSection } from "./bidding-participants-section";
import { BiddingWorkflowStepActions } from "./bidding-workflow-step-actions";

const formSchema = z.object({
  name: z.string().min(1, "Tên gói thầu là bắt buộc."),
  methodId: z.string().min(1, "Hình thức là bắt buộc."),
  createdById: z.string().min(1, "Người tạo là bắt buộc."),
  estimatedBudget: z.coerce.number().min(0, "Giá dự toán phải >= 0"),
  openDate: z.date({ required_error: "Ngày mở thầu là bắt buộc." }),
  closeDate: z.date({ required_error: "Ngày đóng thầu là bắt buộc." }),
  notes: z.string().optional(),
  purchaseRequestIds: z.array(z.string()).optional(),
  scopeItems: z.array(
    z.object({
      id: z.string().optional(),
      materialId: z.string().optional(),
      name: z.string(),
      unitId: z.string(),
      quantity: z.coerce.number(),
      estimatedAmount: z.coerce.number(),
    })
  ).optional(),
});

export type BiddingFormValues = z.infer<typeof formSchema>;

type BiddingFormProps = {
  biddingPackage: BiddingPackage | null;
  onSubmit: (values: BiddingFormValues) => void;
  onCancel: () => void;
  viewMode: boolean;
  onRefresh?: () => void;
};

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, name: "Mời thầu" },
    { id: 2, name: "Mở thầu" },
    { id: 3, name: "Chấm thầu" },
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
  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider border-b pb-2 my-4">
    {title}
  </h3>
);

export function BiddingForm({
  biddingPackage,
  onSubmit,
  onCancel,
  viewMode,
  onRefresh,
}: BiddingFormProps) {
  const [methods, setMethods] = useState<MasterDataItem[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; employeeCode: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(biddingPackage?.step || 1);
  const [participants, setParticipants] = useState<BiddingParticipant[]>(biddingPackage?.participants || []);
  const [winnerId, setWinnerId] = useState<string | undefined>(biddingPackage?.winnerId);
  const { toast } = useToast();

  // Fetch master data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [methodsRes, usersRes] = await Promise.all([
          fetch('/api/master-data/bidding-method'),
          fetch('/api/users?limit=100'),
        ]);

        if (methodsRes.ok) {
          const methodsData = await methodsRes.json();
          setMethods(methodsData.items || methodsData.data || []);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.data || usersData || []);
        }
      } catch (error) {
        console.error('Error fetching master data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const form = useForm<BiddingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: biddingPackage
      ? {
          name: biddingPackage.name,
          methodId: biddingPackage.methodId || '',
          createdById: biddingPackage.createdById || '',
          estimatedBudget: biddingPackage.estimatedBudget || biddingPackage.estimatedPrice || 0,
          openDate: biddingPackage.openDate ? new Date(biddingPackage.openDate) :
                   biddingPackage.openingDate ? new Date(biddingPackage.openingDate) : new Date(),
          closeDate: biddingPackage.closeDate ? new Date(biddingPackage.closeDate) :
                    biddingPackage.closingDate ? new Date(biddingPackage.closingDate) : new Date(),
          notes: biddingPackage.notes || '',
          purchaseRequestIds: biddingPackage.purchaseRequests?.map(pr => pr.id) || [],
          scopeItems: biddingPackage.scopeItems || biddingPackage.items || [],
        }
      : {
          name: "",
          methodId: "",
          createdById: "",
          estimatedBudget: 0,
          openDate: new Date(),
          closeDate: new Date(),
          notes: "",
          purchaseRequestIds: [],
          scopeItems: [],
        },
  });

  const scopeItems = form.watch("scopeItems") || [];
  const totalAmount = scopeItems.reduce((sum, item) => sum + (item.estimatedAmount || 0), 0);

  // Show winner info if package is complete
  const showResults = currentStep === 4 || !!winnerId;

  // Handle winner selection
  const handleSelectWinner = async (supplierId: string) => {
    if (!biddingPackage?.id) return;

    try {
      const res = await fetch(`/api/bidding-packages/${biddingPackage.id}/select-winner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId: supplierId }),
      });

      if (res.ok) {
        setWinnerId(supplierId);
        setCurrentStep(4);
        toast({
          title: "Thanh cong",
          description: "Da chon nha thau trung thau.",
        });
        if (onRefresh) onRefresh();
      } else {
        throw new Error("Failed to select winner");
      }
    } catch {
      toast({
        title: "Loi",
        description: "Khong the chon nha thau trung thau.",
        variant: "destructive",
      });
    }
  };

  // Handle step change
  const handleStepChange = (newStep: number, _newStatusCode: string) => {
    setCurrentStep(newStep);
    if (onRefresh) onRefresh();
  };

  // Handle participants change
  const handleParticipantsChange = (newParticipants: BiddingParticipant[]) => {
    setParticipants(newParticipants);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="max-h-[85vh] overflow-y-auto pr-2">
      {biddingPackage && <Stepper currentStep={currentStep} />}

      {/* Workflow Actions - show for existing packages in view mode */}
      {biddingPackage && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <BiddingWorkflowStepActions
            packageId={biddingPackage.id}
            currentStep={currentStep}
            hasParticipants={participants.length > 0}
            hasScores={participants.some(p => p.totalScore !== null && p.totalScore !== undefined)}
            winnerId={winnerId}
            viewMode={viewMode}
            onStepChange={handleStepChange}
          />
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 pt-2 pl-2"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Package Code - Read Only */}
            {biddingPackage && (
              <div className="col-span-1">
                <FormItem>
                  <FormLabel>Mã Gói</FormLabel>
                  <Input value={biddingPackage.id} disabled className="bg-muted" />
                </FormItem>
              </div>
            )}

            <div className={biddingPackage ? "col-span-1" : "col-span-2"}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên Gói thầu *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={viewMode} placeholder="Nhập tên gói thầu" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="methodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình thức *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Chọn hình thức" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {methods.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="createdById"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người tạo *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Chọn người tạo" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name} ({u.employeeCode})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá dự toán *</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={field.value?.toLocaleString('vi-VN') || ''}
                      disabled={viewMode}
                      className="font-semibold text-right"
                      onChange={(e) => {
                        const numValue = parseInt(e.target.value.replace(/[.,]/g, ''), 10);
                        field.onChange(isNaN(numValue) ? 0 : numValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="openDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày Mở thầu *</FormLabel>
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
              name="closeDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày Đóng thầu *</FormLabel>
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

            <div className="col-span-2">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={viewMode} placeholder="Nhập ghi chú (nếu có)" rows={2} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <FormSectionHeader title="Phạm vi cung cấp" />
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/5">HẠNG MỤC</TableHead>
                    <TableHead>ĐVT</TableHead>
                    <TableHead className="text-right">KHỐI LƯỢNG</TableHead>
                    <TableHead className="text-right">THÀNH TIỀN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scopeItems.length > 0 ? (
                    scopeItems.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{typeof item.unitId === 'object' ? (item.unitId as MasterDataItem).name : item.unitId}</TableCell>
                        <TableCell className="text-right">{item.quantity?.toLocaleString('vi-VN')}</TableCell>
                        <TableCell className="text-right">{item.estimatedAmount?.toLocaleString('vi-VN')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Chưa có hạng mục nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold">Tổng cộng</TableCell>
                    <TableCell className="text-right font-bold text-red-600">{totalAmount.toLocaleString('vi-VN')}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>

          {showResults && biddingPackage?.winner && (
            <div className="space-y-4 pt-2">
              <FormSectionHeader title="Ket qua lua chon" />
              <div className="bg-green-50/50 p-4 rounded-lg border border-green-200 grid grid-cols-2 gap-x-6 gap-y-4">
                <FormItem>
                  <FormLabel>Nha thau trung</FormLabel>
                  <Input value={biddingPackage.winner.name} disabled className="font-bold bg-white" />
                </FormItem>
                <FormItem>
                  <FormLabel>So nha thau tham gia</FormLabel>
                  <Input value={`${participants.length} nha thau`} disabled className="bg-white" />
                </FormItem>
              </div>
            </div>
          )}

          {/* Participants section - always show for existing packages */}
          {biddingPackage && (
            <div className="space-y-2 pt-2">
              <FormSectionHeader title="Nha thau tham gia" />
              <BiddingParticipantsSection
                packageId={biddingPackage.id}
                participants={participants}
                scopeItems={biddingPackage.scopeItems || biddingPackage.items || []}
                winnerId={winnerId}
                step={currentStep}
                viewMode={viewMode}
                onParticipantsChange={handleParticipantsChange}
                onSelectWinner={handleSelectWinner}
              />
            </div>
          )}

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
