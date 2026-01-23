"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Archive } from "lucide-react";
import type { Material } from "@/lib/types";

interface ItemDetailsProps {
  material: Material;
}

const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex justify-between text-sm py-1.5 border-b border-dashed">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right">{value || '---'}</span>
  </div>
);

export function ItemDetails({ material }: ItemDetailsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Archive className="h-8 w-8 text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg">{material.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {material.nameEn}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Cơ bản - Tồn kho</TabsTrigger>
            <TabsTrigger value="details">Chi tiết & Xuất xứ</TabsTrigger>
          </TabsList>
          <TabsContent value="basic" className="mt-4 space-y-4">
            <DetailRow label="Mã hàng (PN)" value={material.partNo} />
            <DetailRow label="Số serial (SN)" value={material.serialNumber} />
            <DetailRow label="Hãng" value={material.manufacturer} />
            <DetailRow label="Vị trí" value={material.location} />
            <DetailRow label="Tuổi tồn" value={material.stockAge} />
            <DetailRow label="Bảo hành của NCC" value={material.supplierWarranty} />
            <DetailRow label="Bảo hành dịch vụ của NCC" value={material.serviceWarranty} />

            <div className="pt-4">
                <h4 className="font-semibold text-sm mb-2">Thông số thống kê</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <Card className="p-3">
                        <p className="text-xs text-muted-foreground">Số lần bảo hành/sửa chữa</p>
                        <p className="font-bold text-lg">{material.warrantyCount}</p>
                    </Card>
                     <Card className="p-3">
                        <p className="text-xs text-muted-foreground">Tuổi thọ tài sản</p>
                        <p className="font-bold text-lg">{material.lifespan}</p>
                    </Card>
                 </div>
            </div>
          </TabsContent>
          <TabsContent value="details" className="mt-4 space-y-2">
             <DetailRow label="Chassis PN" value={material.chassisPn} />
             <DetailRow label="Chassis SN" value={material.chassisSn} />
             <DetailRow label="Xuất xứ theo yêu cầu khách hàng" value={material.originAsPerCustomer} />
             <DetailRow label="Xuất xứ chứng từ" value={material.originOnDocs} />
             <DetailRow label="Xuất xứ thực tế" value={material.origin} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
