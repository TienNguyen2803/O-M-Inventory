"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { OutboundVoucher, OutboundVoucherItem, WarehouseLocation } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Loader2, Save, MapPin, ScanLine, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WarehouseMap } from "./warehouse-map";
import { Label } from "@/components/ui/label";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Vận hành Kho</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Lấy hàng (Picking)</span>
  </div>
);

export function PickingClient({ initialVouchers, allLocations }: { initialVouchers: OutboundVoucher[], allLocations: WarehouseLocation[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentVoucher, setCurrentVoucher] = useState<OutboundVoucher | null>(null);
    const [vouchers, setVouchers] = useState<OutboundVoucher[]>(initialVouchers);
    const { toast } = useToast();
    const searchParams = useSearchParams();

    const [mapDialogOpen, setMapDialogOpen] = useState(false);
    const [mapViewItem, setMapViewItem] = useState<OutboundVoucherItem | null>(null);

    const handleSearch = useCallback((query: string) => {
        if (!query) {
            setCurrentVoucher(null);
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            const foundVoucher = vouchers.find(v => v.id.toLowerCase() === query.toLowerCase());
            if (foundVoucher) {
                if (['Chờ xuất', 'Đang soạn hàng', 'Đã xuất'].includes(foundVoucher.status)) {
                    const initializedItems = foundVoucher.items?.map(item => ({
                        ...item,
                        pickLocations: (item.pickLocations && item.pickLocations.length > 0)
                            ? item.pickLocations
                            : [{ location: item.pickLocationSuggestion, quantity: item.requestedQuantity, serial: item.actualSerial || '' }]
                    })) || [];
                    setCurrentVoucher({ ...foundVoucher, items: initializedItems });
                } else {
                    setCurrentVoucher(null);
                    toast({
                        variant: "destructive",
                        title: "Không hợp lệ",
                        description: `Phiếu xuất kho "${query}" không ở trạng thái có thể lấy hàng.`,
                    });
                }
            } else {
                 setCurrentVoucher(null);
                toast({
                    variant: "destructive",
                    title: "Không tìm thấy",
                    description: `Không tìm thấy phiếu xuất kho với mã "${query}".`,
                });
            }
            setIsLoading(false);
        }, 500);
    }, [vouchers, toast]);

    const handleSearchButtonClick = () => {
        handleSearch(searchQuery);
    }
    
    useEffect(() => {
        const voucherId = searchParams.get('voucherId');
        if (voucherId) {
            setSearchQuery(voucherId);
            handleSearch(voucherId);
        }
    }, [searchParams, handleSearch]);
    
    const handleSplitChange = (itemId: string, splitIndex: number, field: 'location' | 'quantity' | 'serial', value: string | number) => {
        if (!currentVoucher || !currentVoucher.items) return;

        const itemToUpdate = currentVoucher.items.find(item => item.id === itemId);
        if (!itemToUpdate) return;
        
        const newPicks = [...(itemToUpdate.pickLocations || [])];
        const updatedPick = { ...newPicks[splitIndex], [field]: field === 'quantity' ? Number(value) : value };

        if (field === 'quantity') {
            const numValue = Number(value);
            if (numValue < 0) {
                 toast({
                    variant: "destructive",
                    title: "Số lượng không hợp lệ",
                    description: "Số lượng lấy không được là số âm.",
                });
                return; // Do not update state if invalid
            }

            // Create a temporary copy to calculate the new total
            const tempPicks = [...newPicks];
            tempPicks[splitIndex] = updatedPick;
            const totalSplitQuantity = tempPicks.reduce((sum, split) => sum + split.quantity, 0);
            
            if (totalSplitQuantity > itemToUpdate.requestedQuantity) {
                toast({
                    variant: "destructive",
                    title: "Số lượng không hợp lệ",
                    description: `Tổng số lượng lấy (${totalSplitQuantity}) không thể vượt quá số lượng yêu cầu (${itemToUpdate.requestedQuantity}).`,
                });
                return; // Do not update state if invalid
            }
        }
        
        newPicks[splitIndex] = updatedPick;

        const updatedItems = currentVoucher.items.map(item => 
            item.id === itemId ? { ...item, pickLocations: newPicks } : item
        );

        setCurrentVoucher({ ...currentVoucher, items: updatedItems });
    };

    const handleAddSplit = (itemId: string) => {
        if (!currentVoucher || !currentVoucher.items) return;
         const updatedItems = currentVoucher.items.map(item => {
            if (item.id === itemId) {
                const newPicks = [...(item.pickLocations || []), { location: '', quantity: 0, serial: '' }];
                return { ...item, pickLocations: newPicks };
            }
            return item;
        });
        setCurrentVoucher({ ...currentVoucher, items: updatedItems });
    };

    const handleRemoveSplit = (itemId: string, splitIndex: number) => {
         if (!currentVoucher || !currentVoucher.items) return;
         const updatedItems = currentVoucher.items.map(item => {
            if (item.id === itemId) {
                const newPicks = item.pickLocations?.filter((_, index) => index !== splitIndex);
                return { ...item, pickLocations: newPicks };
            }
            return item;
        });
        setCurrentVoucher({ ...currentVoucher, items: updatedItems });
    };

    const handleConfirmPicking = () => {
        if (!currentVoucher || !currentVoucher.items) return;

        for (const item of currentVoucher.items) {
            const totalPicked = item.pickLocations?.reduce((sum, pick) => sum + pick.quantity, 0) || 0;
            if (totalPicked !== item.requestedQuantity) {
                toast({
                    variant: "destructive",
                    title: "Số lượng không khớp",
                    description: `Tổng số lượng lấy cho "${item.materialName}" (${totalPicked}) không khớp với yêu cầu (${item.requestedQuantity}).`,
                });
                return;
            }
            if (item.pickLocations?.some(p => !p.location.trim() || (item.materialCode.includes('Serial') && !p.serial.trim()) )) {
                 toast({
                    variant: "destructive",
                    title: "Chưa hoàn tất",
                    description: `Vui lòng nhập đầy đủ vị trí và serial (nếu cần) cho "${item.materialName}".`,
                });
                return;
            }
        }

        const updatedVoucher = { ...currentVoucher, status: 'Đã xuất' as const, step: 4 };
        setVouchers(vouchers.map(v => v.id === updatedVoucher.id ? updatedVoucher : v));
        setCurrentVoucher(updatedVoucher);
        
        toast({
            title: "Thành công",
            description: `Đã hoàn tất lấy hàng cho phiếu ${currentVoucher.id}.`,
        });
    };

    const handleOpenMap = (item: OutboundVoucherItem) => {
        setMapViewItem(item);
        setMapDialogOpen(true);
    };

    const handleLocationSelect = (locationCode: string) => {
        if (!currentVoucher || !mapViewItem) return;

        const updatedItems = currentVoucher.items?.map(item => {
            if (item.id === mapViewItem.id) {
                const newPicks = [...(item.pickLocations || [])];
                const emptyIndex = newPicks.findIndex(p => !p.location.trim());
                if (emptyIndex !== -1) {
                    newPicks[emptyIndex].location = locationCode;
                } else {
                    newPicks.push({ location: locationCode, quantity: 0, serial: '' });
                }
                return { ...item, pickLocations: newPicks };
            }
            return item;
        });

        setCurrentVoucher({ ...currentVoucher, items: updatedItems });
        setMapDialogOpen(false);
    };
  
    const highlightedCodes = useMemo(() => {
        if (!mapViewItem) return [];
        return allLocations
        .filter(loc => loc.items?.some(item => item.materialCode === mapViewItem.materialCode))
        .map(loc => loc.code);
    }, [allLocations, mapViewItem]);

    const AllocatedSummary = ({ item }: { item: OutboundVoucherItem }) => {
        const allocated = item.pickLocations?.reduce((sum, s) => sum + s.quantity, 0) || 0;
        const remaining = item.requestedQuantity - allocated;
        
        const remainingColor = () => {
            if (remaining < 0) return "text-red-600 font-bold";
            if (remaining > 0) return "text-blue-600";
            return "text-green-600 font-bold";
        }

        return (
            <div className="text-xs text-muted-foreground mt-1">
                <span>Y/C: {item.requestedQuantity}</span> | 
                <span className="text-green-600"> Đã lấy: {allocated}</span> | 
                <span className={cn("transition-colors", remainingColor())}> Còn lại: {remaining}</span>
            </div>
        )
    };


    return (
        <div className="space-y-4">
            <PageHeader
                title="Lấy hàng theo Phiếu (Picking)"
                description="Quét phiếu xuất kho và xác nhận vật tư, số lượng, serial/batch thực tế."
                breadcrumbs={<Breadcrumbs />}
            />

            <Card>
                <CardContent className="pt-6">
                    <div className="flex w-full max-w-md items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Nhập hoặc quét mã Phiếu xuất kho (PXK)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchButtonClick()}
                        />
                        <Button onClick={handleSearchButtonClick} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Tìm phiếu
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {currentVoucher && (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-2">
                            <div>
                                <CardTitle>Phiếu xuất kho: {currentVoucher.id}</CardTitle>
                                <CardDescription>
                                    Ngày xuất: {new Date(currentVoucher.issueDate).toLocaleDateString('vi-VN')} | Người nhận: {currentVoucher.receiverName} ({currentVoucher.department})
                                </CardDescription>
                            </div>
                            <div className={cn(
                                "rounded-md px-3 py-1 text-sm font-semibold border w-fit",
                                currentVoucher.status === 'Đã xuất' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                            )}>
                                {currentVoucher.status}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {currentVoucher.items?.map((item) => (
                                <Card key={item.id} className="overflow-hidden bg-card">
                                    <CardHeader className="bg-muted/50 p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-base">{item.materialName}</CardTitle>
                                                <CardDescription>
                                                    {item.materialCode} | Y/C: <span className="font-bold text-foreground">{item.requestedQuantity} {item.unit}</span>
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex flex-col gap-2">
                                            {item.pickLocations?.map((pick, index) => (
                                                <div key={index} className="space-y-2 rounded-md border p-2 bg-background">
                                                    <div className="flex flex-wrap items-end gap-2">
                                                        <div className="flex-grow space-y-1" style={{minWidth: '150px'}}>
                                                            <Label htmlFor={`loc-${item.id}-${index}`} className="text-xs">Vị trí lấy</Label>
                                                            <div className="relative">
                                                                <Input 
                                                                    id={`loc-${item.id}-${index}`} 
                                                                    value={pick.location} 
                                                                    onChange={(e) => handleSplitChange(item.id, index, 'location', e.target.value)} 
                                                                    placeholder="Quét hoặc nhập vị trí..."
                                                                    className="pr-10"
                                                                />
                                                                <Button 
                                                                    type="button" 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary"
                                                                    onClick={() => handleOpenMap(item)}
                                                                >
                                                                    <MapPin className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1" style={{width: '90px'}}>
                                                            <Label htmlFor={`qty-${item.id}-${index}`} className="text-xs">Số lượng</Label>
                                                            <Input id={`qty-${item.id}-${index}`} type="number" value={pick.quantity}  onChange={(e) => handleSplitChange(item.id, index, 'quantity', e.target.value)} />
                                                        </div>
                                                        <div className="flex-grow space-y-1" style={{minWidth: '150px'}}>
                                                            <Label htmlFor={`ser-${item.id}-${index}`} className="text-xs">Serial/Batch</Label>
                                                            <div className="relative">
                                                                <Input id={`ser-${item.id}-${index}`} value={pick.serial} onChange={(e) => handleSplitChange(item.id, index, 'serial', e.target.value)} placeholder="Quét hoặc nhập serial..." className="pl-8"/>
                                                                <ScanLine className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveSplit(item.id, index)} disabled={currentVoucher.status === 'Đã xuất' || (item.pickLocations && item.pickLocations.length <= 1)}>
                                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {currentVoucher.status !== 'Đã xuất' && (
                                            <div className="flex items-center justify-between mt-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleAddSplit(item.id)}
                                                    disabled={item.requestedQuantity <= 1}
                                                >
                                                    <Plus className="mr-2 h-3 w-3" /> Tách vị trí
                                                </Button>
                                                <AllocatedSummary item={item} />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            {(!currentVoucher.items || currentVoucher.items.length === 0) && (
                                <div className="text-center text-muted-foreground p-8">Không có vật tư nào trong phiếu xuất này.</div>
                            )}
                        </div>
                        {currentVoucher.items && currentVoucher.items.length > 0 && currentVoucher.status !== 'Đã xuất' && (
                            <div className="flex justify-end mt-6">
                                <Button onClick={handleConfirmPicking} size="lg">
                                    <Save className="mr-2 h-4 w-4"/>
                                    Xác nhận Lấy hàng & Hoàn tất
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
             <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Chọn vị trí lấy hàng cho: {mapViewItem?.materialName}</DialogTitle>
                    </DialogHeader>
                    {mapViewItem && (
                         <WarehouseMap
                            locations={allLocations}
                            highlightedCodes={highlightedCodes}
                            selectedCode={mapViewItem.pickLocationSuggestion}
                            onSelect={handleLocationSelect}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
