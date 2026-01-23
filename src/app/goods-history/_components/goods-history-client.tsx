"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ItemDetails } from "./item-details";
import { HistoryTimeline } from "./history-timeline";
import { getGoodsHistory } from "@/lib/data";
import type { Material, GoodsHistoryEvent } from "@/lib/types";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Vận hành Kho</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Lịch sử Hàng hóa</span>
  </div>
);

export function GoodsHistoryClient() {
  const [searchQuery, setSearchQuery] = useState("39X00139M41734000013");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ material?: Material; history?: GoodsHistoryEvent[] } | null>(null);

  const handleSearch = async () => {
    if (searchQuery.trim() === "") return;
    setIsLoading(true);
    setResult(null);
    const data = await getGoodsHistory(searchQuery.trim());
    setResult(data);
    setIsLoading(false);
  };
  
  // Initial search on component mount
  useState(() => {
    handleSearch();
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Lịch sử Hàng hóa"
        description="Tra cứu toàn bộ vòng đời và các sự kiện liên quan đến một vật tư theo Serial Number."
        breadcrumbs={<Breadcrumbs />}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex w-full max-w-md items-center space-x-2">
            <Input
              type="text"
              placeholder="Nhập Serial Number..."
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
              Tra cứu
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {result && result.material && result.history && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-1 space-y-4 sticky top-4">
                <ItemDetails material={result.material} />
            </div>

            <div className="lg:col-span-2">
                <HistoryTimeline history={result.history} />
            </div>
        </div>
      )}
      
      {result && !result.material && !isLoading &&(
         <Card className="mt-4">
            <CardContent className="pt-6 text-center text-muted-foreground">
                Không tìm thấy vật tư với Serial Number đã nhập.
            </CardContent>
        </Card>
      )}
    </div>
  );
}
