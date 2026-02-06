'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WarehouseLocation } from '@/lib/types';

interface WarehouseMapProps {
  locations: WarehouseLocation[];
  highlightedCodes: string[];
  selectedCode: string;
  onSelect: (code: string) => void;
}

export function WarehouseMap({
  locations,
  highlightedCodes,
  selectedCode,
  onSelect,
}: WarehouseMapProps) {
  const locationsByArea = locations.reduce((acc, loc) => {
    (acc[loc.area] = acc[loc.area] || []).push(loc);
    return acc;
  }, {} as Record<string, WarehouseLocation[]>);

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
      {Object.entries(locationsByArea).map(([area, locs]) => (
        <Card key={area}>
          <CardHeader className="p-4">
            <CardTitle className="text-base">{area}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {locs.map((loc) => {
                const isHighlighted = highlightedCodes.includes(loc.code);
                const isSelected = selectedCode === loc.code;
                return (
                  <button
                    key={loc.id}
                    onClick={() => onSelect(loc.code)}
                    disabled={!isHighlighted}
                    className={cn(
                      'flex items-center justify-center p-2 h-12 rounded-md border text-xs font-semibold transition-colors',
                      'bg-muted/30 text-muted-foreground border-dashed',
                      isHighlighted && 'bg-blue-100 border-blue-400 text-blue-900 hover:bg-blue-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-blue-100',
                      isSelected && 'bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary disabled:hover:bg-primary',
                      !isHighlighted && 'opacity-50'
                    )}
                  >
                    {loc.code}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
