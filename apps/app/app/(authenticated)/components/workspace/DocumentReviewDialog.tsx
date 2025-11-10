"use client";

import * as React from "react";
import { Document } from "@/lib/types";
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
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { Label } from "@repo/design-system/components/ui/label";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  Building2,
} from "lucide-react";
import { format } from "date-fns";

type ReviewAction = "approve" | "reject" | "flag";

type DocumentReviewDialogProps = {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (docId: string, note?: string) => void;
  onReject: (docId: string, reason: string) => void;
  onFlag: (docId: string, note: string) => void;
};

export function DocumentReviewDialog({
  document,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onFlag,
}: DocumentReviewDialogProps) {
  const [action, setAction] = React.useState<ReviewAction | null>(null);
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setAction(null);
      setNote("");
    }
  }, [open]);

  if (!document) return null;

  const approvalStatus = (document as any).approvalStatus || "pending";
  const canApprove = document.status === "clean" && approvalStatus === "pending";

  const handleSubmit = () => {
    if (!action) return;

    switch (action) {
      case "approve":
        onApprove(document.id, note || undefined);
        break;
      case "reject":
        if (!note.trim()) {
          alert("Please provide a rejection reason");
          return;
        }
        onReject(document.id, note);
        break;
      case "flag":
        if (!note.trim()) {
          alert("Please provide a note for flagging");
          return;
        }
        onFlag(document.id, note);
        break;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Review Document
          </DialogTitle>
          <DialogDescription>
            Review and take action on this document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Document Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{document.filename}</h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    approvalStatus === "approved"
                      ? "default"
                      : approvalStatus === "rejected"
                      ? "destructive"
                      : approvalStatus === "flagged"
                      ? "outline"
                      : "secondary"
                  }
                  className={approvalStatus === "approved" ? "bg-green-600" : ""}
                >
                  {approvalStatus === "approved"
                    ? "Approved"
                    : approvalStatus === "rejected"
                    ? "Rejected"
                    : approvalStatus === "flagged"
                    ? "Flagged"
                    : "Pending Review"}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {document.contentType?.split("/")[1] || "PDF"}
                </Badge>
                {document.byteSize && (
                  <Badge variant="outline">
                    {(document.byteSize / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                )}
              </div>
            </div>

            {/* Extracted Data */}
            {document.extracted && (
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg border bg-muted/30">
                {document.extracted.vendor && (
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground">Vendor</div>
                      <div className="font-medium">{document.extracted.vendor}</div>
                    </div>
                  </div>
                )}
                {document.extracted.amount !== undefined && (
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground">Amount</div>
                      <div className="font-medium">
                        ${document.extracted.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
                {document.extracted.date && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground">Date</div>
                      <div className="font-medium">
                        {format(new Date(document.extracted.date), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Info */}
            <div className="text-sm text-muted-foreground space-y-1">
              {document.uploadedAt && (
                <div>
                  Uploaded: {format(new Date(document.uploadedAt), "MMM dd, yyyy 'at' h:mm a")}
                </div>
              )}
              {document.uploaderName && <div>By: {document.uploaderName}</div>}
            </div>
          </div>

          {/* Action Selection */}
          {!action && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Action</Label>
              <div className="grid grid-cols-3 gap-3">
                {canApprove && (
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2 hover:border-green-600 hover:bg-green-50"
                    onClick={() => setAction("approve")}
                  >
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <span className="font-semibold">Approve</span>
                    <span className="text-xs text-muted-foreground">Mark as approved</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:border-red-600 hover:bg-red-50"
                  onClick={() => setAction("reject")}
                >
                  <XCircle className="h-8 w-8 text-red-600" />
                  <span className="font-semibold">Reject</span>
                  <span className="text-xs text-muted-foreground">Needs correction</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:border-orange-600 hover:bg-orange-50"
                  onClick={() => setAction("flag")}
                >
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <span className="font-semibold">Flag</span>
                  <span className="text-xs text-muted-foreground">Needs attention</span>
                </Button>
              </div>
            </div>
          )}

          {/* Note/Reason Input */}
          {action && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  {action === "approve"
                    ? "Add Note (Optional)"
                    : action === "reject"
                    ? "Rejection Reason (Required)"
                    : "Flag Note (Required)"}
                </Label>
                <Button variant="ghost" size="sm" onClick={() => setAction(null)}>
                  Change Action
                </Button>
              </div>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  action === "approve"
                    ? "Add any notes about this approval..."
                    : action === "reject"
                    ? "Why is this document being rejected?"
                    : "What needs attention?"
                }
                rows={4}
                className="resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {action && (
            <Button
              onClick={handleSubmit}
              className={
                action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : action === "reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }
            >
              {action === "approve"
                ? "Approve Document"
                : action === "reject"
                ? "Reject Document"
                : "Flag Document"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
