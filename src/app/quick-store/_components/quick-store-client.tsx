"use client";

import { useState, useCallback, useMemo } from "react";
import type { Material, WarehouseLocation, InboundReceipt } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, QrCode, Save, MapPin, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WarehouseMap } from "./warehouse-map";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Vận hành Kho</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Cất hàng nhanh (Scan)</span>
  </div>
);

type QuickStoreClientProps = {
  materials: Material[];
  locations: WarehouseLocation[];
  initialReceipts: InboundReceipt[];
};

type StoreLog = {
  id: string;
  materialName: string;
  materialCode: string;
  location: string;
  quantity: number;
  timestamp: Date;
};

export function QuickStoreClient({ materials, locations, initialReceipts }: QuickStoreClientProps) {
  const [itemScanInput, setItemScanInput] = useState("");
  const [locationScanInput, setLocationScanInput] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  const [isLoading, setIsLoading] = useState(false);
  const [foundMaterial, setFoundMaterial] = useState<Material | null>(null);
  const [storeLog, setStoreLog] = useState<StoreLog[]>([]);
  const [isMapOpen, setMapOpen] = useState(false);

  const { toast } = useToast();

  const handleFindItem = useCallback(() => {
    if (!itemScanInput) return;
    
    setIsLoading(true);
    setFoundMaterial(null);

    setTimeout(() => {
      const query = itemScanInput.toLowerCase().trim();
      
      let material = materials.find(m => 
        m.code.toLowerCase() === query || 
        m.partNo.toLowerCase() === query || 
        m.serialNumber?.toLowerCase() === query
      );

      if (!material) {
        for (const receipt of initialReceipts) {
          const foundItem = receipt.items?.find(item => item.serialBatch.toLowerCase() === query);
          if (foundItem) {
            material = materials.find(m => m.code === foundItem.materialCode);
            break;
          }
        }
      }

      if (material) {
        setFoundMaterial(material);
        setLocationScanInput("");
        setQuantity(1);
        toast({ title: "Thành công", description: `Đã tìm thấy vật tư: ${'\'\'\''}
${material.name}` });
      } else {
        toast({ variant: "destructive", title: "Không tìm thấy", description: `Không có vật tư nào khớp với mã "${itemScanInput}".` });
      }
      setIsLoading(false);
    }, 500);
  }, [itemScanInput, materials, initialReceipts, toast]);

  const handleConfirmStore = () => {
    if (!foundMaterial) return;

    if (!locationScanInput.trim()) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng quét hoặc nhập mã vị trí." });
      return;
    }

    const locationExists = locations.some(l => l.code.toLowerCase() === locationScanInput.toLowerCase().trim());
    if (!locationExists) {
        toast({ variant: "destructive", title: "Vị trí không hợp lệ", description: `Không tìm thấy vị trí kho với mã "${locationScanInput}".` });
        return;
    }

    if (foundMaterial.managementType === 'Batch' && quantity <= 0) {
      toast({ variant: "destructive", title: "Lỗi", description: "Số lượng phải lớn hơn 0." });
      return;
    }

    const newLogEntry: StoreLog = {
      id: `log-${Date.now()}`,
      materialName: foundMaterial.name,
      materialCode: foundMaterial.code,
      location: locationScanInput.trim().toUpperCase(),
      quantity: quantity,
      timestamp: new Date(),
    };

    setStoreLog([newLogEntry, ...storeLog]);
    toast({ title: "Thành công!", description: `Đã cất ${quantity} ${foundMaterial.unit} ${foundMaterial.name} vào vị trí ${newLogEntry.location}.` });

    setFoundMaterial(null);
    setItemScanInput("");
    setLocationScanInput("");
    setQuantity(1);
  };
  
  const handleCancel = () => {
      setFoundMaterial(null);
      setItemScanInput("");
      setLocationScanInput("");
      setQuantity(1);
  };

  const handleOpenMap = () => {
    setMapOpen(true);
  };

  const handleLocationSelect = (locationCode: string) => {
    setLocationScanInput(locationCode);
    setMapOpen(false);
  };

  const availableLocations = useMemo(() => {
    return locations.filter(loc => loc.status === 'Active').map(loc => loc.code);
  }, [locations]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <PageHeader
        title="Cất hàng nhanh (Scan to Store)"
        description="Quét mã vạch trên vật tư và vị trí để thực hiện cất hàng nhanh chóng."
        breadcrumbs={<Breadcrumbs />}
      />

      <Card>
        <CardContent className="pt-6">
          {!foundMaterial ? (
            <div className="space-y-4">
              <h3 className="font-semibold">Bước 1: Quét mã vật tư</h3>
              <div className="flex w-full items-center space-x-2">
                <div className="relative flex-grow">
                    <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                            {foundMaterial.code} / {foundMaterial.partNo} / SN: {foundMaterial.serialNumber || 'N/A'}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel}>
                        <XCircle className="h-5 w-5 text-red-500" />
                    </Button>
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-sm font-medium">Bước 2: Quét vị trí cất hàng</label>
                      <div className="relative">
                        <Input
                            type="text"
                            placeholder="Quét, nhập hoặc chọn mã vị trí"
                            value={locationScanInput}
                            onChange={(e) => setLocationScanInput(e.target.value)}
                            className="pl-3 pr-10"
                        />
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={handleOpenMap}
                         >
                            <MapPin className="h-4 w-4" />
                         </Button>
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
              </div>

               <div className="pt-4 flex justify-end">
                    <Button onClick={handleConfirmStore} size="lg">
                        <Save className="mr-2 h-5 w-5" /> Xác nhận cất hàng
                    </Button>
               </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Lịch sử cất hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Vật tư</TableHead>
                        <TableHead>Vị trí</TableHead>
                        <TableHead className="text-right">Số lượng</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {storeLog.length > 0 ? storeLog.slice(0, 10).map(log => (
                        <TableRow key={log.id}>
                            <TableCell className="text-xs text-muted-foreground">{format(log.timestamp, "dd/MM/yy HH:mm:ss")}</TableCell>
                            <TableCell>
                                <div className="font-medium">{log.materialName}</div>
                                <div className="text-xs text-muted-foreground">{log.materialCode}</div>
                            </TableCell>
                            <TableCell className="font-semibold text-primary">{log.location}</TableCell>
                            <TableCell className="text-right font-bold">{log.quantity}</TableCell>
                        </TableRow>
                    )) : (
                         <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                Chưa có hoạt động nào.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isMapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Chọn vị trí cất hàng</DialogTitle>
                <DialogDescription>Các vị trí không khả dụng (đã đầy hoặc không hoạt động) sẽ bị làm mờ.</DialogDescription>
            </DialogHeader>
            <WarehouseMap
                locations={locations}
                availableCodes={availableLocations}
                onSelect={handleLocationSelect}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
