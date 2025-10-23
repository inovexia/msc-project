"use client";

import * as React from "react";
import { listPeriods } from "@/lib/api";
import { mockPeriods } from "@/lib/mock-periods";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@repo/design-system/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@repo/design-system/components/ui/tabs";
import {
  RefreshCw,
  Database,
  Beaker,
  AlertCircle,
  Clock,
  ExternalLink,
  Mail,
  Plus,
  Settings,
  MoreVertical,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
} from "lucide-react";
import { RequestDocumentsDialog } from "@/app/(authenticated)/accountants/dashboard/components/request-documents-dialog";
import { CreatePeriodDialog } from "@/app/(authenticated)/components/periods/CreatePeriodDialog";
import { BulkCreatePeriodsDialog } from "@/app/(authenticated)/components/periods/BulkCreatePeriodsDialog";
import { PeriodActionsDialog } from "@/app/(authenticated)/components/periods/PeriodActionsDialog";
import Link from "next/link";

type TabValue = "all" | "needs_attention" | "open" | "in_review" | "closed";

export default function ClientsDashboardPage() {
  const [periods, setPeriods] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dataMode, setDataMode] = React.useState<"mock" | "live">("mock");
  const [selectedPeriod, setSelectedPeriod] = React.useState<any | null>(null);
  const [periodActionsOpen, setPeriodActionsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabValue>("all");

  const fetchLiveData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listPeriods();
      setPeriods(data || []);
    } catch (err) {
      console.error("Failed to fetch periods:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (dataMode === "live") {
      fetchLiveData();
    } else {
      setPeriods(mockPeriods);
    }
  }, [dataMode, fetchLiveData]);

  const displayPeriods = dataMode === "mock" ? mockPeriods : periods;

  // Calculate counts for tabs
  const counts = React.useMemo(() => {
    const needsAttention = displayPeriods.filter(
      (p) => p.status === "open" && p.received < p.required
    ).length;
    const open = displayPeriods.filter((p) => p.status === "open").length;
    const inReview = displayPeriods.filter((p) => p.status === "in_review").length;
    const closed = displayPeriods.filter((p) => p.status === "closed").length;

    return { needsAttention, open, inReview, closed };
  }, [displayPeriods]);

  // Filter periods based on selected tab
  const filteredPeriods = React.useMemo(() => {
    switch (activeTab) {
      case "needs_attention":
        return displayPeriods.filter((p) => p.status === "open" && p.received < p.required);
      case "open":
        return displayPeriods.filter((p) => p.status === "open");
      case "in_review":
        return displayPeriods.filter((p) => p.status === "in_review");
      case "closed":
        return displayPeriods.filter((p) => p.status === "closed");
      default:
        return displayPeriods;
    }
  }, [displayPeriods, activeTab]);

  // Extract unique clients for period creation dialogs
  const mockClients = React.useMemo(() => {
    const uniqueClients = new Map();
    displayPeriods.forEach((p) => {
      if (!uniqueClients.has(p.clientId)) {
        uniqueClients.set(p.clientId, { id: p.clientId, name: p.clientName });
      }
    });
    return Array.from(uniqueClients.values());
  }, [displayPeriods]);

  const handleDocumentRequest = async (
    periodId: string,
    clientId: string,
    clientName: string,
    requestList: Array<{ title: string; category: string; required: boolean }>,
    message: string
  ) => {
    if (dataMode === "mock") {
      alert(
        `Document request sent to ${clientName}\n\nRequested:\n${requestList.map((r) => `- ${r.title}`).join("\n")}`
      );
      return;
    }

    try {
      const response = await fetch("/api/document-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId,
          clientId,
          requests: requestList,
          message,
        }),
      });

      if (!response.ok) throw new Error("Failed to send request");

      alert(`Document request sent successfully to ${clientName}`);
      fetchLiveData();
    } catch (err) {
      console.error("Failed to send document request:", err);
      alert("Failed to send document request. Please try again.");
    }
  };

  const handleCreatePeriod = async (data: {
    clientId: string;
    year: number;
    month: number;
    dueDate?: string;
  }) => {
    if (dataMode === "mock") {
      const client = mockClients.find((c) => c.id === data.clientId);
      const newPeriod = {
        id: `period-${Date.now()}`,
        clientId: data.clientId,
        clientName: client?.name || "Unknown Client",
        year: data.year,
        month: data.month,
        required: 0,
        received: 0,
        docs: 0,
        status: "open" as const,
      };
      setPeriods((prev) => [...prev, newPeriod]);
      alert(`Period ${data.year}-${String(data.month).padStart(2, "0")} created for ${client?.name}`);
      return;
    }

    try {
      const response = await fetch("/api/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create period");

      alert("Period created successfully");
      fetchLiveData();
    } catch (err) {
      console.error("Failed to create period:", err);
      alert("Failed to create period. Please try again.");
    }
  };

  const handleBulkCreatePeriods = async (data: {
    clientIds: string[];
    year: number;
    month: number;
    dueDate?: string;
  }) => {
    if (dataMode === "mock") {
      const newPeriods = data.clientIds.map((clientId) => {
        const client = mockClients.find((c) => c.id === clientId);
        return {
          id: `period-${Date.now()}-${clientId}`,
          clientId,
          clientName: client?.name || "Unknown Client",
          year: data.year,
          month: data.month,
          required: 0,
          received: 0,
          docs: 0,
          status: "open" as const,
        };
      });
      setPeriods((prev) => [...prev, ...newPeriods]);
      alert(
        `Created ${data.clientIds.length} period(s) for ${data.year}-${String(data.month).padStart(2, "0")}`
      );
      return;
    }

    try {
      const response = await fetch("/api/periods/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create periods");

      alert(`Successfully created ${data.clientIds.length} periods`);
      fetchLiveData();
    } catch (err) {
      console.error("Failed to create periods:", err);
      alert("Failed to create periods. Please try again.");
    }
  };

  const handleClosePeriod = async (periodId: string) => {
    if (dataMode === "mock") {
      setPeriods((prev) =>
        prev.map((p) => (p.id === periodId ? { ...p, status: "closed" } : p))
      );
      alert("Period closed successfully");
      return;
    }

    try {
      const response = await fetch(`/api/periods/${periodId}/close`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to close period");

      alert("Period closed successfully");
      fetchLiveData();
    } catch (err) {
      console.error("Failed to close period:", err);
      alert("Failed to close period. Please try again.");
    }
  };

  const handleReopenPeriod = async (periodId: string) => {
    if (dataMode === "mock") {
      setPeriods((prev) =>
        prev.map((p) => (p.id === periodId ? { ...p, status: "open" } : p))
      );
      alert("Period reopened successfully");
      return;
    }

    try {
      const response = await fetch(`/api/periods/${periodId}/reopen`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to reopen period");

      alert("Period reopened successfully");
      fetchLiveData();
    } catch (err) {
      console.error("Failed to reopen period:", err);
      alert("Failed to reopen period. Please try again.");
    }
  };

  const handleLockPeriod = async (periodId: string) => {
    if (dataMode === "mock") {
      setPeriods((prev) =>
        prev.map((p) => (p.id === periodId ? { ...p, status: "locked" } : p))
      );
      alert("Period locked successfully");
      return;
    }

    try {
      const response = await fetch(`/api/periods/${periodId}/lock`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to lock period");

      alert("Period locked successfully");
      fetchLiveData();
    } catch (err) {
      console.error("Failed to lock period:", err);
      alert("Failed to lock period. Please try again.");
    }
  };

  const handleMarkReview = async (periodId: string) => {
    if (dataMode === "mock") {
      setPeriods((prev) =>
        prev.map((p) => (p.id === periodId ? { ...p, status: "in_review" } : p))
      );
      alert("Period marked as in review");
      return;
    }

    try {
      const response = await fetch(`/api/periods/${periodId}/mark-review`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to mark period for review");

      alert("Period marked as in review");
      fetchLiveData();
    } catch (err) {
      console.error("Failed to mark period for review:", err);
      alert("Failed to mark period for review. Please try again.");
    }
  };

  const handleManagePeriod = (period: any) => {
    setSelectedPeriod(period);
    setPeriodActionsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="secondary">Open</Badge>;
      case "in_review":
        return <Badge variant="outline">In Review</Badge>;
      case "closed":
        return <Badge variant="default">Closed</Badge>;
      case "locked":
        return <Badge variant="destructive">Locked</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-7xl py-8 px-6 md:px-8">
      {/* Header with Compact Metrics */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold mb-2">Document Collections</h1>
            <p className="text-sm text-muted-foreground">
              Track and manage monthly document submissions from your clients.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
            {/* Consolidated Create Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Period
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <CreatePeriodDialog
                  clients={mockClients}
                  onSubmit={handleCreatePeriod}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Single Period
                    </DropdownMenuItem>
                  }
                />
                <BulkCreatePeriodsDialog
                  clients={mockClients}
                  onSubmit={handleBulkCreatePeriods}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Bulk Create Periods
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Data Mode Toggle */}
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
              <Button
                variant={dataMode === "mock" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setDataMode("mock")}
                className="gap-2 h-8"
              >
                <Beaker className="h-3.5 w-3.5" />
                Mock
              </Button>
              <Button
                variant={dataMode === "live" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setDataMode("live")}
                className="gap-2 h-8"
              >
                <Database className="h-3.5 w-3.5" />
                Live
              </Button>
            </div>

            {/* Refresh Button */}
            {dataMode === "live" && (
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLiveData}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {dataMode === "live" && error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="mb-6">
        <TabsList className="h-auto p-1 gap-1 w-full justify-start">
          <TabsTrigger value="all" className="gap-2 px-4 py-2.5">
            All
            <Badge variant="secondary" className="ml-1.5">
              {displayPeriods.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="needs_attention" className="gap-2 px-4 py-2.5">
            <AlertCircle className="h-4 w-4" />
            Needs Attention
            {counts.needsAttention > 0 && (
              <Badge variant="destructive" className="ml-1.5">
                {counts.needsAttention}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="open" className="gap-2 px-4 py-2.5">
            <Clock className="h-4 w-4" />
            Open
            <Badge variant="outline" className="ml-1.5">
              {counts.open}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="in_review" className="gap-2 px-4 py-2.5">
            In Review
            <Badge variant="outline" className="ml-1.5">
              {counts.inReview}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="closed" className="gap-2 px-4 py-2.5">
            <CheckCircle className="h-4 w-4" />
            Closed
            <Badge variant="outline" className="ml-1.5">
              {counts.closed}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Simplified Table */}
      <div className="rounded-lg border bg-white dark:bg-background shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr className="text-sm">
                <th className="p-4 text-left font-medium">Client</th>
                <th className="p-4 text-left font-medium">Period</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium w-[200px]">Progress</th>
                <th className="p-4 text-left font-medium">Documents</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && dataMode === "live" ? (
                <tr>
                  <td className="p-8 text-muted-foreground text-center" colSpan={6}>
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading periods…
                    </div>
                  </td>
                </tr>
              ) : filteredPeriods.length === 0 ? (
                <tr>
                  <td className="p-8 text-muted-foreground text-center" colSpan={6}>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">No periods found</p>
                      <p className="text-sm">
                        {activeTab === "needs_attention"
                          ? "No periods need attention right now"
                          : "Try changing the filter or create a new period"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPeriods.map((p) => {
                  const progressPercent = Math.round((p.received / p.required) * 100);
                  const needsAttention = p.status === "open" && p.received < p.required;

                  return (
                    <tr
                      key={p.id}
                      className={`border-t text-sm hover:bg-muted/40 transition-colors ${
                        needsAttention ? "bg-orange-50/50 dark:bg-orange-950/10" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{p.clientName}</span>
                          {needsAttention && (
                            <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <Link
                          href={`/clients/${p.clientId}/periods/${p.id}`}
                          className="underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          {p.year}-{String(p.month).padStart(2, "0")}
                        </Link>
                      </td>

                      <td className="p-4">{getStatusBadge(p.status)}</td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                progressPercent >= 100
                                  ? "bg-emerald-500"
                                  : progressPercent >= 75
                                  ? "bg-blue-500"
                                  : progressPercent >= 50
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-medium min-w-[3ch]">
                            {progressPercent}%
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={
                            p.received >= p.required
                              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-muted-foreground"
                          }
                        >
                          {p.received}/{p.required}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/clients/${p.clientId}/periods/${p.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ExternalLink className="h-3.5 w-3.5" />
                              View
                            </Button>
                          </Link>

                          {/* Actions Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {p.status === "open" && p.received < p.required && (
                                <RequestDocumentsDialog
                                  clientName={p.clientName}
                                  periodName={`${p.year}-${String(p.month).padStart(2, "0")}`}
                                  onSubmit={(requests, message) =>
                                    handleDocumentRequest(
                                      p.id,
                                      p.clientId,
                                      p.clientName,
                                      requests,
                                      message
                                    )
                                  }
                                  trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <Mail className="h-4 w-4 mr-2" />
                                      Request Documents
                                    </DropdownMenuItem>
                                  }
                                />
                              )}
                              {p.status !== "locked" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleManagePeriod(p)}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Manage Period
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {p.status === "open" && (
                                <DropdownMenuItem onClick={() => handleMarkReview(p.id)}>
                                  <Clock className="h-4 w-4 mr-2" />
                                  Mark In Review
                                </DropdownMenuItem>
                              )}
                              {(p.status === "open" || p.status === "in_review") && (
                                <DropdownMenuItem onClick={() => handleClosePeriod(p.id)}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Close Period
                                </DropdownMenuItem>
                              )}
                              {p.status === "closed" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleReopenPeriod(p.id)}>
                                    <Unlock className="h-4 w-4 mr-2" />
                                    Reopen Period
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleLockPeriod(p.id)}>
                                    <Lock className="h-4 w-4 mr-2 text-red-600" />
                                    <span className="text-red-600">Lock Period</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Period Actions Dialog */}
      <PeriodActionsDialog
        period={selectedPeriod}
        clientName={selectedPeriod?.clientName || ""}
        stats={{
          totalDocs: selectedPeriod?.docs || 0,
          approved: 0,
          needsReview: selectedPeriod?.required - selectedPeriod?.received || 0,
          flagged: 0,
          rejected: 0,
          unassigned: selectedPeriod?.required - selectedPeriod?.received || 0,
        }}
        open={periodActionsOpen}
        onOpenChange={setPeriodActionsOpen}
        onClose={handleClosePeriod}
        onReopen={handleReopenPeriod}
        onLock={handleLockPeriod}
        onMarkReview={handleMarkReview}
      />
    </div>
  );
}
