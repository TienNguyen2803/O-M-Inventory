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
  1: { code: "INVITE", name: "Moi thau", action: "Chuyen sang Mo thau" },
  2: { code: "OPEN", name: "Mo thau", action: "Chuyen sang Cham thau" },
  3: { code: "EVAL", name: "Cham thau", action: "Chon nha thau trung" },
  4: { code: "DONE", name: "Hoan thanh", action: "" },
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
      const statusRes = await fetch(`/api/master-data/bidding-status`);
      if (!statusRes.ok) throw new Error("Failed to fetch statuses");

      const statusData = await statusRes.json();
      const statuses = statusData.data || statusData || [];
      const targetStatus = statuses.find((s: { code: string }) => s.code === nextStatus.code);

      if (!targetStatus) {
        throw new Error(`Status ${nextStatus.code} not found`);
      }

      // Update package step and status
      const updateRes = await fetch(`/api/bidding-packages/${packageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: nextStep,
          statusId: targetStatus.id,
        }),
      });

      if (!updateRes.ok) throw new Error("Failed to update step");

      onStepChange(nextStep, nextStatus.code);
      toast({
        title: "Thanh cong",
        description: `Da chuyen sang buoc ${nextStep}: ${nextStatus.name}`,
      });
    } catch (error) {
      console.error("Failed to advance step:", error);
      toast({
        title: "Loi",
        description: "Khong the chuyen buoc. Vui long thu lai.",
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
          <span className="font-medium">Goi thau da hoan thanh</span>
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
              Chuyen sang Mo thau
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xac nhan chuyen buoc</AlertDialogTitle>
              <AlertDialogDescription>
                Ban co chac chan muon chuyen goi thau sang giai doan &quot;Mo thau&quot;?
                Sau khi mo thau, cac nha thau se khong the duoc them hoac xoa.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huy</AlertDialogCancel>
              <AlertDialogAction onClick={handleAdvanceStep}>Xac nhan</AlertDialogAction>
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
              Chuyen sang Cham thau
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xac nhan chuyen buoc</AlertDialogTitle>
              <AlertDialogDescription>
                Ban co chac chan muon chuyen goi thau sang giai doan &quot;Cham thau&quot;?
                Trong giai doan nay, ban se cham diem va lua chon nha thau trung thau.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huy</AlertDialogCancel>
              <AlertDialogAction onClick={handleAdvanceStep}>Xac nhan</AlertDialogAction>
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
              ? "San sang chon nha thau trung thau"
              : "Vui long cham diem cho cac nha thau truoc khi chon"}
          </span>
        </div>
      )}

      {/* Validation messages */}
      {currentStep === 1 && !hasParticipants && (
        <span className="text-sm text-muted-foreground">
          Can moi it nhat 1 nha thau de chuyen buoc
        </span>
      )}
    </div>
  );
}
