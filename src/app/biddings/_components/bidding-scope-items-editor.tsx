"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  TableFooter,
} from "@/components/ui/table";
import type { MasterDataItem } from "@/lib/types";

export interface ScopeItem {
  id?: string;
  materialId?: string;
  name: string;
  unitId: string;
  unit?: MasterDataItem;
  quantity: number;
  estimatedAmount: number;
}

interface BiddingScopeItemsEditorProps {
  items: ScopeItem[];
  onChange: (items: ScopeItem[]) => void;
  viewMode?: boolean;
}

export function BiddingScopeItemsEditor({
  items,
  onChange,
  viewMode = false,
}: BiddingScopeItemsEditorProps) {
  const [units, setUnits] = useState<MasterDataItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<ScopeItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<ScopeItem>({
    name: "",
    unitId: "",
    quantity: 0,
    estimatedAmount: 0,
  });

  // Fetch units master data
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch('/api/master-data/material-unit');
        if (res.ok) {
          const data = await res.json();
          setUnits(data.items || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };
    fetchUnits();
  }, []);

  const getUnitName = (unitId: string, unit?: MasterDataItem) => {
    if (unit?.name) return unit.name;
    const found = units.find(u => u.id === unitId);
    return found?.name || unitId;
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.estimatedAmount || 0), 0);

  const handleAddNew = () => {
    setIsAdding(true);
    setNewItem({
      name: "",
      unitId: "",
      quantity: 0,
      estimatedAmount: 0,
    });
  };

  const handleSaveNew = () => {
    if (!newItem.name || !newItem.unitId) return;
    
    const itemWithUnit = {
      ...newItem,
      id: `temp-${Date.now()}`,
      unit: units.find(u => u.id === newItem.unitId),
    };
    
    onChange([...items, itemWithUnit]);
    setIsAdding(false);
    setNewItem({ name: "", unitId: "", quantity: 0, estimatedAmount: 0 });
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewItem({ name: "", unitId: "", quantity: 0, estimatedAmount: 0 });
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditItem({ ...items[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editItem) return;
    
    const updatedItems = [...items];
    updatedItems[editingIndex] = {
      ...editItem,
      unit: units.find(u => u.id === editItem.unitId),
    };
    
    onChange(updatedItems);
    setEditingIndex(null);
    setEditItem(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditItem(null);
  };

  const handleDelete = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onChange(updatedItems);
  };

  return (
    <div className="space-y-3">
      {/* Add Button */}
      {!viewMode && !isAdding && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleAddNew}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            Thêm hạng mục
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[35%] font-semibold">HẠNG MỤC</TableHead>
              <TableHead className="w-[15%] font-semibold">ĐVT</TableHead>
              <TableHead className="w-[15%] text-right font-semibold">KHỐI LƯỢNG</TableHead>
              <TableHead className="w-[20%] text-right font-semibold">THÀNH TIỀN</TableHead>
              {!viewMode && (
                <TableHead className="w-[15%] text-center font-semibold">THAO TÁC</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Existing Items */}
            {items.map((item, index) => (
              <TableRow key={item.id || index}>
                {editingIndex === index && editItem ? (
                  // Edit Mode
                  <>
                    <TableCell>
                      <Input
                        value={editItem.name}
                        onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                        placeholder="Tên hạng mục"
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={editItem.unitId}
                        onValueChange={(value) => setEditItem({ ...editItem, unitId: value })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Chọn" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editItem.quantity}
                        onChange={(e) => setEditItem({ ...editItem, quantity: Number(e.target.value) })}
                        className="h-8 text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editItem.estimatedAmount}
                        onChange={(e) => setEditItem({ ...editItem, estimatedAmount: Number(e.target.value) })}
                        className="h-8 text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={handleSaveEdit}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  // View Mode
                  <>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{getUnitName(item.unitId, item.unit)}</TableCell>
                    <TableCell className="text-right">{item.quantity?.toLocaleString('vi-VN')}</TableCell>
                    <TableCell className="text-right">{item.estimatedAmount?.toLocaleString('vi-VN')}</TableCell>
                    {!viewMode && (
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleEdit(index)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </>
                )}
              </TableRow>
            ))}

            {/* New Item Row */}
            {isAdding && (
              <TableRow className="bg-blue-50/50">
                <TableCell>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Nhập tên hạng mục..."
                    className="h-8"
                    autoFocus
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={newItem.unitId}
                    onValueChange={(value) => setNewItem({ ...newItem, unitId: value })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Chọn ĐVT" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newItem.quantity || ""}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    placeholder="0"
                    className="h-8 text-right"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newItem.estimatedAmount || ""}
                    onChange={(e) => setNewItem({ ...newItem, estimatedAmount: Number(e.target.value) })}
                    placeholder="0"
                    className="h-8 text-right"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={handleSaveNew}
                      disabled={!newItem.name || !newItem.unitId}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                      onClick={handleCancelAdd}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Empty State */}
            {items.length === 0 && !isAdding && (
              <TableRow>
                <TableCell colSpan={viewMode ? 4 : 5} className="text-center text-muted-foreground py-8">
                  Chưa có hạng mục nào. {!viewMode && "Nhấn \"Thêm hạng mục\" để bắt đầu."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-muted/30">
              <TableCell colSpan={viewMode ? 3 : 3} className="text-right font-bold">
                Tổng cộng
              </TableCell>
              <TableCell className="text-right font-bold text-primary">
                {totalAmount.toLocaleString('vi-VN')}
              </TableCell>
              {!viewMode && <TableCell />}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
