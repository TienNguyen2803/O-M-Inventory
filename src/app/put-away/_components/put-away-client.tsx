
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { InboundReceipt, InboundReceiptItem, WarehouseLocation } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Loader2, Save, Plus, Trash2, ScanLine, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WarehouseMap } from "./warehouse-map";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Vận hành Kho</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Xếp hàng vào kho</span>
  </div>
);

export function PutAwayClient({ initialReceipts, allLocations }: { initialReceipts: InboundReceipt[], allLocations: WarehouseLocation[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentTask, setCurrentTask] = useState<InboundReceipt | null>(null);
    const [receipts, setReceipts] = useState<InboundReceipt[]>(initialReceipts);
    const { toast } = useToast();
    const searchParams = useSearchParams();

    const [isMapOpen, setMapOpen] = useState(false);
    const [mapViewContext, setMapViewContext] = useState<{ itemId: string; splitIndex: number } | null>(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const handleSearch = useCallback((query: string) => {
        if (!query) {
            setCurrentTask(null);
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            const foundTask = receipts.find(t => t.id.toLowerCase() === query.toLowerCase());
            if (foundTask) {
                if (['Chờ xếp hàng', 'Hoàn thành'].includes(foundTask.status)) {
                    // Initialize putAwayLocations for items that don't have it
                    const initializedItems = foundTask.items?.map(item => ({
                        ...item,
                        putAwayLocations: item.putAwayLocations && item.putAwayLocations.length > 0 
                            ? item.putAwayLocations 
                            : [{ location: '', quantity: item.receivingQuantity }]
                    })) || [];
                    setCurrentTask({ ...foundTask, items: initializedItems });
                } else {
                    setCurrentTask(null);
                    toast({
                        variant: "destructive",
                        title: "Không hợp lệ",
                        description: `Phiếu nhập kho "${query}" không ở trạng thái "Chờ xếp hàng".`,
                    });
                }
            } else {
                 setCurrentTask(null);
                toast({
                    variant: "destructive",
                    title: "Không tìm thấy",
                    description: `Không tìm thấy phiếu nhập kho với mã "${query}".`,
                });
            }
            setIsLoading(false);
        }, 500);
    }, [receipts, toast]);

    const handleSearchButtonClick = () => {
        handleSearch(searchQuery);
    }
    
    useEffect(() => {
        const receiptId = searchParams.get('receiptId');
        if (receiptId) {
            setSearchQuery(receiptId);
            handleSearch(receiptId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleSplitChange = (itemId: string, splitIndex: number, field: 'location' | 'quantity', value: string | number) => {
        if (!currentTask || !currentTask.items) return;

        const itemToUpdate = currentTask.items.find(item => item.id === itemId);
        if (!itemToUpdate) return;
        
        const newSplits = [...(itemToUpdate.putAwayLocations || [])];
        const newSplit = { ...newSplits[splitIndex], [field]: field === 'quantity' ? Number(value) : value };
        newSplits[splitIndex] = newSplit;
        
        if (field === 'quantity') {
            const totalSplitQuantity = newSplits.reduce((sum, split) => sum + split.quantity, 0);
            if (totalSplitQuantity > itemToUpdate.receivingQuantity) {
                toast({
                    variant: "destructive",
                    title: "Số lượng không hợp lệ",
                    description: `Tổng số lượng xếp (${totalSplitQuantity}) không thể vượt quá số lượng nhập (${itemToUpdate.receivingQuantity}).`,
                });
                return; // Abort update
            }
        }

        const updatedItems = currentTask.items.map(item => 
            item.id === itemId ? { ...item, putAwayLocations: newSplits } : item
        );

        setCurrentTask({ ...currentTask, items: updatedItems });
    };

    const handleAddSplit = (itemId: string) => {
        if (!currentTask || !currentTask.items) return;
         const updatedItems = currentTask.items.map(item => {
            if (item.id === itemId) {
                const newSplits = [...(item.putAwayLocations || []), { location: '', quantity: 0 }];
                return { ...item, putAwayLocations: newSplits };
            }
            return item;
        });
        setCurrentTask({ ...currentTask, items: updatedItems });
    };

    const handleRemoveSplit = (itemId: string, splitIndex: number) => {
         if (!currentTask || !currentTask.items) return;
         const updatedItems = currentTask.items.map(item => {
            if (item.id === itemId) {
                const newSplits = item.putAwayLocations?.filter((_, index) => index !== splitIndex);
                return { ...item, putAwayLocations: newSplits };
            }
            return item;
        });
        setCurrentTask({ ...currentTask, items: updatedItems });
    };

    const handleOpenMap = (itemId: string, splitIndex: number) => {
        setMapViewContext({ itemId, splitIndex });
        setMapOpen(true);
    };

    const handleLocationSelect = (locationCode: string) => {
        if (!currentTask || !mapViewContext) return;

        handleSplitChange(mapViewContext.itemId, mapViewContext.splitIndex, 'location', locationCode);
        setMapOpen(false);
    };

    const availableCodes = useMemo(() => {
        return allLocations.filter(loc => loc.status === 'Active').map(loc => loc.code);
    }, [allLocations]);
    
    const isFullyShelved = useMemo(() => {
        if (!currentTask || !currentTask.items || currentTask.status === 'Hoàn thành') {
            return true; 
        }
        return currentTask.items.every(item => {
            const totalPutAway = item.putAwayLocations?.reduce((sum, p) => sum + p.quantity, 0) || 0;
            return totalPutAway === item.receivingQuantity;
        });
    }, [currentTask]);

    const handleSave = () => {
        if (!currentTask) return;
        setReceipts(receipts.map(r => r.id === currentTask.id ? currentTask : r));
        toast({
            title: "Đã lưu",
            description: `Đã lưu tạm thời tiến độ xếp hàng cho phiếu ${currentTask.id}.`,
        });
    };

    const executeFinalConfirmation = () => {
        if (!currentTask) return;

        const updatedTask = { ...currentTask, status: 'Hoàn thành' as const };
        setReceipts(receipts.map(t => t.id === updatedTask.id ? updatedTask : t));
        setCurrentTask(updatedTask);
        
        toast({
            title: "Thành công",
            description: `Đã hoàn tất xếp hàng cho phiếu ${currentTask.id}.`,
        });
        setIsConfirmDialogOpen(false);
    };

    const handleConfirmPutAway = () => {
        if (!currentTask || !currentTask.items) return;
        
        const isPartiallyShelved = currentTask.items.some(item => {
            const totalSplitQuantity = item.putAwayLocations?.reduce((sum, split) => sum + split.quantity, 0) || 0;
            return totalSplitQuantity !== item.receivingQuantity;
        });

        const hasEmptyLocation = currentTask.items.some(item => 
            item.putAwayLocations?.some(p => !p.location.trim())
        );

        if (hasEmptyLocation) {
            toast({
                variant: "destructive",
                title: "Thiếu thông tin",
                description: "Vui lòng nhập vị trí cho tất cả các lần xếp kho.",
            });
            return;
        }

        if (isPartiallyShelved) {
            setIsConfirmDialogOpen(true);
        } else {
            executeFinalConfirmation();
        }
    };


    const AllocatedSummary = ({ item }: { item: InboundReceiptItem }) => {
        const allocated = item.putAwayLocations?.reduce((sum, s) => sum + s.quantity, 0) || 0;
        const remaining = item.receivingQuantity - allocated;
        
        const remainingColor = () => {
            if (remaining < 0) return "text-red-600 font-bold";
            if (remaining > 0) return "text-blue-600";
            return "text-green-600 font-bold";
        }

        return (
            <div className="text-xs text-muted-foreground mt-1">
                <span>Tổng: {item.receivingQuantity}</span> | 
                <span className="text-green-600"> Đã xếp: {allocated}</span> | 
                <span className={cn("transition-colors", remainingColor())}> Còn lại: {remaining}</span>
            </div>
        )
    };

    return (
        <div className="space-y-4">
            <PageHeader
                title="Xếp hàng vào kho (Put Away)"
                description="Quét phiếu nhập kho và xác nhận vị trí lưu trữ thực tế cho từng mặt hàng."
                breadcrumbs={<Breadcrumbs />}
            />

            <Card>
                <CardContent className="pt-6">
                    <div className="relative flex w-full items-center space-x-2">
                        <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Nhập hoặc quét mã Phiếu nhập kho (PNK)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchButtonClick()}
                            className="flex-grow pl-10"
                        />
                        <Button onClick={handleSearchButtonClick} disabled={isLoading} className="shrink-0">
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="mr-2 h-4 w-4" />
                            )}
                            Tìm kiếm
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {currentTask && (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-2">
                            <div>
                                <CardTitle>Phiếu nhập kho: {currentTask.id}</CardTitle>
                                <CardDescription>
                                    Ngày nhập: {new Date(currentTask.inboundDate).toLocaleDateString('vi-VN')} | NCC: {currentTask.partner}
                                </CardDescription>
                            </div>
                            <div className={cn(
                                "rounded-md px-3 py-1 text-sm font-semibold border w-fit",
                                currentTask.status === 'Hoàn thành' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            )}>
                                {currentTask.status}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {currentTask.items?.map((item) => (
                                <Card key={item.id} className="overflow-hidden">
                                    <CardHeader className="bg-muted/50 p-4">
                                        <CardTitle className="text-base">{item.materialName}</CardTitle>
                                        <CardDescription>
                                            {item.materialCode} | SL Nhập: <span className="font-bold text-foreground">{item.receivingQuantity} {item.unit}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                 <label className="text-xs font-semibold text-muted-foreground">Serial/Batch</label>
                                                <p>{item.serialBatch || 'N/A'}</p>
                                            </div>
                                             <div>
                                                 <label className="text-xs font-semibold text-muted-foreground">Vị trí gợi ý</label>
                                                <p className="font-semibold text-primary">{item.location}</p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium">Vị trí thực tế & Số lượng</label>
                                            <div className="flex flex-col gap-2 mt-2">
                                                {item.putAwayLocations?.map((split, index) => (
                                                    <div key={index} className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_100px_auto] items-center gap-2">
                                                        <div className="relative">
                                                            <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                            <Input
                                                                value={split.location}
                                                                onChange={(e) => handleSplitChange(item.id, index, 'location', e.target.value)}
                                                                placeholder="Quét, nhập hoặc chọn vị trí..."
                                                                disabled={currentTask.status === 'Hoàn thành'}
                                                                className="pl-10 pr-10"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary"
                                                                onClick={() => handleOpenMap(item.id, index)}
                                                                disabled={currentTask.status === 'Hoàn thành'}
                                                            >
                                                                <MapPin className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <Input 
                                                            type="number"
                                                            value={split.quantity}
                                                            onChange={(e) => handleSplitChange(item.id, index, 'quantity', e.target.value)}
                                                            disabled={currentTask.status === 'Hoàn thành'}
                                                            className="text-right"
                                                        />
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleRemoveSplit(item.id, index)}
                                                            disabled={currentTask.status === 'Hoàn thành' || (item.putAwayLocations && item.putAwayLocations.length <= 1)}
                                                            className="h-9 w-9"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                {currentTask.status !== 'Hoàn thành' && (
                                                    <div className="flex items-center justify-between mt-2">
                                                        <Button 
                                                            variant="default" 
                                                            size="sm" 
                                                            onClick={() => handleAddSplit(item.id)}
                                                        >
                                                            <Plus className="mr-2 h-3 w-3" /> Tách vị trí
                                                        </Button>
                                                         <AllocatedSummary item={item} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                             {(!currentTask.items || currentTask.items.length === 0) && (
                                <div className="text-center text-muted-foreground p-8">Không có mặt hàng nào trong phiếu nhập này.</div>
                            )}
                        </div>
                        {currentTask.items && currentTask.items.length > 0 && currentTask.status !== 'Hoàn thành' && (
                           <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={handleSave}>
                                    <Save className="mr-2 h-4 w-4"/>
                                    Lưu
                                </Button>
                                <Button onClick={handleConfirmPutAway} disabled={isFullyShelved}>
                                    Xác nhận xếp hàng toàn bộ phiếu
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
             <Dialog open={isMapOpen} onOpenChange={setMapOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Chọn vị trí cất hàng</DialogTitle>
                        <DialogDescription>Các vị trí không khả dụng (đã đầy hoặc không hoạt động) sẽ bị làm mờ.</DialogDescription>
                    </DialogHeader>
                    <WarehouseMap
                        locations={allLocations}
                        availableCodes={availableCodes}
                        onSelect={handleLocationSelect}
                    />
                </DialogContent>
            </Dialog>
            <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Cảnh báo: Hàng chưa được xếp hết</AlertDialogTitle>
                    <AlertDialogDescription>
                        Một hoặc nhiều mặt hàng chưa được xếp đủ số lượng vào kho. Việc xác nhận sẽ hoàn tất phiếu nhập này và có thể gây chênh lệch tồn kho.
                        <br/><br/>
                        Bạn có chắc chắn muốn tiếp tục?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={executeFinalConfirmation} className="bg-destructive hover:bg-destructive/90">Vẫn xác nhận</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

