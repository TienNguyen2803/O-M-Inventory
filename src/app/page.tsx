import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMaterials } from "@/lib/data";
import type { Material } from "@/lib/types";
import { Package, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const materials = await getMaterials();
  const lowStockThreshold = 50;
  const criticalStockThreshold = 15;
  const lowStockItems = materials.filter(
    (m) => m.stock < lowStockThreshold
  ).length;

  const StockStatus = ({ stock }: { stock: number }) => {
    if (stock < criticalStockThreshold) {
      return (
        <Badge variant="destructive" className="flex items-center gap-2">
          <AlertTriangle className="h-3 w-3" />
          Rất thấp
        </Badge>
      );
    }
    if (stock < lowStockThreshold) {
      return (
        <Badge className="flex items-center gap-2 bg-yellow-500 text-yellow-950 hover:bg-yellow-500/80">
          <AlertTriangle className="h-3 w-3" />
          Thấp
        </Badge>
      );
    }
    return (
      <Badge className="flex items-center gap-2 bg-green-500 text-green-950 hover:bg-green-500/80">
        <CheckCircle className="h-3 w-3" />
        Đủ
      </Badge>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title="Tổng quan"
        description="Báo cáo tổng quan về tình hình vật tư trong kho."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số loại vật tư
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
            <p className="text-xs text-muted-foreground">loại vật tư khác nhau</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vật tư sắp hết</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Dưới ngưỡng {lowStockThreshold} đơn vị
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tồn kho</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên vật tư</TableHead>
                <TableHead>Mã vật tư</TableHead>
                <TableHead className="text-right">Tồn kho</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material: Material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {material.code}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {material.stock.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {material.unit}
                  </TableCell>
                  <TableCell>
                    <StockStatus stock={material.stock} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
