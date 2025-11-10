"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/design-system/components/ui/dialog";
import { Button } from "@repo/design-system/components/ui/button";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Alert, AlertDescription } from "@repo/design-system/components/ui/alert";
import {
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  XCircle,
} from "lucide-react";

type PeriodStatus = "open" | "in_review" | "closed" | "locked";

type PeriodAction = "close" | "reopen" | "lock" | "mark_review";

type PeriodActionsDialogProps = {
  period: {
    id: string;
    year: number;
    month: number;
    status: PeriodStatus;
  } | null;
  clientName: string;
  stats: {
    totalDocs: number;
    approved: number;
    needsReview: number;
    flagged: number;
    rejected: number;
    unassigned: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: (periodId: string) => void;
  onReopen: (periodId: string) => void;
  onLock: (periodId: string) => void;
  onMarkReview: (periodId: string) => void;
};

export function PeriodActionsDialog({
  period,
  clientName,
  stats,
  open,
  onOpenChange,
  onClose,
  onReopen,
  onLock,
  onMarkReview,
}: PeriodActionsDialogProps) {
  const [selectedAction, setSelectedAction] = React.useState<PeriodAction | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setSelectedAction(null);
    }
  }, [open]);

  if (!period) return null;

  const periodName = `${period.year}-${String(period.month).padStart(2, "0")}`;

  // Validation logic
  const canClose = period.status === "open" || period.status === "in_review";
  const canReopen = period.status === "closed";
  const canLock = period.status === "closed";
  const canMarkReview = period.status === "open";

  const hasIssues =
    stats.needsReview > 0 || stats.flagged > 0 || stats.unassigned > 0;

  const getStatusBadge = (status: PeriodStatus) => {
    switch (status) {
      case "open":
        return <Badge variant="secondary">Open</Badge>;
      case "in_review":
        return <Badge variant="outline">In Review</Badge>;
      case "closed":
        return <Badge variant="default">Closed</Badge>;
      case "locked":
        return <Badge variant="destructive">Locked</Badge>;
    }
  };

  const handleSubmit = async () => {
    if (!selectedAction) return;

    setLoading(true);
    try {
      switch (selectedAction) {
        case "close":
          await onClose(period.id);
          break;
        case "reopen":
          await onReopen(period.id);
          break;
        case "lock":
          await onLock(period.id);
          break;
        case "mark_review":
          await onMarkReview(period.id);
          break;
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update period:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Manage Period: {periodName}
          </DialogTitle>
          <DialogDescription>
            {clientName} • Current Status: {getStatusBadge(period.status)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Period Stats */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="text-sm font-semibold mb-3">Period Overview</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Documents:</span>
                <span className="font-medium">{stats.totalDocs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Approved:</span>
                <span className="font-medium text-green-600">{stats.approved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Needs Review:</span>
                <span className="font-medium text-blue-600">{stats.needsReview}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flagged:</span>
                <span className="font-medium text-orange-600">{stats.flagged}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rejected:</span>
                <span className="font-medium text-red-600">{stats.rejected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unassigned:</span>
                <span className="font-medium text-orange-600">{stats.unassigned}</span>
              </div>
            </div>
          </div>

          {/* Issues Warning */}
          {hasIssues && selectedAction === "close" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This period has {stats.needsReview} document(s) needing review,{" "}
                {stats.flagged} flagged, and {stats.unassigned} unassigned. Are you
                sure you want to close it?
              </AlertDescription>
            </Alert>
          )}

          {/* Action Selection */}
          {!selectedAction && (
            <div className="space-y-3">
              <div className="text-sm font-semibold">Select Action</div>
              <div className="grid grid-cols-2 gap-3">
                {canMarkReview && (
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-600 hover:bg-blue-50"
                    onClick={() => setSelectedAction("mark_review")}
                  >
                    <Clock className="h-6 w-6 text-blue-600" />
                    <span className="font-semibold text-sm">Mark In Review</span>
                  </Button>
                )}
                {canClose && (
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2 hover:border-green-600 hover:bg-green-50"
                    onClick={() => setSelectedAction("close")}
                  >
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <span className="font-semibold text-sm">Close Period</span>
                  </Button>
                )}
                {canReopen && (
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-600 hover:bg-blue-50"
                    onClick={() => setSelectedAction("reopen")}
                  >
                    <Unlock className="h-6 w-6 text-blue-600" />
                    <span className="font-semibold text-sm">Reopen Period</span>
                  </Button>
                )}
                {canLock && (
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2 hover:border-red-600 hover:bg-red-50"
                    onClick={() => setSelectedAction("lock")}
                  >
                    <Lock className="h-6 w-6 text-red-600" />
                    <span className="font-semibold text-sm">Lock Period</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Confirmation */}
          {selectedAction && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">
                  {selectedAction === "close" && "Close Period"}
                  {selectedAction === "reopen" && "Reopen Period"}
                  {selectedAction === "lock" && "Lock Period"}
                  {selectedAction === "mark_review" && "Mark In Review"}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAction(null)}>
                  Change
                </Button>
              </div>
              <Alert>
                <AlertDescription className="text-sm">
                  {selectedAction === "close" && (
                    <>
                      Closing this period will prevent new documents from being uploaded
                      and mark it as complete. You can still reopen it later if needed.
                    </>
                  )}
                  {selectedAction === "reopen" && (
                    <>
                      Reopening this period will allow new documents to be uploaded and
                      edited again.
                    </>
                  )}
                  {selectedAction === "lock" && (
                    <>
                      <strong>Warning:</strong> Locking this period will make it
                      read-only. No changes can be made until it's unlocked. This is
                      typically done for compliance or audit purposes.
                    </>
                  )}
                  {selectedAction === "mark_review" && (
                    <>
                      Marking this period as "In Review" indicates you're currently
                      reviewing the documents before closing.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          {selectedAction && (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className={
                selectedAction === "lock"
                  ? "bg-red-600 hover:bg-red-700"
                  : selectedAction === "close"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              {loading ? "Processing..." : "Confirm"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
