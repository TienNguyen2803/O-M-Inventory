"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Trophy, CheckCircle2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

type BiddingWorkflowStepActionsProps = {
  packageId: string;
  currentStep: number;
  hasParticipants: boolean;
  hasScores: boolean;
  winnerId?: string;
  viewMode: boolean;
  onStepChange: (newStep: number, newStatusCode: string) => void;
};

// Step status mapping: 1=INVITE, 2=OPEN, 3=EVAL, 4=DONE
const STEP_STATUS_MAP: Record<number, { code: string; name: string; action: string }> = {
  1: { code: "INVITE", name: "Mời thầu", action: "Chuyển sang Mở thầu" },
  2: { code: "OPEN", name: "Mở thầu", action: "Chuyển sang Chấm thầu" },
  3: { code: "EVAL", name: "Chấm thầu", action: "Chọn nhà thầu trúng" },
  4: { code: "DONE", name: "Hoàn thành", action: "" },
};

export function BiddingWorkflowStepActions({
  packageId,
  currentStep,
  hasParticipants,
  hasScores,
  winnerId,
  viewMode,
  onStepChange,
}: BiddingWorkflowStepActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAdvanceStep = async () => {
    if (currentStep >= 4) return;

    const nextStep = currentStep + 1;
    const nextStatus = STEP_STATUS_MAP[nextStep];

    setIsLoading(true);
    try {
      // Fetch status ID by code
      console.log('Fetching bidding statuses...');
      const statusRes = await fetch(`/api/master-data/bidding-status`);
      const statusData = await statusRes.json();
      console.log('Status response:', { ok: statusRes.ok, data: statusData });
      
      if (!statusRes.ok) throw new Error("Failed to fetch statuses");

      // API returns { tableId, tableName, group, items: [...] }
      const statuses = statusData.items || statusData.data || [];
      if (!Array.isArray(statuses)) {
        console.error('Invalid statuses format:', statusData);
        throw new Error("Invalid status data format");
      }
      const targetStatus = statuses.find((s: { code: string }) => s.code === nextStatus.code);
      console.log('Looking for status code:', nextStatus.code, 'Found:', targetStatus);

      if (!targetStatus) {
        throw new Error(`Status ${nextStatus.code} not found in database`);
      }

      // Update package step and status
      console.log('Updating package:', { packageId, nextStep, statusId: targetStatus.id });
      const updateRes = await fetch(`/api/bidding-packages/${packageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: nextStep,
          statusId: targetStatus.id,
        }),
      });

      const updateData = await updateRes.json();
      console.log('Update response:', { ok: updateRes.ok, data: updateData });

      if (!updateRes.ok) {
        const errorMsg = updateData.error || updateData.message || 'Failed to update step';
        throw new Error(errorMsg);
      }

      onStepChange(nextStep, nextStatus.code);
      toast({
        title: "Thành công",
        description: `Đã chuyển sang bước ${nextStep}: ${nextStatus.name}`,
      });
    } catch (error) {
      console.error("Failed to advance step:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể chuyển bước. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Conditions for advancing
  const canAdvanceToStep2 = currentStep === 1 && hasParticipants;
  const canAdvanceToStep3 = currentStep === 2;
  const isCompleted = currentStep === 4 || !!winnerId;

  if (viewMode || isCompleted) {
    if (isCompleted) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Gói thầu đã hoàn thành</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {/* Step 1 -> Step 2: Advance to Mo thau */}
      {currentStep === 1 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={!canAdvanceToStep2 || isLoading} variant="default">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              Chuyển sang Mở thầu
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận chuyển bước</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn chuyển gói thầu sang giai đoạn &quot;Mở thầu&quot;?
                Sau khi mở thầu, các nhà thầu sẽ không thể được thêm hoặc xóa.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleAdvanceStep}>Xác nhận</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Step 2 -> Step 3: Advance to Cham thau */}
      {currentStep === 2 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={!canAdvanceToStep3 || isLoading} variant="default">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              Chuyển sang Chấm thầu
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận chuyển bước</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn chuyển gói thầu sang giai đoạn &quot;Chấm thầu&quot;?
                Trong giai đoạn này, bạn sẽ chấm điểm và lựa chọn nhà thầu trúng thầu.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleAdvanceStep}>Xác nhận</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Step 3: Show scoring info */}
      {currentStep === 3 && !winnerId && (
        <div className="flex items-center gap-2 text-orange-600">
          <Trophy className="h-5 w-5" />
          <span className="text-sm">
            {hasScores
              ? "Sẵn sàng chọn nhà thầu trúng thầu"
              : "Vui lòng chấm điểm cho các nhà thầu trước khi chọn"}
          </span>
        </div>
      )}

      {/* Validation messages */}
      {currentStep === 1 && !hasParticipants && (
        <span className="text-sm text-muted-foreground">
          Cần mời ít nhất 1 nhà thầu để chuyển bước
        </span>
      )}
    </div>
  );
}
