"use client";

import { useState } from "react";
import {
  Package,
  Wrench,
  ShoppingCart,
  Truck,
  ClipboardCheck,
  ThumbsUp,
  MapPin,
  Cpu,
  Search,
  CheckCircle,
  FileText,
  Warehouse,
  PackageCheck,
  Factory,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const timelineData = [
    {
    icon: CheckCircle,
    iconColor: "bg-green-100 text-green-600",
    title: "Lắp đặt & Đưa vào Vận hành",
    description: "Lắp đặt thay thế card lỗi tại tủ L3. Chạy thử đạt yêu cầu. Người thực hiện: Nguyễn Văn A (PX Tự động)",
    timestamp: "21/08/2025 09:30",
    highlight: true,
  },
  {
    icon: Truck,
    iconColor: "bg-blue-100 text-blue-600",
    title: "Xuất kho Vật tư",
    description: "Xuất kho theo phiếu PXK-2025-088. Lý do: Thay thế định kỳ. Thủ kho: Trần Văn Kho",
    timestamp: "20/08/2025 14:15",
  },
  {
    icon: ClipboardCheck,
    iconColor: "bg-purple-100 text-purple-600",
    title: "Kiểm tra Chất lượng (KCS)",
    description: "Đánh giá chất lượng: ĐẠT. Hồ sơ CO/CQ đầy đủ. Người kiểm: Ban nghiệm thu",
    timestamp: "15/08/2025 10:00",
  },
  {
    icon: Warehouse,
    iconColor: "bg-sky-100 text-sky-600",
    title: "Nhập kho (GRN)",
    description: "Nhập kho theo phiếu PNK-2025-001 (PO-2025-112). Vị trí lưu: A1-02-05.",
    timestamp: "15/08/2025 08:30",
  },
  {
    icon: PackageCheck,
    iconColor: "bg-gray-100 text-gray-600",
    title: "Đặt hàng (PO Issued)",
    description: "Phát hành đơn hàng PO-2025-112 cho nhà thầu Siemens Energy Global.",
    timestamp: "01/07/2025",
  },
    {
    icon: ThumbsUp,
    iconColor: "bg-gray-100 text-gray-600",
    title: "Phê duyệt Yêu cầu",
    description: "Đã được phê duyệt bởi Trưởng phòng Kỹ thuật.",
    timestamp: "20/06/2025",
  },
  {
    icon: FileText,
    iconColor: "bg-gray-100 text-gray-600",
    title: "Nhu cầu Vật tư (Request)",
    description: "Tạo phiếu yêu cầu PR-2025-002. Người đề nghị: Nguyễn Văn A (PX Vận hành 1).",
    timestamp: "15/06/2025",
  },
];

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Vận hành Kho</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Truy vết Vòng đời</span>
  </div>
);

export function LifecycleClient() {
  const [searchQuery, setSearchQuery] = useState("SIEMENS-2025-999");
  const [showResults, setShowResults] = useState(true);

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      setShowResults(true);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Truy vết Vòng đời Vật tư"
        description="Tra cứu lịch sử từ Yêu cầu đến Vận hành"
        breadcrumbs={<Breadcrumbs />}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex w-full max-w-md items-center space-x-2">
            <Input
              type="text"
              placeholder="Nhập Serial / Batch / Mã Vật tư..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Tra cứu
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {showResults && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                         <div className="p-3 rounded-lg bg-primary/10">
                             <Cpu className="h-8 w-8 text-primary" />
                         </div>
                         <div>
                            <CardTitle className="text-lg">Card Điều Khiển PLC</CardTitle>
                            <p className="text-sm text-muted-foreground">SN: SIEMENS-2025-999</p>
                         </div>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="outline" className="text-green-600 border-green-600/50 bg-green-50">ĐANG VẬN HÀNH</Badge>
                        <div className="mt-4 space-y-2 text-sm">
                           <div className="flex justify-between">
                                <span className="text-muted-foreground">Mã Vật tư (EVN)</span>
                                <span className="font-medium">5.12.99.102</span>
                           </div>
                           <div className="flex justify-between">
                                <span className="text-muted-foreground">Nhà sản xuất</span>
                                <span className="font-medium">Siemens Energy</span>
                           </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Xuất xứ</span>
                                <span className="font-medium">Germany</span>
                           </div>
                           <div className="flex justify-between">
                                <span className="text-muted-foreground">Ngày nhập kho</span>
                                <span className="font-medium">15/08/2025</span>
                           </div>
                           <div className="flex justify-between">
                                <span className="text-muted-foreground">Hạn bảo hành</span>
                                <span className="font-medium text-red-600">15/08/2027</span>
                           </div>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <MapPin className="h-5 w-5 text-muted-foreground" />
                           Vị trí Lắp đặt Hiện tại
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-primary">Tổ máy GT11 - Nhà máy Phú Mỹ 1</div>
                        <p className="text-muted-foreground">Tủ điều khiển Local L3 (Rack 2, Slot 5)</p>
                        <p className="text-xs text-muted-foreground/80 mt-2">Cập nhật lần cuối: 21/08/2025 bởi Kỹ sư Tự động hóa</p>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column (Timeline) */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Lịch sử Vòng đời (Lifecycle Timeline)</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="relative pl-6">
                            {/* Vertical Line */}
                             <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
                            
                             <div className="space-y-6">
                                {timelineData.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div key={index} className="relative flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="absolute left-0 top-0 -translate-x-1/2 flex items-center justify-center">
                                            <span className="absolute h-8 w-8 rounded-full bg-border"></span>
                                            <span className={cn("relative z-10 flex h-6 w-6 items-center justify-center rounded-full", item.iconColor)}>
                                                <Icon className="h-4 w-4" />
                                            </span>
                                        </div>
                                        
                                        {/* Content */}
                                        <div className={cn("flex-1 rounded-md border p-3 ml-10", item.highlight ? "bg-green-50/50 border-green-200/80" : "bg-card")}>
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold">{item.title}</p>
                                                <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                        </div>
                                    </div>
                                );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}
