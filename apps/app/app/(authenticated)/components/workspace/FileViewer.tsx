"use client";
import * as React from "react";
import { Document } from "@/lib/types";
import { Badge } from "@repo/design-system/components/ui/badge";

export function FileViewer({ doc }: { doc: Document | null }) {
  const [fileUrl, setFileUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!doc) return setFileUrl(null);
    (async () => {
      const res = await fetch(`/api/file/${doc.id}/view`);
      if (res.ok) {
        const data = await res.json();
        setFileUrl(data.url);
      }
    })();
  }, [doc]);

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
        {canInline && fileUrl ? (
          <iframe src={fileUrl} title="preview" className="w-full h-[60vh]" />
        ) : (
          <div className="text-sm text-muted-foreground">
            No preview. Download to view.
          </div>
        )}
      </div>
    </div>
  );
}
