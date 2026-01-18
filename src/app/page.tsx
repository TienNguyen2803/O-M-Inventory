import {
  ArrowUp,
  CircleDollarSign,
  Download,
  FileText,
  FlaskConical,
  Package,
  ShieldCheck,
  Snowflake,
  AlertTriangle as Warning,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { getMaterials } from "@/lib/data";
import { DashboardCharts } from "./_components/dashboard-charts";

export default async function DashboardPage() {
  const materials = await getMaterials();
  const lowStockMaterials = materials.filter((m) => m.stock < 100).slice(0, 5);

  const tasks = [
    {
      id: "PR-005",
      type: "Duyệt Yêu cầu",
      details: "Từ: PX Vận hành 2 • Khẩn cấp",
      action: "Xử lý",
      initials: "PR",
      color: "bg-yellow-500",
      buttonVariant: "default" as const,
      buttonClass: "bg-yellow-500 hover:bg-yellow-600 text-yellow-950",
    },
    {
      id: "PO-2025-130",
      type: "Nhập kho",
      details: "NCC: Schneider • 2 items",
      action: "Nhập",
      initials: "IN",
      color: "bg-blue-500",
      buttonVariant: "default" as const,
      buttonClass: "",
    },
    {
      id: "KK-2025-Q3",
      type: "Duyệt KK",
      details: "Chênh lệch: -2 mã",
      action: "Xem",
      initials: "KK",
      color: "bg-purple-500",
      buttonVariant: "outline" as const,
      buttonClass: "",
    },
  ];

  const warehouseStatus = [
    {
      name: "Khu A (Vật tư)",
      usage: 65,
      icon: Package,
      color: "text-green-500",
    },
    { name: "Khu B (Dụng cụ)", usage: 85, icon: Wrench, color: "text-yellow-500" },
    {
      name: "Kho Lạnh",
      usage: 40,
      icon: Snowflake,
      color: "text-blue-500",
    },
    {
      name: "Kho Hóa chất",
      usage: 20,
      icon: FlaskConical,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-2">
      <PageHeader
        title="Dashboard Quản lý Kho"
        description="Tổng hợp tình hình hoạt động kho Phú Mỹ"
      >
        <div className="flex items-center space-x-2">
          <Select defaultValue="this-month">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">Tháng này</SelectItem>
              <SelectItem value="last-month">Tháng trước</SelectItem>
              <SelectItem value="last-3-months">3 tháng qua</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </PageHeader>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase">
              Tổng giá trị tồn kho
            </CardTitle>
            <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145.2 Tỷ VNĐ</div>
            <p className="flex items-center gap-1 text-xs text-green-600">
              <ArrowUp className="h-3 w-3" />
              5.2% so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase">
              Cảnh báo tồn kho thấp
            </CardTitle>
            <Warning className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 Mã</div>
            <p className="text-xs text-muted-foreground">Cần đặt hàng gấp</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase">
              Yêu cầu chờ duyệt
            </CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">08 Phiếu</div>
            <p className="text-xs text-muted-foreground">
              Trong đó 3 Khẩn cấp
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase">
              Độ chính xác tồn kho
            </CardTitle>
            <ShieldCheck className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">
              Đạt mục tiêu (&gt;98%)
            </p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts />

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">
              Vật tư chiến lược (Thấp)
            </CardTitle>
            <Button variant="link" size="sm" className="p-0 h-auto">
              Xem tất cả
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã VT</TableHead>
                  <TableHead>Tên VT</TableHead>
                  <TableHead className="text-right">Tồn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockMaterials.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs">{item.code}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-red-600">{item.stock.toLocaleString()}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Tác vụ cần xử lý
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-2">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${task.color}`}
                >
                  <span className="font-bold">{task.initials}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{`${task.type} ${task.id}`}</p>
                  <p className="text-sm text-muted-foreground">
                    {task.details}
                  </p>
                </div>
                <Button
                  variant={task.buttonVariant}
                  size="sm"
                  className={task.buttonClass}
                >
                  {task.action}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Trạng thái sức chứa kho
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {warehouseStatus.map((item) => (
              <div key={item.name} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{item.name}</p>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="mt-2">
                   <p className="text-lg font-bold">{item.usage}%</p>
                   <Progress value={item.usage} className="h-2 mt-1" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
