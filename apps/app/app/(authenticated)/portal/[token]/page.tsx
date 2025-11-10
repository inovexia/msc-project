"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  bootstrapPortal,
  confirmUpload,
  listDocuments,
  assignDocument,
} from "@/lib/api";
import type { Document, MagicLinkBootstrap } from "@/lib/types";
import { UploadDropzone } from "@/app/components/portal/UploadDropzone";
import {
  UploadQueue,
  type QueueItem,
} from "@/app/components/portal/UploadQueue";
import { RequestChecklist } from "@/app/components/portal/RequestChecklist";
import { fakeUpload } from "@/lib/fakeUploader";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { format } from "date-fns";

export default function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = React.use(params);
  const [boot, setBoot] = React.useState<MagicLinkBootstrap | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [queue, setQueue] = React.useState<QueueItem[]>([]);
  const [selectedRequestId, setSelectedRequestId] = React.useState<
    string | null
  >(null);
  const search = useSearchParams();

  const refreshDocs = React.useCallback(async () => {
    if (!boot) return;
    const docs = await listDocuments(boot.period.id);
    setBoot({ ...boot, documents: docs });
  }, [boot]);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await bootstrapPortal(token);
        setBoot(data);
        setLoading(false);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
        setLoading(false);
      }
    })();
  }, [token]);

  React.useEffect(() => {
    const t = setInterval(() => {
      refreshDocs();
    }, 1500);
    return () => clearInterval(t);
  }, [refreshDocs]);

  const onFiles = async (files: File[], source: "files" | "folder") => {
    if (!boot) return;
    const newItems: QueueItem[] = files.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      // @ts-ignore: webkitRelativePath
      relativePath: f.webkitRelativePath || undefined,
      status: "presigning",
      progress: 0,
      requestId: selectedRequestId || undefined,
    }));
    setQueue((q) => [...newItems, ...q]);
    // Simulate direct-to-storage upload, then call confirm
    for (const [i, f] of files.entries()) {
      const qid = newItems[i].id;
      try {
        setQueue((prev) =>
          prev.map((x) => (x.id === qid ? { ...x, status: "uploading" } : x))
        );
        await fakeUpload(
          f,
          (pct) => {
            setQueue((prev) =>
              prev.map((x) => (x.id === qid ? { ...x, progress: pct } : x))
            );
          },
          { speed: 1.5 }
        );
        setQueue((prev) =>
          prev.map((x) => (x.id === qid ? { ...x, status: "verifying" } : x))
        );
        await confirmUpload({
          periodId: boot.period.id,
          clientId: boot.client.id,
          firmId: boot.client.firmId,
          filename: f.name,
          byteSize: f.size,
          contentType: f.type || "application/octet-stream",
          // @ts-ignore: webkitRelativePath
          relativePath: f.webkitRelativePath || undefined,
          requestId: selectedRequestId || undefined,
        });
        setQueue((prev) =>
          prev.map((x) =>
            x.id === qid ? { ...x, status: "processing", progress: 100 } : x
          )
        );
      } catch (e: any) {
        setQueue((prev) =>
          prev.map((x) =>
            x.id === qid
              ? { ...x, status: "failed", error: e?.message || "Error" }
              : x
          )
        );
      } finally {
        refreshDocs();
      }
    }
  };

  const countsByRequest: Record<string, number> = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of boot?.documents || []) {
      if (d.periodRequestId)
        counts[d.periodRequestId] = (counts[d.periodRequestId] || 0) + 1;
    }
    return counts;
  }, [boot?.documents]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-destructive">Error: {error}</div>;
  if (!boot) return null;

  const monthLabel = `${boot.period.year}-${String(boot.period.month).padStart(
    2,
    "0"
  )}`;
  const expires = format(new Date(boot.link.expiresAt), "MMM d, yyyy");

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Upload documents for {boot.client.name} — {monthLabel}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Only your accountant can see these files. This link expires{" "}
          <span className="font-medium">{expires}</span>.
        </p>
        <div className="mt-2">
          <Badge variant="outline">Status: {boot.period.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-sm font-medium mb-2">Request checklist</h2>
          <RequestChecklist
            items={boot.requests}
            selectedId={selectedRequestId}
            onSelect={setSelectedRequestId}
            counts={countsByRequest}
          />
        </div>
        <div className="lg:col-span-2">
          <UploadDropzone onFiles={onFiles} maxFileSizeMB={2048} />
          <UploadQueue
            items={queue}
            requests={boot.requests}
            onAssign={async (qid, rid) => {
              setQueue((q) =>
                q.map((x) =>
                  x.id === qid ? { ...x, requestId: rid || undefined } : x
                )
              );
              // No server call here; assignment happens on documents after confirm.
            }}
            onRemove={(qid) => setQueue((q) => q.filter((x) => x.id !== qid))}
            onRetry={(qid) => {
              /* handled by onFiles if you want to requeue */
            }}
          />

          <div className="mt-10">
            <h3 className="text-sm font-medium mb-2">Recent uploads</h3>
            <div className="space-y-2">
              {boot.documents.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Nothing yet.
                </div>
              ) : (
                boot.documents.slice(0, 10).map((d: Document) => (
                  <div
                    key={d.id}
                    className="rounded-md border p-3 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{d.filename}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.extracted?.relativePath ? (
                          <span className="mr-2">
                            {d.extracted?.relativePath}
                          </span>
                        ) : null}
                        {(d.byteSize / 1024).toFixed(0)} KB
                      </div>
                    </div>
                    <Badge
                      variant={
                        d.status === "clean"
                          ? "default"
                          : d.status === "processing"
                          ? "secondary"
                          : d.status === "quarantined"
                          ? "destructive"
                          : d.status === "duplicate"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {d.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
