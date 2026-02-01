"use client";

import { useState, useEffect } from "react";
import type { Stocktake, StocktakeAssignment, StocktakeResult, MasterDataItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Loader2,
  Play,
  ClipboardCheck,
  CheckCircle,
  Plus,
  Trash2,
  Save,
} from "lucide-react";

type User = { id: string; name: string; employeeCode?: string };
type Location = { id: string; code: string; name: string };

type StocktakeStepperProps = {
  stocktake: Stocktake;
  onUpdate: (stocktake: Stocktake) => void;
  onClose: () => void;
};

const STEPS = [
  { step: 1, label: "Nháp", code: "DRAFT" },
  { step: 2, label: "Kiểm đếm", code: "COUNTING" },
  { step: 3, label: "Đối soát", code: "RECONCILING" },
  { step: 4, label: "Hoàn thành", code: "COMPLETED" },
];

export function StocktakeStepper({
  stocktake,
  onUpdate,
  onClose,
}: StocktakeStepperProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [assignmentStatuses, setAssignmentStatuses] = useState<MasterDataItem[]>([]);
  const [newAssignment, setNewAssignment] = useState({ locationId: "", assigneeId: "" });
  const [editedResults, setEditedResults] = useState<Record<string, number>>({});

  const currentStep = stocktake.currentStep || 1;

  // Fetch users and locations for assignment
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, locationsRes, statusesRes] = await Promise.all([
          fetch("/api/users?limit=100"),
          fetch("/api/warehouse-locations?limit=100"),
          fetch("/api/master-data/stocktake-assignment-statuses"),
        ]);

        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.data || []);
        }
        if (locationsRes.ok) {
          const data = await locationsRes.json();
          setLocations(data.data || []);
        }
        if (statusesRes.ok) {
          const data = await statusesRes.json();
          setAssignmentStatuses(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Initialize edited results from stocktake results
  useEffect(() => {
    const initial: Record<string, number> = {};
    stocktake.results?.forEach((r) => {
      initial[r.id] = r.actualQuantity;
    });
    setEditedResults(initial);
  }, [stocktake.results]);

  const handleStartCounting = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/stocktake/${stocktake.id}/start`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to start counting");
      }
      const updated = await res.json();
      onUpdate(updated);
      toast({ title: "Thành công", description: "Đã bắt đầu kiểm đếm" });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể bắt đầu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconcile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/stocktake/${stocktake.id}/reconcile`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reconcile");
      }
      const updated = await res.json();
      onUpdate(updated);
      toast({ title: "Thành công", description: "Đã bắt đầu đối soát" });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể đối soát",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/stocktake/${stocktake.id}/complete`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to complete");
      }
      const updated = await res.json();
      onUpdate(updated);
      toast({
        title: "Thành công",
        description: "Đã hoàn thành kiểm kê và cập nhật tồn kho",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể hoàn thành",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAssignment = async () => {
    if (!newAssignment.locationId || !newAssignment.assigneeId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn vị trí và người phụ trách",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/stocktake/${stocktake.id}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAssignment),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add assignment");
      }
      // Refetch stocktake to get updated data
      const stocktakeRes = await fetch(`/api/stocktake/${stocktake.id}`);
      if (stocktakeRes.ok) {
        const updated = await stocktakeRes.json();
        onUpdate(updated);
      }
      setNewAssignment({ locationId: "", assigneeId: "" });
      toast({ title: "Thành công", description: "Đã thêm phân công" });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể thêm phân công",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/stocktake/${stocktake.id}/assignments/${assignId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete");
      }
      // Refetch stocktake
      const stocktakeRes = await fetch(`/api/stocktake/${stocktake.id}`);
      if (stocktakeRes.ok) {
        const updated = await stocktakeRes.json();
        onUpdate(updated);
      }
      toast({ title: "Thành công", description: "Đã xóa phân công" });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResults = async () => {
    setIsLoading(true);
    try {
      const results = Object.entries(editedResults).map(([id, actualQuantity]) => {
        const original = stocktake.results?.find((r) => r.id === id);
        return {
          id,
          actualQuantity,
          updatedAt: original?.updatedAt,
        };
      });

      const res = await fetch(`/api/stocktake/${stocktake.id}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results }),
      });

      if (!res.ok) {
        const error = await res.json();
        if (error.code === "CONFLICT") {
          throw new Error("Dữ liệu đã được cập nhật bởi người khác. Vui lòng tải lại trang.");
        }
        throw new Error(error.error || "Failed to save results");
      }

      // Refetch stocktake
      const stocktakeRes = await fetch(`/api/stocktake/${stocktake.id}`);
      if (stocktakeRes.ok) {
        const updated = await stocktakeRes.json();
        onUpdate(updated);
      }
      toast({ title: "Thành công", description: "Đã lưu kết quả kiểm đếm" });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể lưu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAssignmentComplete = async (assignment: StocktakeAssignment) => {
    const completedStatus = assignmentStatuses.find((s) => s.code === "COMPLETED");
    if (!completedStatus) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/stocktake/${stocktake.id}/assignments/${assignment.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locationId: assignment.locationId,
            assigneeId: assignment.assigneeId,
            statusId: completedStatus.id,
          }),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update");
      }
      // Refetch stocktake
      const stocktakeRes = await fetch(`/api/stocktake/${stocktake.id}`);
      if (stocktakeRes.ok) {
        const updated = await stocktakeRes.json();
        onUpdate(updated);
      }
      toast({ title: "Thành công", description: "Đã đánh dấu hoàn thành" });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter available locations (not already assigned)
  const assignedLocationIds = stocktake.assignments?.map((a) => a.locationId) || [];
  const availableLocations = locations.filter(
    (l) => !assignedLocationIds.includes(l.id)
  );

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-center">
        {STEPS.map((step, idx) => (
          <div key={step.step} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold",
                currentStep >= step.step
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-muted-foreground/30"
              )}
            >
              {step.step}
            </div>
            <span
              className={cn(
                "ml-2 text-sm font-medium",
                currentStep >= step.step
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-16 h-1 mx-4",
                  currentStep > step.step ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin đợt kiểm kê</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Mã:</span>{" "}
              <span className="font-medium">{stocktake.takeCode}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tên:</span>{" "}
              <span className="font-medium">{stocktake.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Khu vực:</span>{" "}
              <span className="font-medium">{stocktake.area?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Ngày:</span>{" "}
              <span className="font-medium">
                {format(new Date(stocktake.takeDate), "dd/MM/yyyy")}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Trạng thái:</span>{" "}
              <Badge className={cn("ml-1", stocktake.status?.color)}>
                {stocktake.status?.name}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Chênh lệch:</span>{" "}
              <span
                className={cn(
                  "font-medium",
                  (stocktake.totalVariance || 0) < 0
                    ? "text-destructive"
                    : (stocktake.totalVariance || 0) > 0
                    ? "text-green-600"
                    : ""
                )}
              >
                {stocktake.totalVariance || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Assignments (DRAFT) */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Phân công vị trí kiểm kê</span>
              <Button onClick={handleStartCounting} disabled={isLoading || (stocktake.assignments?.length || 0) === 0}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Bắt đầu kiểm đếm
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add assignment form */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium">Vị trí</label>
                <Select
                  value={newAssignment.locationId}
                  onValueChange={(v) =>
                    setNewAssignment((prev) => ({ ...prev, locationId: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.code} - {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Người phụ trách</label>
                <Select
                  value={newAssignment.assigneeId}
                  onValueChange={(v) =>
                    setNewAssignment((prev) => ({ ...prev, assigneeId: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn người phụ trách" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.employeeCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddAssignment} disabled={isLoading}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Assignments table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Người phụ trách</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocktake.assignments?.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      {assignment.location?.code} - {assignment.location?.name}
                    </TableCell>
                    <TableCell>{assignment.assignee?.name}</TableCell>
                    <TableCell>
                      <Badge className={assignment.status?.color || undefined}>
                        {assignment.status?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!stocktake.assignments || stocktake.assignments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Chưa có phân công nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Counting */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Nhập kết quả kiểm đếm</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveResults} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Lưu kết quả
                </Button>
                <Button
                  onClick={handleReconcile}
                  disabled={
                    isLoading ||
                    stocktake.assignments?.some((a) => a.status?.code !== "COMPLETED")
                  }
                >
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Chuyển sang Đối soát
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Assignments status */}
            <div className="flex gap-4 flex-wrap">
              {stocktake.assignments?.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center gap-2 p-2 border rounded-lg"
                >
                  <span className="font-medium">{assignment.location?.code}</span>
                  <Badge className={assignment.status?.color || undefined}>
                    {assignment.status?.name}
                  </Badge>
                  {assignment.status?.code !== "COMPLETED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAssignmentComplete(assignment)}
                      disabled={isLoading}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Xong
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Results table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Vật tư</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead className="text-right">Sổ sách</TableHead>
                  <TableHead className="text-right">Thực tế</TableHead>
                  <TableHead className="text-right">Chênh lệch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocktake.results?.map((result) => {
                  const actualQty = editedResults[result.id] ?? result.actualQuantity;
                  const variance = actualQty - result.bookQuantity;
                  return (
                    <TableRow key={result.id}>
                      <TableCell>{result.location?.code}</TableCell>
                      <TableCell>
                        {result.material?.code} - {result.material?.name}
                      </TableCell>
                      <TableCell>{result.unit?.name}</TableCell>
                      <TableCell className="text-right">{result.bookQuantity}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={actualQty}
                          onChange={(e) =>
                            setEditedResults((prev) => ({
                              ...prev,
                              [result.id]: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-24 text-right"
                        />
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          variance < 0
                            ? "text-destructive"
                            : variance > 0
                            ? "text-green-600"
                            : ""
                        )}
                      >
                        {variance}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!stocktake.results || stocktake.results.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Không có dữ liệu kiểm đếm
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Reconciling */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Đối soát kết quả</span>
              <Button onClick={handleComplete} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Hoàn thành & Cập nhật tồn kho
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Vật tư</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead className="text-right">Sổ sách</TableHead>
                  <TableHead className="text-right">Thực tế</TableHead>
                  <TableHead className="text-right">Chênh lệch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocktake.results?.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.location?.code}</TableCell>
                    <TableCell>
                      {result.material?.code} - {result.material?.name}
                    </TableCell>
                    <TableCell>{result.unit?.name}</TableCell>
                    <TableCell className="text-right">{result.bookQuantity}</TableCell>
                    <TableCell className="text-right">{result.actualQuantity}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        result.variance < 0
                          ? "text-destructive"
                          : result.variance > 0
                          ? "text-green-600"
                          : ""
                      )}
                    >
                      {result.variance}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Completed */}
      {currentStep >= 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Đã hoàn thành kiểm kê
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Đợt kiểm kê đã hoàn thành vào{" "}
              {stocktake.completedAt &&
                format(new Date(stocktake.completedAt), "dd/MM/yyyy HH:mm")}
              . Tồn kho đã được cập nhật theo kết quả kiểm đếm.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Vật tư</TableHead>
                  <TableHead className="text-right">Sổ sách</TableHead>
                  <TableHead className="text-right">Thực tế</TableHead>
                  <TableHead className="text-right">Điều chỉnh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocktake.results
                  ?.filter((r) => r.variance !== 0)
                  .map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.location?.code}</TableCell>
                      <TableCell>{result.material?.name}</TableCell>
                      <TableCell className="text-right">{result.bookQuantity}</TableCell>
                      <TableCell className="text-right">{result.actualQuantity}</TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          result.variance < 0 ? "text-destructive" : "text-green-600"
                        )}
                      >
                        {result.variance > 0 ? "+" : ""}
                        {result.variance}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Close button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </div>
  );
}
