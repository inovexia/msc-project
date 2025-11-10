"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Progress } from "@repo/design-system/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/design-system/components/ui/dialog";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { Switch } from "@repo/design-system/components/ui/switch";
import {
  CheckCircle2,
  Upload,
  FileText,
  AlertCircle,
  Clock,
  Building2,
  Calendar,
  X,
  CheckCheck,
  CirclePlus,
} from "lucide-react";
import { getMockPeriodDetails } from "@/lib/mock-period-workspace";
import type { PeriodRequest, Document, Period, Client } from "@/lib/types";

type PeriodType = "monthly" | "quarterly" | "yearly";

export default function UploadPortalPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const periodId = searchParams.get("period") || "period-1";
  const isAccountant = searchParams.get("role") === "accountant";

  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [filter, setFilter] = React.useState<"all" | "pending" | "uploaded">(
    "all"
  );
  const [selectedRequestId, setSelectedRequestId] = React.useState<
    string | null
  >(null);
  const [uploadedFiles, setUploadedFiles] = React.useState<
    Map<string, { filename: string; uploadedAt: string }>
  >(new Map());

  // Track manual completion status (toggle switch)
  const [completionStatus, setCompletionStatus] = React.useState<
    Map<string, boolean>
  >(new Map());

  // Modal state for adding new documents
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newDocTitle, setNewDocTitle] = React.useState("");
  const [newDocCategory, setNewDocCategory] = React.useState("additional");
  const [newDocRequired, setNewDocRequired] = React.useState(false);

  // Period selection state
  const [periodType, setPeriodType] = React.useState<PeriodType>("monthly");
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  // Load period data
  const mockData = React.useMemo(
    () => getMockPeriodDetails(periodId),
    [periodId]
  );
  const { client, period, requests: initialRequests, link } = mockData;

  const [requests, setRequests] =
    React.useState<PeriodRequest[]>(initialRequests);
  React.useEffect(() => setRequests(initialRequests), [initialRequests]);

  // Check if link is expired
  const isExpired = React.useMemo(() => {
    if (!link?.expiresAt) return false;
    return new Date(link.expiresAt) < new Date();
  }, [link]);

  const selectedRequest = React.useMemo(
    () => requests.find((req) => req.id === selectedRequestId),
    [requests, selectedRequestId]
  );

  const filteredRequests = React.useMemo(() => {
    if (filter === "all") return requests;
    if (filter === "pending") {
      return requests.filter((req) => !completionStatus.get(req.id));
    }
    return requests.filter((req) => completionStatus.get(req.id));
  }, [requests, filter, completionStatus]);

  const completedCount = Array.from(completionStatus.values()).filter(
    Boolean
  ).length;
  const totalCount = requests.length;
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleToggleCompletion = (id: string, checked: boolean) => {
    setCompletionStatus((prev) => {
      const next = new Map(prev);
      next.set(id, checked);
      return next;
    });
  };

  const handleAddRequest = () => {
    if (!newDocTitle.trim()) {
      alert("Please enter a document title");
      return;
    }

    const newReq: PeriodRequest = {
      id: `req-${Date.now()}`,
      title: newDocTitle.trim(),
      category: newDocCategory,
      required: newDocRequired,
    };
    setRequests((prev) => [...prev, newReq]);

    // Reset form and close modal
    setNewDocTitle("");
    setNewDocCategory("additional");
    setNewDocRequired(false);
    setIsAddModalOpen(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];
      if (!allowedTypes.includes(droppedFile.type)) {
        alert("Please upload a PDF or image file (PNG, JPG, JPEG)");
        return;
      }

      const maxSize = 50 * 1024 * 1024;
      if (droppedFile.size > maxSize) {
        alert("File size must be less than 50MB");
        return;
      }

      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert("Please upload a PDF or image file (PNG, JPG, JPEG)");
        return;
      }

      const maxSize = 50 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        alert("File size must be less than 50MB");
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedRequestId) return;

    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setUploadedFiles((prev) => {
        const next = new Map(prev);
        next.set(selectedRequestId, {
          filename: file.name,
          uploadedAt: new Date().toISOString(),
        });
        return next;
      });

      // Auto-toggle completion status when upload succeeds
      setCompletionStatus((prev) => {
        const next = new Map(prev);
        next.set(selectedRequestId, true);
        return next;
      });

      setFile(null);
      setUploadProgress(0);

      alert(`✓ ${file.name} uploaded successfully!`);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      clearInterval(interval);
      setUploading(false);
    }
  };

  // Generate period options based on type
  const getPeriodOptions = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (periodType === "monthly") {
      const months = [];
      for (let year = currentYear; year >= currentYear - 2; year--) {
        for (let month = 12; month >= 1; month--) {
          if (year === currentYear && month > currentMonth) continue;
          months.push({
            value: `${year}-${String(month).padStart(2, "0")}`,
            label: new Date(year, month - 1).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            }),
          });
        }
      }
      return months;
    } else if (periodType === "quarterly") {
      const quarters = [];
      for (let year = currentYear; year >= currentYear - 2; year--) {
        for (let q = 4; q >= 1; q--) {
          const quarterMonth = q * 3;
          if (year === currentYear && quarterMonth > currentMonth) continue;
          quarters.push({
            value: `${year}-Q${q}`,
            label: `Q${q} ${year}`,
          });
        }
      }
      return quarters;
    } else {
      const years = [];
      for (let year = currentYear; year >= currentYear - 5; year--) {
        years.push({
          value: String(year),
          label: String(year),
        });
      }
      return years;
    }
  };

  const periodOptions = getPeriodOptions();

  // Show expired link message
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Link Expired</h2>
            <p className="text-muted-foreground mb-4">
              This upload link has expired. Please contact your accountant for a
              new link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Upload files</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">
                    {client?.name || "Loading..."}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-3 mb-4">
            <Select
              value={periodType}
              onValueChange={(value: PeriodType) => {
                setPeriodType(value);
                const now = new Date();
                if (value === "monthly") {
                  setSelectedPeriod(
                    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
                      2,
                      "0"
                    )}`
                  );
                } else if (value === "quarterly") {
                  const quarter = Math.ceil((now.getMonth() + 1) / 3);
                  setSelectedPeriod(`${now.getFullYear()}-Q${quarter}`);
                } else {
                  setSelectedPeriod(String(now.getFullYear()));
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground">
              select period (Monthly, quarterly, Yearly)
            </span>
          </div>

          {/* Selected Period Display */}
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {periodType === "monthly" &&
                new Date(selectedPeriod + "-01").toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              {periodType === "quarterly" && selectedPeriod}
              {periodType === "yearly" && selectedPeriod}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {completedCount} of {totalCount} documents completed
              </span>
              <span className="text-muted-foreground">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel: Document Requests List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>
                    Documents Requested for{" "}
                    {periodType === "monthly" &&
                      new Date(selectedPeriod + "-01").toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    {periodType === "quarterly" && selectedPeriod}
                    {periodType === "yearly" && selectedPeriod}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsAddModalOpen(true)}
                    title="Add document request"
                  >
                    <CirclePlus className="h-5 w-5" />
                  </Button>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-28rem)] overflow-y-auto">
                  {filteredRequests.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No {filter} documents found</p>
                    </div>
                  ) : (
                    filteredRequests.map((request) => {
                      const isUploaded = uploadedFiles.has(request.id);
                      const uploadInfo = uploadedFiles.get(request.id);
                      const isSelected = selectedRequestId === request.id;
                      const isCompleted = completionStatus.get(request.id);

                      return (
                        <div
                          key={request.id}
                          onClick={() => setSelectedRequestId(request.id)}
                          className={`w-full text-left p-4 border-b border-border transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-primary/10 border-l-4 border-l-primary"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium truncate">
                                  {request.title}
                                </span>
                              </div>
                              {request.required && !isCompleted && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Required
                                </Badge>
                              )}
                              {isUploaded && uploadInfo && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {uploadInfo.filename}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-orange-500" />
                              )}
                              <Switch
                                checked={Boolean(isCompleted)}
                                onCheckedChange={(checked) =>
                                  handleToggleCompletion(request.id, checked)
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="scale-75"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Upload Portal */}
          <div className="lg:col-span-3">
            <Card className="min-h-[calc(100vh-28rem)]">
              <CardHeader>
                <CardTitle>Upload portal</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!selectedRequest ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-lg text-muted-foreground">
                        Select a document from the list to begin uploading
                      </p>
                    </div>
                  </div>
                ) : uploadedFiles.has(selectedRequest.id) ? (
                  <div className="flex flex-col items-center justify-center h-96">
                    <CheckCircle2 className="h-20 w-20 text-green-600 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Completed</h3>
                    {uploadedFiles.has(selectedRequest.id) &&
                      uploadedFiles.get(selectedRequest.id) && (
                        <>
                          <p className="text-muted-foreground mb-1">
                            {uploadedFiles.get(selectedRequest.id)?.filename}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded{" "}
                            {new Date(
                              uploadedFiles.get(selectedRequest.id)!.uploadedAt
                            ).toLocaleString()}
                          </p>
                        </>
                      )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Document Info */}
                    <div className="border-b pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold">
                          {selectedRequest.title}
                        </h3>
                        {selectedRequest.required && (
                          <Badge variant="destructive">Required</Badge>
                        )}
                      </div>
                      {selectedRequest.category && (
                        <Badge variant="secondary" className="capitalize">
                          {selectedRequest.category}
                        </Badge>
                      )}
                    </div>

                    {/* File Input (hidden) */}
                    <input
                      type="file"
                      id="file-input"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileSelect}
                    />

                    {/* Drag & Drop Zone */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() =>
                        document.getElementById("file-input")?.click()
                      }
                      className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center cursor-pointer bg-muted/20 hover:bg-muted/30 hover:border-primary/50 transition-all"
                    >
                      {file ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-3">
                            <FileText className="h-12 w-12 text-primary" />
                            <X
                              className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer absolute top-4 right-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                              }}
                            />
                          </div>
                          <div>
                            <p className="text-lg font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-16 w-16 mx-auto text-muted-foreground" />
                          <div>
                            <p className="text-lg font-semibold mb-1">
                              Drag & drop your file here
                            </p>
                            <p className="text-sm text-muted-foreground">
                              or click to browse
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Supports: PDF, PNG, JPG (Max 50MB)
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-sm text-center text-muted-foreground">
                          Uploading... {uploadProgress}%
                        </p>
                      </div>
                    )}

                    {/* Upload Button */}
                    {file && !uploading && (
                      <Button
                        onClick={handleUpload}
                        size="lg"
                        className="w-full gap-2"
                      >
                        <Upload className="h-5 w-5" />
                        Upload {file.name}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Completion Message */}
        {completedCount === totalCount && totalCount > 0 && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCheck className="h-10 w-10 text-green-600" />
                <div>
                  <h3 className="font-bold text-green-900 mb-1">
                    All Documents Completed!
                  </h3>
                  <p className="text-sm text-green-700">
                    Thank you! Your accountant will review your documents
                    shortly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Document Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Document Request</DialogTitle>
            <DialogDescription>
              Add a new document to the upload request list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="doc-title">Document Title</Label>
              <Input
                id="doc-title"
                placeholder="e.g., Bank Statement"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="doc-category">Category</Label>
              <Select value={newDocCategory} onValueChange={setNewDocCategory}>
                <SelectTrigger id="doc-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="tax">Tax</SelectItem>
                  <SelectItem value="additional">Additional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="doc-required">Mark as Required</Label>
              <Switch
                id="doc-required"
                checked={newDocRequired}
                onCheckedChange={setNewDocRequired}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRequest}>Add Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
