"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { MaterialEventDto } from "@/lib/types/lifecycle";
import { getEventTypeConfig } from "./lifecycle-event-type-config";

interface TimelineEventCardProps {
  event: MaterialEventDto;
  isLast?: boolean;
}

export function TimelineEventCard({ event, isLast = false }: TimelineEventCardProps) {
  const config = getEventTypeConfig(event.eventType);
  const Icon = config.icon;

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
      )}

      {/* Icon */}
      <div
        className={cn(
          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          config.bgColor
        )}
      >
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Badge variant="outline" className={cn("font-medium", config.color)}>
            {config.label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {format(new Date(event.eventDate), "dd/MM/yyyy HH:mm", { locale: vi })}
          </span>
        </div>

        <p className="text-sm font-medium mb-1">{event.description}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            Thực hiện: <span className="font-medium">{event.actorName}</span>
          </span>
          <span>
            Tham chiếu:{" "}
            <span className="font-mono text-foreground">{event.referenceCode}</span>
          </span>
        </div>

        {/* Metadata if present */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded p-2">
            {Object.entries(event.metadata).map(([key, value]) => (
              <span key={key} className="mr-3">
                {key}: <span className="font-medium">{String(value)}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
