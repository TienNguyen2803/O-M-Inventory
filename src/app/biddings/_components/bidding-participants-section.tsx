"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2, Trophy, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BiddingParticipant, BiddingScopeItem } from "@/lib/types";
import { BiddingQuotationDialog } from "./bidding-quotation-dialog";

type Supplier = {
  id: string;
  code: string;
  name: string;
};

type BiddingParticipantsSectionProps = {
  packageId: string;
  participants: BiddingParticipant[];
  scopeItems: BiddingScopeItem[];
  winnerId?: string;
  step: number;
  viewMode: boolean;
  onParticipantsChange: (participants: BiddingParticipant[]) => void;
  onSelectWinner?: (supplierId: string) => void;
};

export function BiddingParticipantsSection({
  packageId,
  participants,
  scopeItems,
  winnerId,
  step,
  viewMode,
  onParticipantsChange,
  onSelectWinner,
}: BiddingParticipantsSectionProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [editingScores, setEditingScores] = useState<Record<string, { tech: string; price: string }>>({});
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<BiddingParticipant | null>(null);
  const { toast } = useToast();

  // Fetch suppliers for selection
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch("/api/suppliers");
        if (res.ok) {
          const data = await res.json();
          setSuppliers(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);

  // Filter out already added suppliers
  const availableSuppliers = suppliers.filter(
    (s) => !participants.some((p) => p.supplier?.id === s.id)
  );

  const handleAddParticipant = async () => {
    if (!selectedSupplierId) return;

    setIsAddingParticipant(true);
    try {
      console.log('Adding participant:', { packageId, selectedSupplierId });
      const res = await fetch(`/api/bidding-packages/${packageId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierIds: [selectedSupplierId] }),
      });

      const json = await res.json();
      console.log('Add participant response:', { status: res.status, json });

      if (res.ok) {
        onParticipantsChange(json.data || []);
        setSelectedSupplierId("");
        toast({
          title: "Thành công",
          description: "Đã thêm nhà thầu tham gia.",
        });
      } else {
        const errorMsg = json.error || json.message || 'Failed to add participant';
        console.error('Add participant error:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Add participant exception:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể thêm nhà thầu.",
        variant: "destructive",
      });
    } finally {
      setIsAddingParticipant(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/bidding-packages/${packageId}/participants?participantId=${participantId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        const updated = participants.filter((p) => p.id !== participantId);
        onParticipantsChange(updated);
        toast({
          title: "Thành công",
          description: "Đã xóa nhà thầu khỏi danh sách.",
        });
      } else {
        throw new Error("Failed to remove participant");
      }
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể xóa nhà thầu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (participantId: string, field: "tech" | "price", value: string) => {
    setEditingScores((prev) => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [field]: value,
      },
    }));
  };

  const handleSaveScore = async (participantId: string) => {
    const scores = editingScores[participantId];
    if (!scores) return;

    const techScore = scores.tech ? parseFloat(scores.tech) : undefined;
    const priceScore = scores.price ? parseFloat(scores.price) : undefined;

    if (techScore === undefined && priceScore === undefined) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/bidding-packages/${packageId}/participants`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          technicalScore: techScore,
          priceScore: priceScore,
        }),
      });

      if (res.ok) {
        // Refresh participants list
        const listRes = await fetch(`/api/bidding-packages/${packageId}/participants`);
        if (listRes.ok) {
          const json = await listRes.json();
          onParticipantsChange(json.data || []);
        }
        setEditingScores((prev) => {
          const updated = { ...prev };
          delete updated[participantId];
          return updated;
        });
        toast({
          title: "Thành công",
          description: "Đã cập nhật điểm.",
        });
      } else {
        throw new Error("Failed to update score");
      }
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật điểm.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectWinner = (supplierId: string) => {
    if (onSelectWinner) {
      onSelectWinner(supplierId);
    }
  };

  const handleOpenQuotations = (participant: BiddingParticipant) => {
    setSelectedParticipant(participant);
    setQuotationDialogOpen(true);
  };

  const handleQuotationsSaved = async () => {
    // Refresh participants list
    const listRes = await fetch(`/api/bidding-packages/${packageId}/participants`);
    if (listRes.ok) {
      const json = await listRes.json();
      onParticipantsChange(json.data || []);
    }
  };

  const canAddParticipants = !viewMode && step <= 2;
  const canEditScores = !viewMode && step === 3;
  const canSelectWinner = !viewMode && step === 3 && !winnerId;

  return (
    <div className="space-y-4">
      {/* Add participant form */}
      {canAddParticipants && availableSuppliers.length > 0 && (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Mời nhà thầu</label>
            <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhà thầu..." />
              </SelectTrigger>
              <SelectContent>
                {availableSuppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAddParticipant}
            disabled={!selectedSupplierId || isAddingParticipant}
          >
            {isAddingParticipant ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Thêm
          </Button>
        </div>
      )}

      {/* Participants table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NHÀ THẦU</TableHead>
              <TableHead className="text-center w-[80px]">BÁO GIÁ</TableHead>
              <TableHead className="text-center w-[100px]">ĐIỂM KT</TableHead>
              <TableHead className="text-center w-[100px]">ĐIỂM GIÁ</TableHead>
              <TableHead className="text-center w-[100px]">TỔNG ĐIỂM</TableHead>
              <TableHead className="text-center w-[80px]">XẾP HẠNG</TableHead>
              <TableHead className="w-[120px]">THAO TÁC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.length > 0 ? (
              participants.map((p) => {
                const isWinner = p.supplier?.id === winnerId;
                const editScore = editingScores[p.id] || {
                  tech: p.technicalScore?.toString() || "",
                  price: p.priceScore?.toString() || "",
                };

                return (
                  <TableRow key={p.id} className={isWinner ? "bg-green-50" : ""}>
                    <TableCell className="font-medium">
                      {p.supplier?.name}
                      {isWinner && (
                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> Trúng thầu
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant={p.isSubmitted ? "outline" : "ghost"}
                        size="sm"
                        onClick={() => handleOpenQuotations(p)}
                        disabled={scopeItems.length === 0}
                        className={p.isSubmitted ? "text-green-600 border-green-600" : ""}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      {canEditScores ? (
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={editScore.tech}
                          onChange={(e) => handleScoreChange(p.id, "tech", e.target.value)}
                          className="h-8 w-20 text-center mx-auto"
                        />
                      ) : (
                        p.technicalScore ?? "-"
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {canEditScores ? (
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={editScore.price}
                          onChange={(e) => handleScoreChange(p.id, "price", e.target.value)}
                          className="h-8 w-20 text-center mx-auto"
                        />
                      ) : (
                        p.priceScore ?? "-"
                      )}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {p.totalScore?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {p.rank ?? "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {canEditScores && editingScores[p.id] && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveScore(p.id)}
                            disabled={isLoading}
                          >
                            Lưu
                          </Button>
                        )}
                        {canSelectWinner && p.totalScore !== null && p.totalScore !== undefined && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleSelectWinner(p.supplier?.id || "")}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Trophy className="h-3 w-3 mr-1" />
                            Chọn
                          </Button>
                        )}
                        {canAddParticipants && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive/80 hover:text-destructive"
                            onClick={() => handleRemoveParticipant(p.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Chưa có nhà thầu nào được mời
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Quotation Dialog */}
      {selectedParticipant && (
        <BiddingQuotationDialog
          open={quotationDialogOpen}
          onOpenChange={setQuotationDialogOpen}
          packageId={packageId}
          participant={selectedParticipant}
          scopeItems={scopeItems}
          existingQuotations={selectedParticipant.quotations || []}
          viewOnly={viewMode || step >= 3}
          onQuotationsSaved={handleQuotationsSaved}
        />
      )}
    </div>
  );
}
