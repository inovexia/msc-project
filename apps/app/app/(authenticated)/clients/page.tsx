"use client";

import * as React from "react";
import { listPeriods } from "@/lib/api";
import { mockPeriods } from "@/lib/mock-periods";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { RefreshCw, Database, Beaker, AlertCircle, CheckCircle, Clock, ExternalLink, Mail } from "lucide-react";
import { RequestDocumentsDialog } from "@/app/(authenticated)/accountants/dashboard/components/request-documents-dialog";
import Link from "next/link";

export default function ClientsDashboardPage() {
  const [periods, setPeriods] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dataMode, setDataMode] = React.useState<"mock" | "live">("mock");

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

  const [filterStatus, setFilterStatus] = React.useState<"all" | "open" | "in_review" | "closed">("all");

  const displayPeriods = dataMode === "mock" ? mockPeriods : periods;

  // Filter periods based on selected filter
  const filteredPeriods = React.useMemo(() => {
    if (filterStatus === "all") return displayPeriods;
    return displayPeriods.filter((p) => p.status === filterStatus);
  }, [displayPeriods, filterStatus]);

  // Get periods that need attention (open and incomplete)
  const needsAttentionPeriods = React.useMemo(() => {
    return displayPeriods.filter(
      (p) => p.status === "open" && p.received < p.required
    );
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

  return (
    <div className="container max-w-7xl py-8 px-6 md:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Document Collections</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage monthly document submissions from your clients.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Data Mode Toggle */}
          <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
            <Button
              variant={dataMode === "mock" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setDataMode("mock")}
              className="gap-2"
            >
              <Beaker className="h-4 w-4" />
              Mock
            </Button>
            <Button
              variant={dataMode === "live" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setDataMode("live")}
              className="gap-2"
            >
              <Database className="h-4 w-4" />
              Live
            </Button>
          </div>

          {/* Refresh Button (only for live mode) */}
          {dataMode === "live" && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLiveData}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Error State */}
      {dataMode === "live" && error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Filter Buttons */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">Show:</span>
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("all")}
        >
          All ({displayPeriods.length})
        </Button>
        <Button
          variant={filterStatus === "open" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("open")}
          className="gap-2"
        >
          <Clock className="h-4 w-4" />
          Open ({displayPeriods.filter((p) => p.status === "open").length})
        </Button>
        <Button
          variant={filterStatus === "in_review" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("in_review")}
          className="gap-2"
        >
          <AlertCircle className="h-4 w-4" />
          In Review ({displayPeriods.filter((p) => p.status === "in_review").length})
        </Button>
        <Button
          variant={filterStatus === "closed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("closed")}
          className="gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Closed ({displayPeriods.filter((p) => p.status === "closed").length})
        </Button>
      </div>

      {/* Needs Attention Section */}
      {needsAttentionPeriods.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold">Needs Attention</h2>
            <Badge variant="destructive">{needsAttentionPeriods.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {needsAttentionPeriods.slice(0, 6).map((p) => {
              const progressPercent = Math.round((p.received / p.required) * 100);
              const missing = p.required - p.received;
              return (
                <Card key={p.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{p.clientName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {p.year}-{String(p.month).padStart(2, "0")}
                        </p>
                      </div>
                      <Badge variant="secondary">Open</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progressPercent}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            progressPercent >= 75
                              ? "bg-emerald-500"
                              : progressPercent >= 50
                              ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Documents</span>
                      <span>
                        <span className="font-semibold">{p.received}</span>
                        <span className="text-muted-foreground">/{p.required}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">{missing} missing</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Link
                        href={`/clients/${p.clientId}/periods/${p.id}`}
                        className="flex-1"
                      >
                        <Button variant="default" size="sm" className="w-full gap-2">
                          <ExternalLink className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
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
                          <Button variant="outline" size="sm" className="gap-2">
                            <Mail className="h-4 w-4" />
                            Remind
                          </Button>
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="mb-6 p-4 md:p-6 rounded-lg border bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Total Periods</p>
            <p className="text-2xl font-bold">{displayPeriods.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Open</p>
            <p className="text-2xl font-bold text-blue-600">
              {displayPeriods.filter((p) => p.status === "open").length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">In Review</p>
            <p className="text-2xl font-bold text-orange-600">
              {displayPeriods.filter((p) => p.status === "in_review").length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Closed</p>
            <p className="text-2xl font-bold text-emerald-600">
              {displayPeriods.filter((p) => p.status === "closed").length}
            </p>
          </div>
        </div>
      </div>

      {/* All Periods Table */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-4">
          All Collections ({filteredPeriods.length})
        </h2>
      </div>

      <div className="rounded-lg border bg-white dark:bg-background shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[640px]">
          <thead className="bg-muted/50">
            <tr className="text-sm">
              <th className="p-3 text-left w-[22%] font-medium">Client</th>
              <th className="p-3 text-left w-[15%] font-medium">Period</th>
              <th className="p-3 text-left w-[12%] font-medium">Requests</th>
              <th className="p-3 text-left w-[10%] font-medium">Docs</th>
              <th className="p-3 text-left w-[12%] font-medium">Status</th>
              <th className="p-3 text-left w-[14%] font-medium">Progress</th>
              <th className="p-3 text-right w-[15%] font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && dataMode === "live" ? (
              <tr>
                <td className="p-4 text-muted-foreground text-center" colSpan={7}>
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading periods…
                  </div>
                </td>
              </tr>
            ) : filteredPeriods.length === 0 ? (
              <tr>
                <td
                  className="p-8 text-muted-foreground text-center"
                  colSpan={7}
                >
                  <div className="space-y-2">
                    <p className="text-lg font-medium">No periods found</p>
                    <p className="text-sm">
                      {dataMode === "mock"
                        ? "Try changing the filter"
                        : "Create a period to get started"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPeriods.map((p) => {
                const progressPercent = Math.round(
                  (p.received / p.required) * 100
                );
                return (
                  <tr
                    key={p.id}
                    className="border-t text-sm hover:bg-muted/40 transition-colors"
                  >
                    <td className="p-3 font-medium">{p.clientName}</td>

                    <td className="p-3">
                      <Link
                        href={`/clients/${p.clientId}/periods/${p.id}`}
                        className="underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {p.year}-{String(p.month).padStart(2, "0")}
                      </Link>
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          p.received >= p.required
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : ""
                        }
                      >
                        {p.received}/{p.required}
                      </span>
                    </td>

                    <td className="p-3">{p.docs}</td>

                    <td className="p-3">
                      <Badge
                        variant={
                          p.status === "open"
                            ? "secondary"
                            : p.status === "in_review"
                            ? "outline"
                            : "default"
                        }
                      >
                        {p.status.replace("_", " ")}
                      </Badge>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
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
                        <span className="text-xs text-muted-foreground min-w-[3ch]">
                          {progressPercent}%
                        </span>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/clients/${p.clientId}/periods/${p.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <ExternalLink className="h-3.5 w-3.5" />
                            View
                          </Button>
                        </Link>
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
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Mail className="h-3.5 w-3.5" />
                                Remind
                              </Button>
                            }
                          />
                        )}
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
    </div>
  );
}
