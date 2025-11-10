"use client";
import * as React from "react";
import { PeriodRequest } from "@/lib/types";
import { Badge } from "@repo/design-system/components/ui/badge";
import { cn } from "@/lib/utils";

export function RequestChecklist({
  items,
  onSelect,
  selectedId,
  counts,
}: {
  items: PeriodRequest[];
  onSelect?: (id: string | null) => void;
  selectedId?: string | null;
  counts?: Record<string, number>;
}) {
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onSelect?.(it.id)}
          className={cn(
            "w-full rounded-md border p-3 text-left hover:bg-muted/60 focus:bg-muted/60",
            selectedId === it.id && "border-foreground"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{it.title}</div>
              <div className="text-xs text-muted-foreground">
                {it.required ? "Required" : "Optional"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {typeof counts?.[it.id] === "number" ? (
                <span className="text-xs text-muted-foreground">
                  {counts?.[it.id]} doc(s)
                </span>
              ) : null}
              <Badge
                variant={
                  it.status === "approved"
                    ? "default"
                    : it.status === "received"
                    ? "secondary"
                    : "outline"
                }
              >
                {it.status}
              </Badge>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
