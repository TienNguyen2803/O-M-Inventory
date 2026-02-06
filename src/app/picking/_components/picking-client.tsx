"use client";

import { useState, useCallback, useEffect } from "react";
import type { OutboundVoucher } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Vận hành Kho</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Lấy hàng (Picking)</span>
  </div>
);

export function PickingClient({ initialVouchers }: { initialVouchers: OutboundVoucher[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentVoucher, setCurrentVoucher] = useState<OutboundVoucher | null>(null);
    const [vouchers, setVouchers] = useState<OutboundVoucher[]>(initialVouchers);
    const { toast } = useToast();
    const searchParams = useSearchParams();

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
                    setCurrentVoucher(foundVoucher);
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
    
    const handleValueChange = (itemId: string, field: 'issuedQuantity' | 'actualSerial', value: string | number) => {
        if (!currentVoucher || !currentVoucher.items) return;

        const updatedItems = currentVoucher.items.map(item => {
            if (item.id === itemId) {
                return { ...item, [field]: value };
            }
            return item;
        });

        setCurrentVoucher({ ...currentVoucher, items: updatedItems });
    };

    const handleConfirmPicking = () => {
        if (!currentVoucher) return;

        const updatedVoucher = { ...currentVoucher, status: 'Đã xuất' as const, step: 4 };
        setVouchers(vouchers.map(v => v.id === updatedVoucher.id ? updatedVoucher : v));
        setCurrentVoucher(updatedVoucher);
        
        toast({
            title: "Thành công",
            description: `Đã hoàn tất lấy hàng cho phiếu ${currentVoucher.id}.`,
        });
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
                                        <CardTitle className="text-base">{item.materialName}</CardTitle>
                                        <CardDescription>
                                            {item.materialCode} | Yêu cầu: <span className="font-bold text-foreground">{item.requestedQuantity} {item.unit}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-muted-foreground">Vị trí lấy hàng (gợi ý)</label>
                                                <p className="font-semibold text-primary">{item.pickLocationSuggestion}</p>
                                            </div>
                                            <div>
                                                 <label className="text-sm font-medium" htmlFor={`issued-qty-${item.id}`}>Số lượng thực tế</label>
                                                 <Input
                                                    id={`issued-qty-${item.id}`}
                                                    type="number"
                                                    value={item.issuedQuantity}
                                                    onChange={(e) => handleValueChange(item.id, 'issuedQuantity', e.target.value)}
                                                    disabled={currentVoucher.status === 'Đã xuất'}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                 <label className="text-sm font-medium" htmlFor={`serial-${item.id}`}>Serial/Batch thực tế</label>
                                                 <Input
                                                    id={`serial-${item.id}`}
                                                    value={item.actualSerial}
                                                    onChange={(e) => handleValueChange(item.id, 'actualSerial', e.target.value)}
                                                    placeholder="Quét hoặc nhập serial/batch"
                                                    disabled={currentVoucher.status === 'Đã xuất'}
                                                />
                                            </div>
                                        </div>
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
        </div>
    );
}
