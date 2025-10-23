"use client";

import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import type { Document } from "../data";

type InboxDocumentListProps = {
  documents: Document[];
  selectedDocumentId: string | null;
  selectedDocumentIds: Set<string>;
  onSelectDocument: (documentId: string) => void;
  onToggleDocumentSelection: (documentId: string) => void;
  onToggleAllSelection: () => void;
  allSelected: boolean;
};

export function InboxDocumentList({
  documents,
  selectedDocumentId,
  selectedDocumentIds,
  onSelectDocument,
  onToggleDocumentSelection,
  onToggleAllSelection,
  allSelected,
}: InboxDocumentListProps) {
  const formatAmount = (amount?: number) => {
    if (!amount) return "";
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "needs_review":
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
            Needs Review
          </span>
        );
      case "approved":
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            Rejected
          </span>
        );
      case "pending":
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 border-r border-border bg-background flex flex-col">
      {/* Header with bulk select */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onToggleAllSelection}
          aria-label="Select all documents"
        />
        <span className="text-sm text-muted-foreground">
          {selectedDocumentIds.size > 0
            ? `${selectedDocumentIds.size} selected`
            : `${documents.length} documents`}
        </span>
        {selectedDocumentIds.size > 0 && (
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="default" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
            <Button size="sm" variant="destructive" className="gap-2">
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto">
        {documents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">No documents found</p>
            </div>
          </div>
        ) : (
          <div>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center gap-3 p-4 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors",
                  selectedDocumentId === doc.id && "bg-accent"
                )}
                onClick={() => onSelectDocument(doc.id)}
              >
                <Checkbox
                  checked={selectedDocumentIds.has(doc.id)}
                  onCheckedChange={() => onToggleDocumentSelection(doc.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${doc.title}`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {doc.vendor && (
                          <span className="text-sm text-muted-foreground truncate">
                            {doc.vendor}
                          </span>
                        )}
                        {doc.clientName && (
                          <>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-sm text-muted-foreground truncate">
                              {doc.clientName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      {doc.amount && (
                        <span className="text-sm font-semibold text-foreground">
                          {formatAmount(doc.amount)}
                        </span>
                      )}
                      {doc.date && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(doc.date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">{getStatusBadge(doc.status)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
