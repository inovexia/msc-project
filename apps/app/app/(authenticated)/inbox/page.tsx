"use client";

import * as React from "react";
import { mockInboxDocuments, type InboxDocument } from "@/lib/mock-inbox-documents";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Inbox,
  Clock,
  AlertCircle,
  CheckCircle2,
  Users,
  Calendar,
  FileText,
  Search,
  RefreshCw,
  CheckSquare,
  XCircle,
  Flag,
  ChevronRight,
  Database,
  Beaker,
} from "lucide-react";
import { cn } from "@repo/design-system/lib/utils";
import { format } from "date-fns";

type FilterView =
  | "inbox"
  | "this_week"
  | "needs_review"
  | "approved"
  | "rejected"
  | "flagged"
  | "by_client"
  | "by_month"
  | "by_type";

export default function InboxPage() {
  const [documents] = React.useState<InboxDocument[]>(mockInboxDocuments);
  const [selectedFilter, setSelectedFilter] = React.useState<FilterView>("inbox");
  const [selectedDocIds, setSelectedDocIds] = React.useState<Set<string>>(new Set());
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dataMode, setDataMode] = React.useState<"mock" | "live">("mock");

  // Filter documents based on selected filter
  const filteredDocuments = React.useMemo(() => {
    let filtered = documents;

    // Apply filter view
    switch (selectedFilter) {
      case "inbox":
        filtered = documents.filter((d) => d.approvalStatus === "pending");
        break;
      case "this_week":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = documents.filter(
          (d) => new Date(d.uploadedAt) >= oneWeekAgo
        );
        break;
      case "needs_review":
        filtered = documents.filter(
          (d) => d.status === "needs_review" || d.flags
        );
        break;
      case "approved":
        filtered = documents.filter((d) => d.approvalStatus === "approved");
        break;
      case "rejected":
        filtered = documents.filter((d) => d.approvalStatus === "rejected");
        break;
      case "flagged":
        filtered = documents.filter((d) => d.approvalStatus === "flagged");
        break;
      default:
        filtered = documents;
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.filename.toLowerCase().includes(query) ||
          d.clientName.toLowerCase().includes(query) ||
          d.extracted?.vendor?.toLowerCase().includes(query)
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }, [documents, selectedFilter, searchQuery]);

  // Count for each filter
  const counts = React.useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return {
      inbox: documents.filter((d) => d.approvalStatus === "pending").length,
      this_week: documents.filter((d) => new Date(d.uploadedAt) >= oneWeekAgo)
        .length,
      needs_review: documents.filter((d) => d.status === "needs_review" || d.flags)
        .length,
      approved: documents.filter((d) => d.approvalStatus === "approved").length,
      rejected: documents.filter((d) => d.approvalStatus === "rejected").length,
      flagged: documents.filter((d) => d.approvalStatus === "flagged").length,
    };
  }, [documents]);

  const selectedDoc = React.useMemo(
    () => documents.find((d) => d.id === selectedDocId),
    [documents, selectedDocId]
  );

  const toggleSelectDoc = (docId: string) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedDocIds(new Set(filteredDocuments.map((d) => d.id)));
  };

  const deselectAll = () => {
    setSelectedDocIds(new Set());
  };

  const handleBulkApprove = () => {
    alert(`Approving ${selectedDocIds.size} documents`);
    setSelectedDocIds(new Set());
  };

  const handleBulkReject = () => {
    alert(`Rejecting ${selectedDocIds.size} documents`);
    setSelectedDocIds(new Set());
  };

  const handleBulkFlag = () => {
    alert(`Flagging ${selectedDocIds.size} documents`);
    setSelectedDocIds(new Set());
  };

  const getStatusBadge = (doc: InboxDocument) => {
    if (doc.approvalStatus === "approved") {
      return (
        <Badge variant="default" className="bg-green-600">
          Approved
        </Badge>
      );
    }
    if (doc.approvalStatus === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (doc.approvalStatus === "flagged") {
      return (
        <Badge variant="outline" className="border-orange-600 text-orange-600">
          Flagged
        </Badge>
      );
    }
    if (doc.status === "needs_review" || doc.flags) {
      return (
        <Badge variant="outline" className="border-blue-600 text-blue-600">
          Needs Review
        </Badge>
      );
    }
    if (doc.status === "processing") {
      return <Badge variant="secondary">Processing</Badge>;
    }
    return (
      <Badge variant="secondary" className="bg-gray-100">
        Pending
      </Badge>
    );
  };

  const getDocumentTypeIcon = (type: InboxDocument["documentType"]) => {
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Filters */}
      <div className="w-64 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-3">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {/* Primary Filters */}
            <Button
              variant={selectedFilter === "inbox" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setSelectedFilter("inbox")}
            >
              <Inbox className="h-4 w-4" />
              Inbox
              {counts.inbox > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {counts.inbox}
                </Badge>
              )}
            </Button>

            <Button
              variant={selectedFilter === "this_week" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setSelectedFilter("this_week")}
            >
              <Clock className="h-4 w-4" />
              This Week
              <Badge variant="outline" className="ml-auto">
                {counts.this_week}
              </Badge>
            </Button>

            <Button
              variant={selectedFilter === "needs_review" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setSelectedFilter("needs_review")}
            >
              <AlertCircle className="h-4 w-4" />
              Needs Review
              {counts.needs_review > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {counts.needs_review}
                </Badge>
              )}
            </Button>

            <Button
              variant={selectedFilter === "approved" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setSelectedFilter("approved")}
            >
              <CheckCircle2 className="h-4 w-4" />
              Approved
              <Badge variant="outline" className="ml-auto">
                {counts.approved}
              </Badge>
            </Button>

            <Button
              variant={selectedFilter === "rejected" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setSelectedFilter("rejected")}
            >
              <XCircle className="h-4 w-4" />
              Rejected
              <Badge variant="outline" className="ml-auto">
                {counts.rejected}
              </Badge>
            </Button>

            <Button
              variant={selectedFilter === "flagged" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setSelectedFilter("flagged")}
            >
              <Flag className="h-4 w-4" />
              Flagged
              <Badge variant="outline" className="ml-auto">
                {counts.flagged}
              </Badge>
            </Button>

            <div className="my-3 border-t" />

            {/* Group Filters */}
            <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
              ORGANIZE BY
            </div>

            <Button
              variant={selectedFilter === "by_client" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setSelectedFilter("by_client")}
            >
              <Users className="h-4 w-4" />
              By Client
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>

            <Button
              variant={selectedFilter === "by_month" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setSelectedFilter("by_month")}
            >
              <Calendar className="h-4 w-4" />
              By Month
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>

            <Button
              variant={selectedFilter === "by_type" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setSelectedFilter("by_type")}
            >
              <FileText className="h-4 w-4" />
              By Type
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </div>

        {/* Data Mode Toggle */}
        <div className="p-3 border-t">
          <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-lg">
            <Button
              variant={dataMode === "mock" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setDataMode("mock")}
              className="flex-1 gap-2 h-8"
            >
              <Beaker className="h-3.5 w-3.5" />
              Mock
            </Button>
            <Button
              variant={dataMode === "live" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setDataMode("live")}
              className="flex-1 gap-2 h-8"
            >
              <Database className="h-3.5 w-3.5" />
              Live
            </Button>
          </div>
        </div>
      </div>

      {/* Middle - Document List */}
      <div className="flex-1 flex flex-col border-r">
        {/* Header with bulk actions */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">
              {filteredDocuments.length} documents
            </h2>
            <Button variant="ghost" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {selectedDocIds.size > 0 && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <span className="text-sm font-medium">
                {selectedDocIds.size} selected
              </span>
              <div className="flex items-center gap-1 ml-auto">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleBulkApprove}
                  className="gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleBulkReject}
                  className="gap-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleBulkFlag}
                  className="gap-1"
                >
                  <Flag className="h-3.5 w-3.5" />
                  Flag
                </Button>
                <Button size="sm" variant="ghost" onClick={deselectAll}>
                  Clear
                </Button>
              </div>
            </div>
          )}

          {selectedDocIds.size === 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox
                checked={
                  filteredDocuments.length > 0 &&
                  selectedDocIds.size === filteredDocuments.length
                }
                onCheckedChange={(checked) => {
                  if (checked) {
                    selectAll();
                  } else {
                    deselectAll();
                  }
                }}
              />
              <span>Select all</span>
            </div>
          )}
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto">
          {filteredDocuments.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center space-y-2">
                <Inbox className="h-12 w-12 mx-auto opacity-50" />
                <p className="text-sm">No documents found</p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {filteredDocuments.map((doc) => {
                const isSelected = selectedDocIds.has(doc.id);
                const isActive = selectedDocId === doc.id;

                return (
                  <div
                    key={doc.id}
                    className={cn(
                      "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                      isActive && "bg-muted",
                      isSelected && "bg-blue-50 dark:bg-blue-950/20"
                    )}
                    onClick={() => setSelectedDocId(doc.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectDoc(doc.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            {getDocumentTypeIcon(doc.documentType)}
                            <span className="font-medium text-sm truncate">
                              {doc.filename}
                            </span>
                          </div>
                          {getStatusBadge(doc)}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                          <span className="font-medium">{doc.clientName}</span>
                          <span>•</span>
                          <span>{doc.periodName}</span>
                        </div>

                        {doc.extracted && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {doc.extracted.vendor && (
                              <span>{doc.extracted.vendor}</span>
                            )}
                            {doc.extracted.amount !== undefined && (
                              <>
                                <span>•</span>
                                <span className="font-medium">
                                  ${doc.extracted.amount.toFixed(2)}
                                </span>
                              </>
                            )}
                            {doc.extracted.date && (
                              <>
                                <span>•</span>
                                <span>
                                  {format(new Date(doc.extracted.date), "MMM dd")}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        {doc.flags && doc.flags.length > 0 && (
                          <div className="mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-orange-600" />
                            <span className="text-xs text-orange-600">
                              {doc.flags[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right - Detail Panel */}
      <div className="w-96 bg-background flex flex-col">
        {selectedDoc ? (
          <>
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-2">{selectedDoc.filename}</h3>
              <div className="flex items-center gap-2 mb-3">
                {getStatusBadge(selectedDoc)}
                <Badge variant="outline" className="capitalize">
                  {selectedDoc.documentType.replace("_", " ")}
                </Badge>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Document Preview Placeholder */}
              <div className="aspect-[8.5/11] bg-muted rounded-lg flex items-center justify-center border">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Document Preview</p>
                </div>
              </div>

              {/* Extracted Data */}
              {selectedDoc.extracted && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Extracted Information</h4>
                  <div className="space-y-2 text-sm">
                    {selectedDoc.extracted.vendor && (
                      <div>
                        <span className="text-muted-foreground">Vendor:</span>
                        <div className="font-medium">
                          {selectedDoc.extracted.vendor}
                        </div>
                      </div>
                    )}
                    {selectedDoc.extracted.amount !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <div className="font-medium text-lg">
                          ${selectedDoc.extracted.amount.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {selectedDoc.extracted.date && (
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <div className="font-medium">
                          {format(
                            new Date(selectedDoc.extracted.date),
                            "MMMM dd, yyyy"
                          )}
                        </div>
                      </div>
                    )}
                    {selectedDoc.extracted.invoiceNumber && (
                      <div>
                        <span className="text-muted-foreground">
                          Invoice Number:
                        </span>
                        <div className="font-medium">
                          {selectedDoc.extracted.invoiceNumber}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Client & Period Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Document Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Client:</span>
                    <div className="font-medium">{selectedDoc.clientName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Period:</span>
                    <div className="font-medium">{selectedDoc.periodName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uploaded by:</span>
                    <div className="font-medium">{selectedDoc.uploaderName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uploaded:</span>
                    <div className="font-medium">
                      {format(
                        new Date(selectedDoc.uploadedAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Flags */}
              {selectedDoc.flags && selectedDoc.flags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-orange-600">
                    Flags & Issues
                  </h4>
                  <div className="space-y-2">
                    {selectedDoc.flags.map((flag, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm p-2 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200 dark:border-orange-900"
                      >
                        <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            {selectedDoc.approvalStatus === "pending" && (
              <div className="p-4 border-t space-y-2">
                <Button
                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => alert("Approving document")}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve Document
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => alert("Rejecting document")}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => alert("Flagging document")}
                  >
                    <Flag className="h-4 w-4" />
                    Flag
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <FileText className="h-12 w-12 mx-auto opacity-50" />
              <p className="text-sm">Select a document to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
