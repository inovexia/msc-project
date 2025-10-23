"use client";

import * as React from "react";
import { listPeriods } from "@/lib/api";
import { mockPeriods } from "@/lib/mock-periods";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { RefreshCw, Database, Beaker } from "lucide-react";
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

  const displayPeriods = dataMode === "mock" ? mockPeriods : periods;

  return (
    <div className="container max-w-6xl py-8 px-6 md:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Client Periods</h1>
          <p className="text-sm text-muted-foreground">
            Select a period to view and manage uploaded documents.
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

      <div className="rounded-lg border bg-white dark:bg-background shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[640px]">
          <thead className="bg-muted/50">
            <tr className="text-sm">
              <th className="p-3 text-left w-[25%] font-medium">Client</th>
              <th className="p-3 text-left w-[20%] font-medium">Period</th>
              <th className="p-3 text-left w-[15%] font-medium">Requests</th>
              <th className="p-3 text-left w-[15%] font-medium">Docs</th>
              <th className="p-3 text-left w-[15%] font-medium">Status</th>
              <th className="p-3 text-left w-[10%] font-medium">Progress</th>
            </tr>
          </thead>

          <tbody>
            {loading && dataMode === "live" ? (
              <tr>
                <td className="p-4 text-muted-foreground text-center" colSpan={6}>
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading periods…
                  </div>
                </td>
              </tr>
            ) : displayPeriods.length === 0 ? (
              <tr>
                <td
                  className="p-8 text-muted-foreground text-center"
                  colSpan={6}
                >
                  <div className="space-y-2">
                    <p className="text-lg font-medium">No periods found</p>
                    <p className="text-sm">
                      {dataMode === "mock"
                        ? "Mock data is empty"
                        : "Create a period to get started"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              displayPeriods.map((p) => {
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
