"use client";

import { useState } from "react";
import type { InboundReceipt } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, QrCode, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Vận hành Kho</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Xếp hàng vào kho</span>
  </div>
);

export function PutAwayClient({ initialReceipts }: { initialReceipts: InboundReceipt[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentTask, setCurrentTask] = useState<InboundReceipt | null>(null);
    const [receipts, setReceipts] = useState<InboundReceipt[]>(initialReceipts);
    const { toast } = useToast();

    const handleSearch = () => {
        if (!searchQuery) {
            setCurrentTask(null);
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            const foundTask = receipts.find(t => t.id.toLowerCase() === searchQuery.toLowerCase());
            if (foundTask) {
                if (['Chờ xếp hàng', 'Hoàn thành'].includes(foundTask.status)) {
                    setCurrentTask(foundTask);
                } else {
                    setCurrentTask(null);
                    toast({
                        variant: "destructive",
                        title: "Không hợp lệ",
                        description: `Phiếu nhập kho "${searchQuery}" không ở trạng thái "Chờ xếp hàng".`,
                    });
                }
            } else {
                 setCurrentTask(null);
                toast({
                    variant: "destructive",
                    title: "Không tìm thấy",
                    description: `Không tìm thấy phiếu nhập kho với mã "${searchQuery}".`,
                });
            }
            setIsLoading(false);
        }, 500);
    };

    const handleLocationChange = (itemId: string, newLocation: string) => {
        if (!currentTask || !currentTask.items) return;
        
        const updatedItems = currentTask.items.map(item => 
            item.id === itemId ? { ...item, actualLocation: newLocation } : item
        );
        setCurrentTask({ ...currentTask, items: updatedItems });
    };

    const handleConfirmPutAway = () => {
        if (!currentTask || !currentTask.items) return;
        
        const isAllLocated = currentTask.items.every(item => item.actualLocation && item.actualLocation.trim() !== '');

        if (!isAllLocated) {
             toast({
                variant: "destructive",
                title: "Chưa hoàn tất",
                description: "Vui lòng nhập vị trí thực tế cho tất cả các mặt hàng.",
            });
            return;
        }

        const updatedTask = { ...currentTask, status: 'Hoàn thành' as const };
        setReceipts(receipts.map(t => t.id === updatedTask.id ? updatedTask : t));
        setCurrentTask(updatedTask);
        
        toast({
            title: "Thành công",
            description: `Đã hoàn tất xếp hàng cho phiếu ${currentTask.id}.`,
        });
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
                    <div className="flex w-full max-w-md items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Nhập hoặc quét mã Phiếu nhập kho (PNK)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={isLoading}>
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
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Phiếu nhập kho: {currentTask.id}</CardTitle>
                                <CardDescription>
                                    Ngày nhập: {new Date(currentTask.inboundDate).toLocaleDateString('vi-VN')} | NCC: {currentTask.partner}
                                </CardDescription>
                            </div>
                            <div className={cn(
                                "rounded-md px-3 py-1 text-sm font-semibold border",
                                currentTask.status === 'Hoàn thành' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            )}>
                                {currentTask.status}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vật tư</TableHead>
                                        <TableHead>Serial/Batch</TableHead>
                                        <TableHead className="text-right">Số lượng</TableHead>
                                        <TableHead>Vị trí gợi ý</TableHead>
                                        <TableHead className="w-[250px]">Vị trí thực tế (Quét)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentTask.items?.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.materialName}</div>
                                                <div className="text-xs text-muted-foreground">{item.materialCode}</div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{item.serialBatch}</TableCell>
                                            <TableCell className="text-right font-medium">{item.receivingQuantity} {item.unit}</TableCell>
                                            <TableCell className="font-semibold text-primary">{item.location}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        value={item.actualLocation || ''}
                                                        onChange={(e) => handleLocationChange(item.id, e.target.value)}
                                                        placeholder="Quét mã vị trí..."
                                                        disabled={currentTask.status === 'Hoàn thành'}
                                                    />
                                                    <Button variant="outline" size="icon" className="h-9 w-9" disabled={currentTask.status === 'Hoàn thành'}>
                                                        <QrCode className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {currentTask.status !== 'Hoàn thành' && (
                            <div className="flex justify-end mt-4">
                                <Button onClick={handleConfirmPutAway}>
                                    <Save className="mr-2 h-4 w-4"/>
                                    Xác nhận Xếp hàng
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
