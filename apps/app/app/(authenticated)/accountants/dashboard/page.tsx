"use client";

import { useState } from "react";
import { mockAccountantData, type Client } from "./data";
import { InboxView } from "./components/inbox-view";
import { ClientView } from "./components/client-view";
import { ViewToggle, type ViewMode } from "./components/view-toggle";
import { Button } from "@repo/design-system/components/ui/button";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { RefreshCw, Database, Beaker } from "lucide-react";

export default function AccountantDashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("inbox");
  const [dataMode, setDataMode] = useState<"mock" | "live">("mock");

  // Fetch real data
  const { clients: liveClients, loading, error, stats, refresh } = useDashboardData();

  // Choose data source based on mode
  const clientsData: Client[] = dataMode === "mock" ? mockAccountantData : liveClients;

  return (
    <div className="flex flex-col w-full h-screen bg-background">
      {/* Header with View Toggle */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Accountant Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and review client documents
          </p>
        </div>
        <div className="flex items-center gap-3">
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
              onClick={refresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}

          {/* View Toggle */}
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>

      {/* Stats Bar (only for live mode) */}
      {dataMode === "live" && !loading && (
        <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Total:</span>{" "}
            <span className="font-semibold">{stats.totalDocuments}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Needs Review:</span>{" "}
            <span className="font-semibold text-orange-600">{stats.needsReview}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Processing:</span>{" "}
            <span className="font-semibold">{stats.processing}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Approved:</span>{" "}
            <span className="font-semibold text-emerald-600">{stats.approved}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Unassigned:</span>{" "}
            <span className="font-semibold text-orange-600">{stats.unassignedCount}</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {dataMode === "live" && error && (
        <div className="border-b border-border bg-destructive/10 px-4 py-2 text-sm text-destructive">
          Error loading data: {error}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {loading && dataMode === "live" ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === "inbox" ? (
              <InboxView clients={clientsData} />
            ) : (
              <ClientView clients={clientsData} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
