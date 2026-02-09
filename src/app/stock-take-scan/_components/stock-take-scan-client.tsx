"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Material, WarehouseLocation, WarehouseItem } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, XCircle, ScanLine, QrCode, CheckCircle, Warehouse, Package, Hash, X, Plus, ClipboardCheck, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WarehouseMap } from "./warehouse-map";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Vận hành Kho</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Kiểm kê bằng Barcode/QR</span>
  </div>
);

type ScanLog = {
  id: string;
  locationCode: string;
  materialName: string;
  materialCode: string;
  bookQuantity: number;
  actualQuantity: number;
  difference: number;
  serials?: string[];
  timestamp: Date;
};

type StockTakeScanClientProps = {
  allMaterials: Material[];
  allLocations: WarehouseLocation[];
};

export function StockTakeScanClient({ allMaterials, allLocations }: StockTakeScanClientProps) {
  const [step, setStep] = useState<"location" | "material" | "count">("location");
  
  const [locationInput, setLocationInput] = useState("");
  const [materialInput, setMaterialInput] = useState("");

  const [currentLocation, setCurrentLocation] = useState<WarehouseLocation | null>(null);
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
  const [bookItem, setBookItem] = useState<WarehouseItem | null>(null);

  const [countedQuantity, setCountedQuantity] = useState(1);
  const [scannedSerials, setScannedSerials] = useState<string[]>([]);
  const [serialInput, setSerialInput] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [scanLog, setScanLog] = useState<ScanLog[]>([]);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const { toast } = useToast();

  const handleFindLocation = useCallback(() => {
    if (!locationInput) return;
    setIsLoading(true);
    setTimeout(() => {
      const location = allLocations.find(l => l.code.toLowerCase() === locationInput.toLowerCase());
      if (location) {
        setCurrentLocation(location);
        setStep("material");
        toast({ title: "Thành công", description: `Đã chọn vị trí: ${location.name} (${location.code})` });
      } else {
        toast({ variant: "destructive", title: "Không tìm thấy", description: `Không có vị trí nào khớp với mã "${locationInput}".` });
      }
      setIsLoading(false);
    }, 300);
  }, [locationInput, allLocations, toast]);

  const handleFindMaterial = useCallback(() => {
    if (!materialInput) return;
    setIsLoading(true);
    setTimeout(() => {
      const material = allMaterials.find(m => 
        m.code.toLowerCase() === materialInput.toLowerCase() || 
        m.partNo.toLowerCase() === materialInput.toLowerCase() ||
        m.serialNumber?.toLowerCase() === materialInput.toLowerCase()
      );
      if (material && currentLocation) {
        setCurrentMaterial(material);
        const itemInLocation = currentLocation.items?.find(i => i.materialId === material.id) || null;
        setBookItem(itemInLocation);
        setCountedQuantity(itemInLocation?.quantity ?? 1);
        setScannedSerials([]);
        setStep("count");
        toast({ title: "Thành công", description: `Đã chọn vật tư: ${material.name}` });
      } else {
        toast({ variant: "destructive", title: "Không tìm thấy", description: `Không có vật tư nào khớp với mã "${materialInput}".` });
      }
      setIsLoading(false);
    }, 300);
  }, [materialInput, allMaterials, currentLocation, toast]);

  const handleAddSerial = () => {
    if (!serialInput.trim() || scannedSerials.includes(serialInput.trim())) return;
    setScannedSerials(prev => [...prev, serialInput.trim()]);
    setSerialInput("");
  }

  const handleRemoveSerial = (serialToRemove: string) => {
    setScannedSerials(prev => prev.filter(s => s !== serialToRemove));
  }

  const handleConfirmCount = () => {
    if (!currentLocation || !currentMaterial) return;
    
    const isSerialManaged = currentMaterial.managementType === 'Serial';
    const actualQuantity = isSerialManaged ? scannedSerials.length : countedQuantity;
    const bookQuantity = bookItem?.quantity ?? 0;
    const difference = actualQuantity - bookQuantity;

    const newLogEntry: ScanLog = {
      id: `log-${Date.now()}`,
      locationCode: currentLocation.code,
      materialName: currentMaterial.name,
      materialCode: currentMaterial.code,
      bookQuantity,
      actualQuantity,
      difference,
      serials: isSerialManaged ? scannedSerials : undefined,
      timestamp: new Date(),
    };

    setScanLog(prev => [newLogEntry, ...prev]);
    toast({
      title: "Ghi nhận thành công!",
      description: `Đã kiểm ${actualQuantity} ${currentMaterial.unit} tại vị trí ${currentLocation.code}.`
    });

    handleResetMaterial();
  };

  const handleResetLocation = () => {
    setStep("location");
    setCurrentLocation(null);
    setLocationInput("");
    handleResetMaterial();
  };

  const handleResetMaterial = () => {
    setStep("material");
    setCurrentMaterial(null);
    setMaterialInput("");
    setBookItem(null);
    setScannedSerials([]);
    setSerialInput("");
    setCountedQuantity(1);
  };
  
  const handleLocationSelect = (locationCode: string) => {
    setLocationInput(locationCode);
    setMapOpen(false);
  };

  const availableLocations = useMemo(() => {
    return allLocations.filter(loc => loc.status === 'Active').map(loc => loc.code);
  }, [allLocations]);
  
  const renderStep = () => {
    switch (step) {
      case "location":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Warehouse className="h-6 w-6 text-primary"/> Bước 1: Quét Vị trí kho</CardTitle>
              <CardDescription>Bắt đầu bằng cách quét, nhập hoặc chọn vị trí trên bản đồ.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex w-full items-center space-x-2">
                  <div className="relative flex-grow">
                      <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                          type="text"
                          placeholder="Quét, nhập hoặc chọn vị trí..."
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleFindLocation()}
                          className="pl-10 pr-10"
                          autoFocus
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => setIsMapOpen(true)}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                  </div>
                  <Button onClick={handleFindLocation} disabled={isLoading || !locationInput}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Xác nhận Vị trí
                  </Button>
                </div>
            </CardContent>
          </Card>
        );
      case "material":
        return (
          <Card>
            <CardHeader>
               <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Package className="h-6 w-6 text-primary"/> Bước 2: Quét Vật tư</CardTitle>
                    <CardDescription>Đang kiểm kê tại vị trí: <span className="font-bold text-foreground">{currentLocation?.code}</span></CardDescription>
                  </div>
                   <Button variant="ghost" size="icon" onClick={handleResetLocation}>
                     <XCircle className="h-5 w-5 text-muted-foreground"/>
                   </Button>
               </div>
            </CardHeader>
            <CardContent>
              <div className="flex w-full items-center space-x-2">
                  <div className="relative flex-grow">
                      <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                          type="text"
                          placeholder="Quét hoặc nhập mã vật tư, Part No, Serial..."
                          value={materialInput}
                          onChange={(e) => setMaterialInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleFindMaterial()}
                          className="pl-10"
                          autoFocus
                      />
                  </div>
                  <Button onClick={handleFindMaterial} disabled={isLoading || !materialInput}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Xác nhận Vật tư
                  </Button>
                </div>
            </CardContent>
          </Card>
        );
      case "count":
        return (
          <Card>
            <CardHeader>
               <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Hash className="h-6 w-6 text-primary"/> Bước 3: Ghi nhận thực tế</CardTitle>
                     <CardDescription>
                        Kiểm kê <span className="font-bold text-foreground">{currentMaterial?.name}</span> tại vị trí <span className="font-bold text-foreground">{currentLocation?.code}</span>
                    </CardDescription>
                  </div>
                   <Button variant="ghost" size="icon" onClick={handleResetMaterial}>
                     <XCircle className="h-5 w-5 text-muted-foreground"/>
                   </Button>
               </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vật tư</p>
                  <p className="font-semibold">{currentMaterial?.name}</p>
                  <p className="text-xs text-muted-foreground">{currentMaterial?.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Tồn trên sổ sách</p>
                  <p className="text-2xl font-bold">{bookItem?.quantity ?? 0} <span className="text-base font-medium">{currentMaterial?.unit}</span></p>
                  {bookItem?.batchSerial && <p className="text-xs text-muted-foreground">SN/Batch: {bookItem.batchSerial}</p>}
                </div>
              </div>

              {currentMaterial?.managementType === 'Serial' ? (
                <div className="space-y-2">
                  <Label>Quét Serial Number thực tế</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={serialInput} 
                      onChange={e => setSerialInput(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleAddSerial()}
                      placeholder="Quét từng serial..."
                    />
                    <Button onClick={handleAddSerial} variant="outline"><Plus className="mr-2 h-4 w-4"/> Thêm</Button>
                  </div>
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between items-center">
                       <p className="text-sm text-muted-foreground">Đã quét: {scannedSerials.length} serial</p>
                        {scannedSerials.length > 0 && <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setScannedSerials([])}>Xóa tất cả</Button>}
                    </div>
                    {scannedSerials.length > 0 && (
                      <div className="max-h-32 overflow-y-auto rounded-md border p-2 flex flex-wrap gap-2">
                        {scannedSerials.map(serial => (
                          <Badge key={serial} variant="secondary" className="flex items-center gap-1">
                            {serial}
                            <button onClick={() => handleRemoveSerial(serial)}>
                              <X className="h-3 w-3"/>
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Số lượng thực tế</Label>
                  <Input type="number" value={countedQuantity} onChange={e => setCountedQuantity(Number(e.target.value))} />
                </div>
              )}
               <div className="pt-4 flex justify-end">
                    <Button onClick={handleConfirmCount} size="lg">
                        <ClipboardCheck className="mr-2 h-5 w-5" /> Ghi nhận kết quả
                    </Button>
               </div>
            </CardContent>
          </Card>
        );
    }
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <PageHeader
        title="Kiểm kê bằng Barcode/QR"
        description="Sử dụng thiết bị di động để quét và ghi nhận số lượng tồn kho thực tế."
        breadcrumbs={<Breadcrumbs />}
      />

      {renderStep()}
      
      <Card>
        <CardHeader>
            <CardTitle>Nhật ký kiểm kê gần đây</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Vị trí</TableHead>
                        <TableHead>Vật tư</TableHead>
                        <TableHead className="text-right">Sổ sách</TableHead>
                        <TableHead className="text-right">Thực tế</TableHead>
                        <TableHead className="text-right">Chênh lệch</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {scanLog.length > 0 ? scanLog.slice(0, 10).map(log => (
                        <TableRow key={log.id}>
                            <TableCell className="text-xs text-muted-foreground">{format(log.timestamp, "dd/MM/yy HH:mm:ss")}</TableCell>
                            <TableCell className="font-semibold text-primary">{log.locationCode}</TableCell>
                            <TableCell>
                                <div className="font-medium">{log.materialName}</div>
                                <div className="text-xs text-muted-foreground">{log.materialCode}</div>
                            </TableCell>
                            <TableCell className="text-right">{log.bookQuantity}</TableCell>
                            <TableCell className="text-right font-bold">{log.actualQuantity}</TableCell>
                             <TableCell className={cn("text-right font-bold", log.difference > 0 ? 'text-green-600' : log.difference < 0 ? 'text-red-600' : '')}>
                                {log.difference > 0 ? `+${log.difference}` : log.difference}
                            </TableCell>
                        </TableRow>
                    )) : (
                         <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                Chưa có hoạt động nào.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Chọn vị trí kiểm kê</DialogTitle>
                <DialogDescription>Các vị trí đang hoạt động sẽ có thể được chọn.</DialogDescription>
            </DialogHeader>
            <WarehouseMap
                locations={allLocations}
                availableCodes={availableLocations}
                onSelect={handleLocationSelect}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
