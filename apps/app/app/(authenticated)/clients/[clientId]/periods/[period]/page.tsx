"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { getPeriodDetails, listDocuments, assignDocument } from "@/lib/api";
import { getMockPeriodDetails, getMockDocuments } from "@/lib/mock-period-workspace";
import { Document, PeriodRequest, Period, Client } from "@/lib/types";
import { DocumentTable } from "app/(authenticated)/components/workspace/DocumentTable";
import { FileViewer } from "app/(authenticated)/components/workspace/FileViewer";
import { Button } from "@repo/design-system/components/ui/button";
import { Badge } from "@repo/design-system/components/ui/badge";
import { RefreshCw, Database, Beaker, ArrowLeft, Mail } from "lucide-react";
import { RequestDocumentsDialog } from "@/app/(authenticated)/accountants/dashboard/components/request-documents-dialog";
import Link from "next/link";

export default function PeriodWorkspacePage() {
  const params = useParams<{ clientId: string; period: string }>();
  const [requests, setRequests] = React.useState<PeriodRequest[]>([]);
  const [docs, setDocs] = React.useState<Document[]>([]);
  const [period, setPeriod] = React.useState<Period | null>(null);
  const [client, setClient] = React.useState<Client | null>(null);
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null);
  const [dataMode, setDataMode] = React.useState<"mock" | "live">("mock");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLiveData = React.useCallback(async () => {
    if (!params.period) return;

    try {
      setLoading(true);
      setError(null);
      const periodData = await getPeriodDetails(params.period);
      setRequests(periodData.requests);
      setPeriod(periodData.period);
      setClient(periodData.client);
      setDocs(periodData.documents);
    } catch (error) {
      console.error("Failed to fetch period data:", error);
      setError(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [params.period]);

  const fetchMockData = React.useCallback(() => {
    if (!params.period) return;

    const mockData = getMockPeriodDetails(params.period);
    setRequests(mockData.requests);
    setPeriod(mockData.period);
    setClient(mockData.client);
    setDocs(mockData.documents);
  }, [params.period]);

  React.useEffect(() => {
    if (dataMode === "live") {
      fetchLiveData();
    } else {
      fetchMockData();
    }
  }, [dataMode, fetchLiveData, fetchMockData]);

  // Real-time updates for live mode
  React.useEffect(() => {
    if (dataMode !== "live" || !period) return;

    const interval = setInterval(async () => {
      try {
        const ds = await listDocuments(period.id);
        setDocs(ds);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [dataMode, period]);

  const onAssign = async (docId: string, requestId: string | null) => {
    if (dataMode === "mock") {
      // For mock mode, just update locally
      setDocs((prevDocs) =>
        prevDocs.map((d) =>
          d.id === docId ? { ...d, periodRequestId: requestId } : d
        )
      );
      return;
    }

    // For live mode, call API
    try {
      await assignDocument(docId, requestId);
      if (period) {
        const ds = await listDocuments(period.id);
        setDocs(ds);
      }
    } catch (err) {
      console.error("Failed to assign document:", err);
    }
  };

  const handleDocumentRequest = async (
    requestList: Array<{ title: string; category: string; required: boolean }>,
    message: string
  ) => {
    if (dataMode === "mock") {
      // For mock mode, just show success message
      alert(
        `Document request sent to ${client?.name}\n\nRequested:\n${requestList.map((r) => `- ${r.title}`).join("\n")}\n\nMessage: ${message}`
      );
      return;
    }

    // For live mode, call API
    try {
      const response = await fetch("/api/document-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId: period?.id,
          clientId: client?.id,
          requests: requestList,
          message,
        }),
      });

      if (!response.ok) throw new Error("Failed to send request");

      alert(`Document request sent successfully to ${client?.name}`);

      // Refresh period data
      if (period) {
        fetchLiveData();
      }
    } catch (err) {
      console.error("Failed to send document request:", err);
      alert("Failed to send document request. Please try again.");
    }
  };

  const selected = docs.find((d) => d.id === selectedDocId) || null;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-2">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Loading period data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <Link href="/clients">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Periods
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-xl font-bold">
                {client?.name || "Loading..."}
              </h1>
              <p className="text-sm text-muted-foreground">
                {period
                  ? `${period.year}-${String(period.month).padStart(2, "0")} Period`
                  : "Loading period..."}
              </p>
            </div>
            {period && getStatusBadge(period.status)}
          </div>

          <div className="flex items-center gap-3">
            {/* Request Documents Button */}
            {period && client && period.status === "open" && (
              <RequestDocumentsDialog
                clientName={client.name}
                periodName={`${period.year}-${String(period.month).padStart(2, "0")}`}
                onSubmit={handleDocumentRequest}
                trigger={
                  <Button variant="default" size="sm" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Request Documents
                  </Button>
                }
              />
            )}

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

            {/* Refresh Button */}
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

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Total Documents:</span>{" "}
            <span className="font-semibold">{docs.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Requests:</span>{" "}
            <span className="font-semibold">
              {requests.filter((r) => r.status !== "pending").length}/
              {requests.length}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Assigned:</span>{" "}
            <span className="font-semibold">
              {docs.filter((d) => d.periodRequestId).length}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Unassigned:</span>{" "}
            <span className="font-semibold text-orange-600">
              {docs.filter((d) => !d.periodRequestId && d.status === "clean").length}
            </span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && dataMode === "live" && (
        <div className="mx-6 mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 h-full">
          <div className="lg:col-span-3 flex flex-col">
            <div className="mb-2 text-sm font-medium">Documents</div>
            <div className="flex-1 overflow-hidden">
              <DocumentTable
                documents={docs}
                requests={requests}
                onAssign={onAssign}
                onSelect={setSelectedDocId}
                selectedId={selectedDocId}
              />
            </div>
          </div>
          <div className="lg:col-span-2 flex flex-col">
            <div className="mb-2 text-sm font-medium">Preview</div>
            <div className="flex-1 rounded-lg border overflow-hidden">
              <FileViewer doc={selected} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
