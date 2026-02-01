"use client";

import * as React from "react";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Material, MasterDataItem } from "@/lib/types";

interface MaterialPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: Material[];
  onSelect: (material: Material, quantity: number) => void;
  selectedMaterialIds?: string[];
}

export function MaterialPickerDialog({
  open,
  onOpenChange,
  materials,
  onSelect,
  selectedMaterialIds = [],
}: MaterialPickerDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Filter materials based on search query
  const filteredMaterials = materials.filter((material) => {
    const query = searchQuery.toLowerCase();
    return (
      material.code.toLowerCase().includes(query) ||
      material.name.toLowerCase().includes(query) ||
      (material.partNo?.toLowerCase() || "").includes(query)
    );
  });

  const handleQuantityChange = (materialId: string, value: string) => {
    const qty = parseInt(value) || 0;
    setQuantities((prev) => ({ ...prev, [materialId]: qty }));
  };

  const handleSelect = (material: Material) => {
    const qty = quantities[material.id] || 1;
    onSelect(material, qty);
    // Reset quantity for this material
    setQuantities((prev) => ({ ...prev, [material.id]: 0 }));
  };

  const isAlreadySelected = (materialId: string) => {
    return selectedMaterialIds.includes(materialId);
  };

  const getUnitName = (material: Material): string => {
    if (!material.materialUnit) return "-";
    if (typeof material.materialUnit === "object") {
      return (material.materialUnit as MasterDataItem).name || "-";
    }
    return String(material.materialUnit);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Chọn Vật tư</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã, tên vật tư, part number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Materials table */}
          <div className="rounded-md border max-h-[50vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[120px]">Mã VT</TableHead>
                  <TableHead>Tên Vật Tư</TableHead>
                  <TableHead className="w-[120px]">Part Number</TableHead>
                  <TableHead className="w-[80px]">ĐVT</TableHead>
                  <TableHead className="w-[80px] text-right">Tồn Kho</TableHead>
                  <TableHead className="w-[100px] text-center">SL YC</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Không tìm thấy vật tư nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaterials.map((material) => (
                    <TableRow
                      key={material.id}
                      className={
                        isAlreadySelected(material.id) ? "opacity-50" : ""
                      }
                    >
                      <TableCell className="font-medium">
                        {material.code}
                      </TableCell>
                      <TableCell>{material.name}</TableCell>
                      <TableCell>{material.partNo || "-"}</TableCell>
                      <TableCell>{getUnitName(material)}</TableCell>
                      <TableCell className="text-right">
                        {material.stock || 0}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          value={quantities[material.id] || ""}
                          onChange={(e) =>
                            handleQuantityChange(material.id, e.target.value)
                          }
                          placeholder="1"
                          className="h-8 text-center"
                          disabled={isAlreadySelected(material.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSelect(material)}
                          disabled={isAlreadySelected(material.id)}
                          className="h-8 px-2"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredMaterials.length} / {materials.length} vật tư
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
