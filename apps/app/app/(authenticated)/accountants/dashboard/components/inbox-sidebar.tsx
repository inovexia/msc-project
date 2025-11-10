"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import {
  Inbox,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  Calendar,
  FileType,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import type { Client, DocumentStatus, DocumentType } from "../data";

export type FilterType =
  | "inbox"
  | "this_week"
  | "needs_review"
  | "approved"
  | "unassigned"
  | { type: "client"; clientId: string }
  | { type: "month"; month: string }
  | { type: "document_type"; docType: DocumentType };

type InboxSidebarProps = {
  clients: Client[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  documentCounts: {
    inbox: number;
    thisWeek: number;
    needsReview: number;
    approved: number;
    unassigned?: number;
  };
};

export function InboxSidebar({
  clients,
  activeFilter,
  onFilterChange,
  documentCounts,
}: InboxSidebarProps) {
  const [isClientExpanded, setIsClientExpanded] = useState(true);
  const [isMonthExpanded, setIsMonthExpanded] = useState(false);
  const [isTypeExpanded, setIsTypeExpanded] = useState(false);

  const isActiveFilter = (filter: FilterType): boolean => {
    if (typeof activeFilter === "string" && typeof filter === "string") {
      return activeFilter === filter;
    }
    if (typeof activeFilter === "object" && typeof filter === "object") {
      if (activeFilter.type === "client" && filter.type === "client") {
        return activeFilter.clientId === filter.clientId;
      }
      if (activeFilter.type === "month" && filter.type === "month") {
        return activeFilter.month === filter.month;
      }
      if (
        activeFilter.type === "document_type" &&
        filter.type === "document_type"
      ) {
        return activeFilter.docType === filter.docType;
      }
    }
    return false;
  };

  const documentTypes: { type: DocumentType; label: string }[] = [
    { type: "invoice", label: "Invoices" },
    { type: "receipt", label: "Receipts" },
    { type: "statement", label: "Statements" },
    { type: "bill", label: "Bills" },
    { type: "other", label: "Other" },
  ];

  const months = ["October 2025", "September 2025", "August 2025"];

  return (
    <aside className="w-64 border-r border-border bg-background flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Documents</h2>
      </div>

      <div className="flex-grow overflow-y-auto p-2">
        {/* Quick Filters */}
        <div className="space-y-1 mb-4">
          <Button
            variant={isActiveFilter("inbox") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              isActiveFilter("inbox") && "bg-accent"
            )}
            onClick={() => onFilterChange("inbox")}
          >
            <Inbox className="h-4 w-4" />
            <span className="flex-1 text-left">Inbox</span>
            <span className="text-xs text-muted-foreground">
              {documentCounts.inbox}
            </span>
          </Button>

          <Button
            variant={isActiveFilter("this_week") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              isActiveFilter("this_week") && "bg-accent"
            )}
            onClick={() => onFilterChange("this_week")}
          >
            <Clock className="h-4 w-4" />
            <span className="flex-1 text-left">This Week</span>
            <span className="text-xs text-muted-foreground">
              {documentCounts.thisWeek}
            </span>
          </Button>

          <Button
            variant={isActiveFilter("needs_review") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              isActiveFilter("needs_review") && "bg-accent"
            )}
            onClick={() => onFilterChange("needs_review")}
          >
            <AlertCircle className="h-4 w-4" />
            <span className="flex-1 text-left">Needs Review</span>
            <span className="text-xs text-orange-600 dark:text-orange-400">
              {documentCounts.needsReview}
            </span>
          </Button>

          <Button
            variant={isActiveFilter("approved") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              isActiveFilter("approved") && "bg-accent"
            )}
            onClick={() => onFilterChange("approved")}
          >
            <CheckCircle className="h-4 w-4" />
            <span className="flex-1 text-left">Approved</span>
            <span className="text-xs text-muted-foreground">
              {documentCounts.approved}
            </span>
          </Button>

          <Button
            variant={isActiveFilter("unassigned") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              isActiveFilter("unassigned") && "bg-accent"
            )}
            onClick={() => onFilterChange("unassigned")}
          >
            <AlertCircle className="h-4 w-4" />
            <span className="flex-1 text-left">Unassigned</span>
            {documentCounts.unassigned !== undefined && (
              <span className="text-xs text-orange-600 dark:text-orange-400">
                {documentCounts.unassigned}
              </span>
            )}
          </Button>
        </div>

        {/* By Client */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-1 px-2 mb-1"
            onClick={() => setIsClientExpanded(!isClientExpanded)}
          >
            {isClientExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">By Client</span>
          </Button>

          {isClientExpanded && (
            <div className="space-y-1 pl-6">
              {clients.map((client) => (
                <Button
                  key={client.id}
                  variant={
                    isActiveFilter({ type: "client", clientId: client.id })
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    isActiveFilter({ type: "client", clientId: client.id }) &&
                      "bg-accent"
                  )}
                  onClick={() =>
                    onFilterChange({ type: "client", clientId: client.id })
                  }
                >
                  <span className="text-sm truncate">{client.name}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* By Month */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-1 px-2 mb-1"
            onClick={() => setIsMonthExpanded(!isMonthExpanded)}
          >
            {isMonthExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">By Month</span>
          </Button>

          {isMonthExpanded && (
            <div className="space-y-1 pl-6">
              {months.map((month) => (
                <Button
                  key={month}
                  variant={
                    isActiveFilter({ type: "month", month })
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    isActiveFilter({ type: "month", month }) && "bg-accent"
                  )}
                  onClick={() => onFilterChange({ type: "month", month })}
                >
                  <span className="text-sm">{month}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* By Type */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-1 px-2 mb-1"
            onClick={() => setIsTypeExpanded(!isTypeExpanded)}
          >
            {isTypeExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <FileType className="h-4 w-4" />
            <span className="text-sm font-medium">By Type</span>
          </Button>

          {isTypeExpanded && (
            <div className="space-y-1 pl-6">
              {documentTypes.map(({ type, label }) => (
                <Button
                  key={type}
                  variant={
                    isActiveFilter({ type: "document_type", docType: type })
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    isActiveFilter({ type: "document_type", docType: type }) &&
                      "bg-accent"
                  )}
                  onClick={() =>
                    onFilterChange({ type: "document_type", docType: type })
                  }
                >
                  <span className="text-sm">{label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
