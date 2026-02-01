"use client";

import { useState, useCallback } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MaterialInfoCard,
  LifecycleTimeline,
  LifecycleFilterBar,
} from "@/components/lifecycle";
import type { MaterialLifecycleResponse } from "@/lib/types/lifecycle";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Vận hành Kho</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Truy vết Vòng đời</span>
  </div>
);

export function LifecycleClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [materialId, setMaterialId] = useState<string | null>(null);
  const [lifecycleData, setLifecycleData] = useState<MaterialLifecycleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ fromDate?: string; toDate?: string }>({});
  const [offset, setOffset] = useState(0);

  // Search for material by code or serial number
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setLifecycleData(null);
    setMaterialId(null);

    try {
      // First, find the material by code or serial number
      const materialRes = await fetch(
        `/api/materials?search=${encodeURIComponent(searchQuery.trim())}&limit=1`
      );
      const materialData = await materialRes.json();

      if (!materialData.data || materialData.data.length === 0) {
        setError("Không tìm thấy vật tư với mã hoặc serial đã nhập");
        setIsLoading(false);
        return;
      }

      const foundMaterial = materialData.data[0];
      setMaterialId(foundMaterial.id);

      // Fetch lifecycle data
      await fetchLifecycle(foundMaterial.id, 0, filters);
    } catch (err) {
      console.error("Search error:", err);
      setError("Có lỗi xảy ra khi tìm kiếm");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch lifecycle data for a material
  const fetchLifecycle = useCallback(
    async (
      matId: string,
      newOffset: number,
      filterParams: { fromDate?: string; toDate?: string }
    ) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          limit: "20",
          offset: String(newOffset),
        });
        if (filterParams.fromDate) params.set("fromDate", filterParams.fromDate);
        if (filterParams.toDate) params.set("toDate", filterParams.toDate);

        const res = await fetch(`/api/materials/${matId}/lifecycle?${params}`);
        if (!res.ok) {
          throw new Error("Failed to fetch lifecycle");
        }
        const data: MaterialLifecycleResponse = await res.json();
        setLifecycleData(data);
        setOffset(newOffset);
      } catch (err) {
        console.error("Lifecycle fetch error:", err);
        setError("Có lỗi xảy ra khi tải lịch sử vòng đời");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Handle filter changes
  const handleFilter = (newFilters: { fromDate?: string; toDate?: string }) => {
    setFilters(newFilters);
    if (materialId) {
      fetchLifecycle(materialId, 0, newFilters);
    }
  };

  // Handle pagination
  const handlePageChange = (newOffset: number) => {
    if (materialId) {
      fetchLifecycle(materialId, newOffset, filters);
    }
  };

  // Reset search
  const handleReset = () => {
    setMaterialId(null);
    setLifecycleData(null);
    setError(null);
    setSearchQuery("");
    setFilters({});
    setOffset(0);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Truy vết Vòng đời Vật tư"
        description="Tra cứu lịch sử từ Yêu cầu đến Vận hành"
        breadcrumbs={<Breadcrumbs />}
      />

      {/* Search bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex w-full max-w-lg items-center space-x-2">
            {lifecycleData && (
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Input
              type="text"
              placeholder="Nhập Serial / Batch / Mã Vật tư..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={isLoading}
            />
            <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
              <Search className="mr-2 h-4 w-4" />
              Tra cứu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && !lifecycleData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-6 w-48" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Results */}
      {lifecycleData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Left Column - Material info and filters */}
          <div className="space-y-4">
            <MaterialInfoCard
              material={lifecycleData.material}
              currentLocation={lifecycleData.currentLocation}
            />
            <LifecycleFilterBar onFilter={handleFilter} isLoading={isLoading} />
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-2">
            <LifecycleTimeline
              events={lifecycleData.timeline}
              pagination={lifecycleData.pagination}
              isLoading={isLoading}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
