"use client";

import { useState, useCallback } from "react";
import type { Material, WarehouseLocation } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Save, MapPin, XCircle, Truck, ScanLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Vận hành Kho</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Xuất khẩn cấp</span>
  </div>
);

type QuickIssueLog = {
  id: string;
  materialName: string;
  materialCode: string;
  fromLocation: string;
  quantity: number;
  reason: string;
  timestamp: Date;
};

export function QuickIssueClient({ materials, locations }: { materials: Material[], locations: WarehouseLocation[] }) {
  const [itemScanInput, setItemScanInput] = useState("");
  const [locationScanInput, setLocationScanInput] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [foundMaterial, setFoundMaterial] = useState<Material | null>(null);
  const [issueLog, setIssueLog] = useState<QuickIssueLog[]>([]);

  const { toast } = useToast();

  const handleFindItem = useCallback(() => {
    if (!itemScanInput) return;
    setIsLoading(true);
    setFoundMaterial(null);
    setTimeout(() => {
      const material = materials.find(m => 
        m.code.toLowerCase() === itemScanInput.toLowerCase() || 
        m.partNo.toLowerCase() === itemScanInput.toLowerCase() ||
        m.serialNumber?.toLowerCase() === itemScanInput.toLowerCase()
      );
      if (material) {
        setFoundMaterial(material);
        setQuantity(material.managementType === 'Serial' ? 1 : 1);
        toast({ title: "Thành công", description: `Đã tìm thấy vật tư: ${material.name}` });
      } else {
        toast({ variant: "destructive", title: "Không tìm thấy", description: `Không có vật tư nào khớp với mã "${itemScanInput}".` });
      }
      setIsLoading(false);
    }, 500);
  }, [itemScanInput, materials, toast]);

  const handleConfirmIssue = () => {
    if (!foundMaterial) return;
    if (!locationScanInput.trim()) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng quét hoặc nhập vị trí lấy hàng." });
      return;
    }
    const locationExists = locations.some(l => l.code.toLowerCase() === locationScanInput.toLowerCase().trim());
    if (!locationExists) {
      toast({ variant: "destructive", title: "Vị trí không hợp lệ", description: `Không tìm thấy vị trí kho với mã "${locationScanInput}".` });
      return;
    }
    if (quantity <= 0) {
      toast({ variant: "destructive", title: "Lỗi", description: "Số lượng phải lớn hơn 0." });
      return;
    }
    if (!reason.trim()) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập lý do xuất khẩn cấp." });
      return;
    }

    const newLogEntry: QuickIssueLog = {
      id: `log-${Date.now()}`,
      materialName: foundMaterial.name,
      materialCode: foundMaterial.code,
      fromLocation: locationScanInput.trim().toUpperCase(),
      quantity: quantity,
      reason: reason,
      timestamp: new Date(),
    };

    setIssueLog([newLogEntry, ...issueLog]);
    toast({ title: "Thành công!", description: `Đã xuất ${quantity} ${foundMaterial.unit} ${foundMaterial.name} từ vị trí ${newLogEntry.fromLocation}.` });

    // Reset for next scan
    setFoundMaterial(null);
    setItemScanInput("");
    setLocationScanInput("");
    setQuantity(1);
    setReason("");
  };
  
  const handleCancel = () => {
      setFoundMaterial(null);
      setItemScanInput("");
      setLocationScanInput("");
      setQuantity(1);
      setReason("");
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <PageHeader
        title="Xuất hàng Khẩn cấp"
        description="Quy trình xuất kho nhanh cho các tình huống đột xuất, không có phiếu yêu cầu trước."
        breadcrumbs={<Breadcrumbs />}
      />

      <Card>
        <CardContent className="pt-6">
          {!foundMaterial ? (
            <div className="space-y-4">
              <h3 className="font-semibold">Bước 1: Quét mã vật tư</h3>
              <div className="flex w-full items-center space-x-2">
                <div className="relative flex-grow">
                    <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Quét hoặc nhập Part Number, Serial, Mã VT..."
                        value={itemScanInput}
                        onChange={(e) => setItemScanInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFindItem()}
                        className="pl-10"
                    />
                </div>
                <Button onClick={handleFindItem} disabled={isLoading || !itemScanInput}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Tìm vật tư
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-lg text-primary">{foundMaterial.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {foundMaterial.code} | Tồn kho: {foundMaterial.stock} {foundMaterial.unit}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel}>
                        <XCircle className="h-5 w-5 text-red-500" />
                    </Button>
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-sm font-medium">Bước 2: Quét vị trí lấy hàng</label>
                      <div className="relative">
                        <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Quét hoặc nhập mã vị trí (bin code)..."
                            value={locationScanInput}
                            onChange={(e) => setLocationScanInput(e.target.value)}
                            className="pl-10"
                        />
                      </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium">Bước 3: Nhập số lượng</label>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        disabled={foundMaterial.managementType === 'Serial'}
                        min="1"
                      />
                      {foundMaterial.managementType === 'Serial' && <p className="text-xs text-muted-foreground">Vật tư quản lý theo Serial, số lượng là 1.</p>}
                  </div>
                   <div className="md:col-span-2 space-y-2">
                     <label className="text-sm font-medium">Bước 4: Nhập lý do</label>
                      <Textarea
                        placeholder="Vd: Thay thế khẩn cấp cho tổ máy GT11..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                  </div>
              </div>

               <div className="pt-4 flex justify-end">
                    <Button onClick={handleConfirmIssue} size="lg">
                        <Truck className="mr-2 h-5 w-5" /> Xác nhận Xuất hàng
                    </Button>
               </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Lịch sử xuất khẩn cấp gần đây</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Vật tư</TableHead>
                        <TableHead>Từ vị trí</TableHead>
                        <TableHead>Lý do</TableHead>
                        <TableHead className="text-right">Số lượng</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {issueLog.length > 0 ? issueLog.slice(0, 10).map(log => (
                        <TableRow key={log.id}>
                            <TableCell className="text-xs text-muted-foreground">{format(log.timestamp, "dd/MM/yy HH:mm:ss")}</TableCell>
                            <TableCell>
                                <div className="font-medium">{log.materialName}</div>
                                <div className="text-xs text-muted-foreground">{log.materialCode}</div>
                            </TableCell>
                            <TableCell className="font-semibold text-primary">{log.fromLocation}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{log.reason}</TableCell>
                            <TableCell className="text-right font-bold">{log.quantity}</TableCell>
                        </TableRow>
                    )) : (
                         <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                Chưa có hoạt động nào.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
