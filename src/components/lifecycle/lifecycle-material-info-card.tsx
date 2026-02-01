"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, Hash, Layers } from "lucide-react";
import type { MaterialInfo, LocationInfo } from "@/lib/types/lifecycle";

interface MaterialInfoCardProps {
  material: MaterialInfo;
  currentLocation: LocationInfo;
}

export function MaterialInfoCard({
  material,
  currentLocation,
}: MaterialInfoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          Thông tin vật tư
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Material basic info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mã vật tư</span>
            <span className="font-mono font-medium">{material.code}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm text-muted-foreground shrink-0">Tên</span>
            <span className="font-medium text-right">{material.name}</span>
          </div>
          {material.serialNumber && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Serial
              </span>
              <span className="font-mono text-sm">{material.serialNumber}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Part No</span>
            <span className="font-mono text-sm">{material.partNo}</span>
          </div>
        </div>

        {/* Category and unit */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            {material.category.name}
          </Badge>
          <Badge variant="secondary">{material.unit.name}</Badge>
          <Badge
            style={{
              backgroundColor: material.status.color || undefined,
              color: material.status.color ? "#fff" : undefined,
            }}
          >
            {material.status.name}
          </Badge>
        </div>

        {/* Current location */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Vị trí hiện tại
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="font-medium">{currentLocation.name}</div>
            {currentLocation.slotInfo && (
              <div className="text-sm text-muted-foreground">
                Slot: {currentLocation.slotInfo}
              </div>
            )}
            {currentLocation.type === "installed" && currentLocation.installedBy && (
              <div className="text-xs text-muted-foreground mt-1">
                Lắp đặt bởi: {currentLocation.installedBy.name}
              </div>
            )}
            <Badge
              variant={
                currentLocation.type === "installed"
                  ? "default"
                  : currentLocation.type === "warehouse"
                  ? "secondary"
                  : "outline"
              }
              className="mt-2"
            >
              {currentLocation.type === "installed"
                ? "Đã lắp đặt"
                : currentLocation.type === "warehouse"
                ? "Trong kho"
                : "Chưa xác định"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
