"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BiddingScopeItem, BidQuotation, BiddingParticipant } from "@/lib/types";

type QuotationEntry = {
  scopeItemId: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  notes?: string;
};

type BiddingQuotationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string;
  participant: BiddingParticipant;
  scopeItems: BiddingScopeItem[];
  existingQuotations: BidQuotation[];
  viewOnly?: boolean;
  onQuotationsSaved: () => void;
};

export function BiddingQuotationDialog({
  open,
  onOpenChange,
  packageId,
  participant,
  scopeItems,
  existingQuotations,
  viewOnly = false,
  onQuotationsSaved,
}: BiddingQuotationDialogProps) {
  const [quotations, setQuotations] = useState<QuotationEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Initialize quotations from existing or create empty entries
  useEffect(() => {
    if (open) {
      const entries = scopeItems.map((item) => {
        const existing = existingQuotations.find(
          (q) => q.scopeItemId === item.id
        );
        return {
          scopeItemId: item.id,
          unitPrice: existing?.unitPrice || 0,
          quantity: existing?.quantity || item.quantity,
          totalPrice: existing?.totalPrice || 0,
          notes: existing?.notes,
        };
      });
      setQuotations(entries);
    }
  }, [open, scopeItems, existingQuotations]);

  const handlePriceChange = (scopeItemId: string, unitPrice: number) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.scopeItemId === scopeItemId) {
          return {
            ...q,
            unitPrice,
            totalPrice: unitPrice * q.quantity,
          };
        }
        return q;
      })
    );
  };

  const handleQuantityChange = (scopeItemId: string, quantity: number) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.scopeItemId === scopeItemId) {
          return {
            ...q,
            quantity,
            totalPrice: q.unitPrice * quantity,
          };
        }
        return q;
      })
    );
  };

  const totalAmount = quotations.reduce((sum, q) => sum + q.totalPrice, 0);

  const handleSave = async () => {
    const validQuotations = quotations.filter((q) => q.unitPrice > 0);
    if (validQuotations.length === 0) {
      toast({
        title: "Loi",
        description: "Vui long nhap gia cho it nhat 1 hang muc.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/bidding-packages/${packageId}/participants`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: participant.id,
          isSubmitted: true,
          quotations: validQuotations.map((q) => ({
            scopeItemId: q.scopeItemId,
            unitPrice: q.unitPrice,
            quantity: q.quantity,
          })),
        }),
      });

      if (res.ok) {
        toast({
          title: "Thanh cong",
          description: "Da luu bao gia thanh cong.",
        });
        onQuotationsSaved();
        onOpenChange(false);
      } else {
        throw new Error("Failed to save quotations");
      }
    } catch {
      toast({
        title: "Loi",
        description: "Khong the luu bao gia.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getScopeItem = (scopeItemId: string) =>
    scopeItems.find((s) => s.id === scopeItemId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {viewOnly ? "Xem bao gia" : "Nhap bao gia"} - {participant.supplier?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/5">HANG MUC</TableHead>
                <TableHead className="text-center w-[80px]">DVT</TableHead>
                <TableHead className="text-right w-[100px]">KHOI LUONG</TableHead>
                <TableHead className="text-right w-[140px]">DON GIA</TableHead>
                <TableHead className="text-right w-[140px]">THANH TIEN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((q) => {
                const scopeItem = getScopeItem(q.scopeItemId);
                if (!scopeItem) return null;

                return (
                  <TableRow key={q.scopeItemId}>
                    <TableCell className="font-medium">
                      {scopeItem.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {typeof scopeItem.unit === "object"
                        ? scopeItem.unit?.name
                        : scopeItem.unitId}
                    </TableCell>
                    <TableCell className="text-right">
                      {viewOnly ? (
                        q.quantity.toLocaleString("vi-VN")
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={q.quantity || ""}
                          onChange={(e) =>
                            handleQuantityChange(
                              q.scopeItemId,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-8 w-24 text-right ml-auto"
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {viewOnly ? (
                        q.unitPrice.toLocaleString("vi-VN")
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={q.unitPrice || ""}
                          onChange={(e) =>
                            handlePriceChange(
                              q.scopeItemId,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-8 w-32 text-right ml-auto"
                          placeholder="Nhap don gia"
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {q.totalPrice.toLocaleString("vi-VN")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">
                  Tong gia du thau
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {totalAmount.toLocaleString("vi-VN")}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Dong
          </Button>
          {!viewOnly && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Luu bao gia
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
