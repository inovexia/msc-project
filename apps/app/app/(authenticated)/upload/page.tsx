"use client";

import { DragEvent, useMemo, useState } from "react";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { CheckCircle2, Upload, FileText, AlertCircle } from "lucide-react";

type Document = {
  id: string;
  title: string;
  status: "pending" | "uploaded";
};

const mockDocuments: Document[] = [
  { id: "doc1", title: "2024 Tax Return", status: "pending" },
  { id: "doc2", title: "Proof of Identity", status: "pending" },
  { id: "doc3", title: "Business License", status: "uploaded" },
  { id: "doc4", title: "W-9 Form", status: "pending" },
  { id: "doc5", title: "Previous Year Financials", status: "uploaded" },
];

export default function UploadPortalPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [filter, setFilter] = useState<"pending" | "uploaded">("pending");

  const [selectedDocId, setSelectedDocId] = useState<string | null>("doc1");

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedDocId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    formData.append("documentId", selectedDocId);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      alert(`Upload successful for ${file.name}!`);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const selectedDocument = useMemo(
    () => mockDocuments.find((doc) => doc.id === selectedDocId),
    [selectedDocId]
  );

  const filteredDocuments = useMemo(
    () => mockDocuments.filter((doc) => doc.status === filter),
    [filter]
  );

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
        {/* Left Panel: Document List */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-8rem)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Required Documents
              </CardTitle>
              {/* Filter Tabs */}
              <div className="flex space-x-2">
                <Button
                  variant={filter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("pending")}
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Pending
                </Button>
                <Button
                  variant={filter === "uploaded" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("uploaded")}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Uploaded
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Scrollable Document List */}
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
                {filteredDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full text-left p-4 border-b border-border flex justify-between items-center transition-colors ${
                      selectedDocId === doc.id
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{doc.title}</span>
                    </div>
                    {doc.status === "uploaded" && (
                      <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Uploaded
                      </span>
                    )}
                  </button>
                ))}
                {filteredDocuments.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No {filter} documents found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: File Uploader */}
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-8rem)]">
            <CardContent className="p-6 h-full flex items-center justify-center">
              {selectedDocument && selectedDocument.status === "pending" ? (
                <div className="w-full max-w-lg flex flex-col items-center justify-center gap-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">Upload Document</h3>
                    <p className="text-muted-foreground">
                      {selectedDocument.title}
                    </p>
                  </div>

                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="w-full h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer bg-muted/20 hover:bg-muted/30 transition-colors duration-300"
                  >
                    {file ? (
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium">
                          Drag & Drop file here
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          or click to browse
                        </p>
                      </div>
                    )}
                  </div>

                  {file && (
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full"
                      size="lg"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload {file.name}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-4">
                    {selectedDocument?.status === "uploaded" ? (
                      <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
                    ) : (
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground">
                    {selectedDocument?.status === "uploaded"
                      ? `"${selectedDocument.title}" has already been uploaded.`
                      : "Please select a pending document from the list to begin."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
