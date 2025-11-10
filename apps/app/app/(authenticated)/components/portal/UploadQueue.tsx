"use client";
import * as React from "react";
import { Progress } from "@repo/design-system/components/ui/progress";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { MoreVertical, Pause, Play, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PeriodRequest } from "@/lib/types";

export type QueueItem = {
  id: string;
  name: string;
  size: number;
  relativePath?: string;
  status:
    | "presigning"
    | "uploading"
    | "verifying"
    | "processing"
    | "clean"
    | "quarantined"
    | "duplicate"
    | "failed";
  progress: number;
  error?: string;
  requestId?: string | null;
};

export function formatBytes(bytes: number) {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(val >= 10 ? 0 : 1)} ${sizes[i]}`;
}

export function UploadQueue({
  items,
  onAssign,
  onRemove,
  onRetry,
  requests,
}: {
  items: QueueItem[];
  onAssign: (id: string, requestId: string | null) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  requests: PeriodRequest[];
}) {
  return (
    <div className="mt-6">
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center">
          No files yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="truncate font-medium">{it.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {it.relativePath ? (
                      <span className="mr-2">{it.relativePath}</span>
                    ) : null}
                    {formatBytes(it.size)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      it.status === "clean"
                        ? "default"
                        : it.status === "processing"
                        ? "secondary"
                        : it.status === "uploading"
                        ? "secondary"
                        : it.status === "presigning"
                        ? "secondary"
                        : it.status === "quarantined"
                        ? "destructive"
                        : it.status === "duplicate"
                        ? "outline"
                        : it.status === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {it.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Assign to request</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onAssign(it.id, null)}>
                        None
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {requests.map((req) => (
                        <DropdownMenuItem
                          key={req.id}
                          onClick={() => onAssign(it.id, req.id)}
                        >
                          {req.title}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      {it.status === "failed" ? (
                        <DropdownMenuItem onClick={() => onRetry(it.id)}>
                          Retry
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onRemove(it.id)}
                          className="text-destructive"
                        >
                          Remove
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={Math.min(it.progress, 100)} />
              </div>
              {it.error ? (
                <div className="mt-2 text-xs text-destructive">{it.error}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
