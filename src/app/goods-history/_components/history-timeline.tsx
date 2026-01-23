"use client";

import {
  ShoppingCart,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  Hourglass,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GoodsHistoryEvent } from "@/lib/types";

interface HistoryTimelineProps {
  history: GoodsHistoryEvent[];
}

const eventConfig = {
  'outbound-warranty-return': { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  'inbound-rma': { icon: ArrowDownCircle, color: "text-blue-600", bg: "bg-blue-50" },
  'outbound-rma': { icon: ArrowUpCircle, color: "text-orange-600", bg: "bg-orange-50" },
  'outbound-customer': { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  'inbound-po': { icon: ShoppingCart, color: "text-gray-600", bg: "bg-gray-100" },
};

export function HistoryTimeline({ history }: HistoryTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử hàng hóa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
          
          <div className="space-y-8">
            {history.map((event, index) => {
              const config = eventConfig[event.type];
              const Icon = config.icon;
              const isLast = index === history.length -1;

              return (
                <div key={event.id} className="relative">
                  <div className="relative flex items-start gap-4">
                    {/* Icon */}
                    <div className="absolute left-0 top-0 -translate-x-1/2 flex items-center justify-center bg-background">
                      <span className={cn("relative z-10 flex h-6 w-6 items-center justify-center rounded-full", config.bg, config.color)}>
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 rounded-md border p-3 ml-10 bg-card">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="mt-3 space-y-3">
                        {event.subEvents.map((sub) => (
                           <div key={sub.step} className="flex items-start gap-3">
                                <div className={cn(
                                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                    sub.step === 4 ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                                )}>
                                    {sub.step === 4 ? <Check className="w-4 h-4"/> : sub.step}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <p className="font-medium">
                                            {sub.title}
                                            {sub.refId && <Button variant="link" size="sm" className="p-1 h-auto text-primary">({sub.refId})</Button>}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{new Date(sub.timestamp).toLocaleString("vi-VN")}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Người thực hiện: {sub.actor}</p>
                                </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {!isLast && (
                    <div className="absolute left-[25px] top-14 h-[5rem] flex items-center justify-center my-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background px-2">
                            <Hourglass className="h-3 w-3" />
                            <span>6 tháng</span>
                        </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
