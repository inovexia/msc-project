"use client";
import * as React from "react";
import { Document, PeriodRequest } from "@/lib/types";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

export function DocumentTable({
  documents,
  requests,
  onAssign,
  onSelect,
  selectedId,
}: {
  documents: Document[];
  requests: PeriodRequest[];
  onAssign: (docId: string, requestId: string | null) => void;
  onSelect: (docId: string) => void;
  selectedId?: string | null;
}) {
  return (
    <div className="rounded-md border">
      <table className="w-full table-fixed">
        <thead className="bg-muted/50">
          <tr className="text-sm">
            <th className="p-2 w-[38%] text-left font-medium">Filename</th>
            <th className="p-2 w-[10%] text-left font-medium">Vendor</th>
            <th className="p-2 w-[10%] text-left font-medium">Date</th>
            <th className="p-2 w-[10%] text-left font-medium">Amount</th>
            <th className="p-2 w-[14%] text-left font-medium">Request</th>
            <th className="p-2 w-[10%] text-left font-medium">Status</th>
            <th className="p-2 w-[8%] text-right font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((d) => {
            const req = requests.find(
              (r) => r.id === d.periodRequestId || r.id === (d as any).requestId
            );
            const selected = d.id === selectedId;
            const status =
              d.status === "processing"
                ? "Processing"
                : d.status === "clean"
                ? "Clean"
                : d.status === "quarantined"
                ? "Quarantined"
                : d.status === "duplicate"
                ? "Duplicate"
                : d.status === "failed"
                ? "Failed"
                : "Uploaded";

            return (
              <tr
                key={d.id}
                className={`text-sm border-t hover:bg-muted/50 ${
                  selected ? "bg-muted/60" : ""
                }`}
                onClick={() => onSelect(d.id)}
              >
                <td className="p-2 truncate">{d.filename}</td>
                <td className="p-2 truncate">{d.extracted?.vendor ?? "-"}</td>
                <td className="p-2 truncate">
                  {d.extracted?.date
                    ? format(new Date(d.extracted?.date), "yyyy-MM-dd")
                    : "-"}
                </td>
                <td className="p-2 truncate">
                  {typeof d.extracted?.amount === "number"
                    ? d.extracted?.amount.toFixed(2)
                    : "-"}
                </td>
                <td className="p-2 truncate">{req?.title ?? "-"}</td>
                <td className="p-2">
                  <Badge
                    variant={
                      d.status === "clean"
                        ? "default"
                        : d.status === "duplicate"
                        ? "outline"
                        : d.status === "quarantined"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {status}
                  </Badge>
                </td>
                <td className="p-2 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssign(d.id, null);
                        }}
                      >
                        Remove request
                      </DropdownMenuItem>
                      {requests.map((r) => (
                        <DropdownMenuItem
                          key={r.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssign(d.id, r.id);
                          }}
                        >
                          Assign to {r.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
