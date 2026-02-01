"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface LifecycleFilterBarProps {
  onFilter: (filters: { fromDate?: string; toDate?: string }) => void;
  isLoading?: boolean;
}

export function LifecycleFilterBar({ onFilter, isLoading }: LifecycleFilterBarProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const handleApplyFilter = () => {
    onFilter({
      fromDate: fromDate?.toISOString(),
      toDate: toDate?.toISOString(),
    });
  };

  const handleClearFilter = () => {
    setFromDate(undefined);
    setToDate(undefined);
    onFilter({});
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Bộ lọc</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* From Date */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Từ ngày</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                size="sm"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                locale={vi}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* To Date */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Đến ngày</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                size="sm"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={toDate}
                onSelect={setToDate}
                locale={vi}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={handleApplyFilter}
            disabled={isLoading}
            className="flex-1"
          >
            Lọc
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearFilter}
            disabled={isLoading}
          >
            Xóa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
