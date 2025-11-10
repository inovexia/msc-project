"use client";
import * as React from "react";
import { Document, PeriodRequest } from "@/lib/types";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle2, XCircle, AlertTriangle, Eye } from "lucide-react";
import { format } from "date-fns";

type DocumentAction = "approve" | "reject" | "flag";

export function DocumentTable({
  documents,
  requests,
  onAssign,
  onSelect,
  onApprove,
  onReject,
  onFlag,
  selectedId,
}: {
  documents: Document[];
  requests: PeriodRequest[];
  onAssign: (docId: string, requestId: string | null) => void;
  onSelect: (docId: string) => void;
  onApprove?: (docId: string) => void;
  onReject?: (docId: string) => void;
  onFlag?: (docId: string) => void;
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

            // Enhanced status mapping with approval states
            const approvalStatus = (d as any).approvalStatus || "pending";
            const displayStatus =
              approvalStatus === "approved"
                ? "Approved"
                : approvalStatus === "rejected"
                ? "Rejected"
                : approvalStatus === "flagged"
                ? "Flagged"
                : d.status === "processing"
                ? "Processing"
                : d.status === "clean"
                ? "Review"
                : d.status === "quarantined"
                ? "Quarantined"
                : d.status === "duplicate"
                ? "Duplicate"
                : d.status === "failed"
                ? "Failed"
                : "Uploaded";

            const canApprove = d.status === "clean" && approvalStatus === "pending";
            const canReject = approvalStatus !== "rejected";
            const canFlag = approvalStatus !== "flagged";

            return (
              <tr
                key={d.id}
                className={`text-sm border-t hover:bg-muted/50 cursor-pointer ${
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
                    ? `$${d.extracted?.amount.toFixed(2)}`
                    : "-"}
                </td>
                <td className="p-2 truncate">{req?.title ?? "-"}</td>
                <td className="p-2">
                  <Badge
                    variant={
                      approvalStatus === "approved"
                        ? "default"
                        : approvalStatus === "rejected"
                        ? "destructive"
                        : approvalStatus === "flagged"
                        ? "outline"
                        : d.status === "clean"
                        ? "secondary"
                        : d.status === "quarantined"
                        ? "destructive"
                        : "secondary"
                    }
                    className={
                      approvalStatus === "approved"
                        ? "bg-green-600"
                        : ""
                    }
                  >
                    {displayStatus}
                  </Badge>
                </td>
                <td className="p-2 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Review Actions */}
                      {canApprove && onApprove && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onApprove(d.id);
                          }}
                          className="gap-2 text-green-600"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                      )}
                      {canReject && onReject && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onReject(d.id);
                          }}
                          className="gap-2 text-red-600"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      )}
                      {canFlag && onFlag && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onFlag(d.id);
                          }}
                          className="gap-2 text-orange-600"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Flag for Review
                        </DropdownMenuItem>
                      )}

                      {(onApprove || onReject || onFlag) && <DropdownMenuSeparator />}

                      {/* Assignment Actions */}
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
