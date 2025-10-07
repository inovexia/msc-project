"use client";
import * as React from "react";
import { Document } from "@/lib/types";
import { Badge } from "@repo/design-system/components/ui/badge";

export function FileViewer({ doc }: { doc: Document | null }) {
  if (!doc) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
        Select a document to preview
      </div>
    );
  }
  const canInline =
    doc.contentType?.startsWith("image/") ||
    doc.contentType === "application/pdf";
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b p-3">
        <div>
          <div className="font-medium">{doc.filename}</div>
          <div className="text-xs text-muted-foreground">
            Size: {(doc.byteSize / 1024).toFixed(0)} KB
          </div>
        </div>
        <Badge>{doc.status}</Badge>
      </div>
      <div className="flex-1 overflow-auto p-3">
        {canInline ? (
          <div className="rounded-md border overflow-hidden">
            <iframe
              src={doc.fileKey?.startsWith("http") ? doc.fileKey : undefined}
              title="preview"
              className="w-full h-[60vh]"
            />
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No preview. Download to view.
          </div>
        )}
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium">Extracted</div>
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Vendor</dt>
              <dd>{doc.extracted?.vendor ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Date</dt>
              <dd>{doc.extracted?.date ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Amount</dt>
              <dd>
                {typeof doc.extracted?.amount === "number"
                  ? doc.extracted?.amount.toFixed(2)
                  : "-"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
