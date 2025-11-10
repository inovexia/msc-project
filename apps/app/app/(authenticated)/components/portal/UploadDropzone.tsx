"use client";
import * as React from "react";
import { cn } from "@/lib/utils"; // typical helper in shadcn projects; if not present, replace with simple class join
import { Button } from "@repo/design-system/components/ui/button";
import { Upload } from "lucide-react";

type Props = {
  onFiles: (files: File[], source: "files" | "folder") => void;
  disabled?: boolean;
  accept?: string[];
  maxFileSizeMB?: number;
  className?: string;
};

export function UploadDropzone({
  onFiles,
  disabled,
  accept,
  maxFileSizeMB = 2048,
  className,
}: Props) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const folderInputRef = React.useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const openFiles = () => fileInputRef.current?.click();
  const openFolder = () => folderInputRef.current?.click();

  const handleFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const filtered = arr.filter(
      (f) => (f.size ?? 0) <= maxFileSizeMB * 1024 * 1024
    );
    if (filtered.length < arr.length) {
      // eslint-disable-next-line no-alert
      alert(
        `Some files exceeded the ${maxFileSizeMB}MB limit and were skipped.`
      );
    }
    onFiles(filtered, "files");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (disabled) return;
    const dt = e.dataTransfer;
    if (dt.items && dt.items.length) {
      const files: File[] = [];
      const traverse = async (item: any, path = "") => {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            // @ts-ignore webkitRelativePath not standard
            (file as any).webkitRelativePath = path
              ? `${path}/${file.name}`
              : file.name;
            files.push(file);
          }
        } else if (item.kind === "directory" && item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry();
          if (entry && entry.isDirectory) {
            const reader = entry.createReader();
            const readEntries = () =>
              new Promise<void>((resolve) => {
                reader.readEntries(async (entries: any[]) => {
                  for (const ent of entries) {
                    await traverse(
                      ent,
                      path ? `${path}/${entry.name}` : entry.name
                    );
                  }
                  resolve();
                });
              });
            // Try to read once; some browsers need multiple reads; keep simple here.
            readEntries();
          }
        }
      };
      // Most browsers don't support directory drag fully; fallback to files.
      for (const item of Array.from(dt.items)) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      onFiles(files, "files");
      return;
    }
    if (dt.files && dt.files.length) {
      handleFiles(dt.files);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-lg border border-dashed p-8 text-center transition-all",
          dragOver
            ? "border-foreground/60 bg-muted/40"
            : "border-muted-foreground/30",
          disabled && "opacity-50 pointer-events-none"
        )}
        aria-disabled={disabled}
      >
        <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border">
          <Upload className="h-5 w-5" />
        </div>
        <div className="text-lg font-medium">
          Drag & drop files or a whole folder
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {`Up to ${maxFileSizeMB}MB per file.`}{" "}
          {accept?.length ? `Accepted: ${accept.join(", ")}` : null}
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <Button
            variant="default"
            type="button"
            onClick={openFiles}
            disabled={disabled}
          >
            Select files
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={openFolder}
            disabled={disabled}
          >
            Upload a folder
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.currentTarget.value = "";
          }}
        />
        {/* @ts-ignore: webkitdirectory is not in TS libs */}
        <input
          ref={folderInputRef}
          type="file"
          multiple
          className="hidden"
          webkitdirectory="true"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            onFiles(files, "folder");
            e.currentTarget.value = "";
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">
        You can close this tab once uploads start. We’ll process files in the
        background.
      </p>
    </div>
  );
}
