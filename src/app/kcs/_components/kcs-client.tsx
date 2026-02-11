"use client";

import { useState, useMemo, useEffect } from "react";
import type { InboundReceipt } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Eye, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { KcsForm, type KcsFormValues } from "./kcs-form";

type KcsClientProps = {
  initialReceipts: InboundReceipt[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Vận hành Kho</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Kiểm tra Chất lượng (KCS)</span>
  </div>
);

export function KcsClient({ initialReceipts }: KcsClientProps) {
  const [receipts, setReceipts] = useState<InboundReceipt[]>(initialReceipts);
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<InboundReceipt | null>(null);

  const kcsPendingReceipts = useMemo(() => {
    return receipts.filter((receipt) => receipt.status === "KCS & Hồ sơ");
  }, [receipts]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(kcsPendingReceipts.length / itemsPerPage);
  const paginatedReceipts = kcsPendingReceipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, kcsPendingReceipts.length);

  const handleInspect = (receipt: InboundReceipt) => {
    setSelectedReceipt(receipt);
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = (values: KcsFormValues) => {
    if (!selectedReceipt) return;

    // Update the items in the receipt with the KCS results
    const updatedItems = selectedReceipt.items?.map(item => {
      const formItem = values.items.find(i => i.id === item.id);
      return formItem ? { ...item, kcsResult: formItem.kcsResult, kcsNotes: formItem.kcsNotes } : item;
    });
    
    const updatedReceipt: InboundReceipt = {
      ...selectedReceipt,
      items: updatedItems,
      status: "Chờ xếp hàng", // Transition to next state
      step: 3, // Update step in the process
    };

    setReceipts(receipts.map((r) => r.id === updatedReceipt.id ? updatedReceipt : r));
    setIsFormOpen(false);
    toast({
      title: "Hoàn tất KCS",
      description: `Phiếu nhập "${updatedReceipt.id}" đã được chuyển sang trạng thái "Chờ xếp hàng".`,
    });
  };

  return (
    <div className="w-full space-y-4">
      <PageHeader
        title="Kiểm tra Chất lượng (KCS)"
        breadcrumbs={<Breadcrumbs />}
        description="Xác nhận chất lượng và hồ sơ cho các lô hàng mới nhập."
      />

      <Card>
        <CardHeader>
            <CardTitle>Phiếu nhập chờ kiểm tra</CardTitle>
            <CardDescription>
                Có {kcsPendingReceipts.length} phiếu nhập đang chờ kiểm tra chất lượng và hồ sơ.
            </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SỐ PHIẾU</TableHead>
                <TableHead>NGÀY NHẬP</TableHead>
                <TableHead>ĐỐI TÁC (NCC)</TableHead>
                <TableHead>THAM CHIẾU (PO)</TableHead>
                <TableHead className="text-center">SỐ LƯỢNG MỤC</TableHead>
                <TableHead className="w-[150px]">THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReceipts.length > 0 ? (
                paginatedReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium text-primary">{receipt.id}</TableCell>
                    <TableCell>{format(new Date(receipt.inboundDate), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{receipt.partner}</TableCell>
                    <TableCell className="text-muted-foreground">{receipt.reference}</TableCell>
                    <TableCell className="text-center">{receipt.items?.length || 0}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleInspect(receipt)}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Kiểm tra
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Không có phiếu nhập nào cần kiểm tra.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {kcsPendingReceipts.length > 0 ? startItem : 0}-{endItem} trên {kcsPendingReceipts.length} bản ghi
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Kiểm tra chất lượng & Hồ sơ: {selectedReceipt?.id}</DialogTitle>
          </DialogHeader>
          <KcsForm
            receipt={selectedReceipt}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
