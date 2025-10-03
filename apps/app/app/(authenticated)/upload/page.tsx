"use client";

import { useState, DragEvent } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    alert(JSON.stringify(data));
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="w-96 h-48 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer"
      >
        {file ? <p>{file.name}</p> : <p>Drag & Drop file here</p>}
      </div>

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      )}
    </div>
  );
}
