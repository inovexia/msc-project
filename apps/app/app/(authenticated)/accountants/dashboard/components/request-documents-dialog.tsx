"use client";

import * as React from "react";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Mail,
  ChevronDown,
  ChevronUp,
  Eye,
  Zap,
  Building2,
  ListChecks,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/design-system/components/ui/collapsible";

type DocumentRequest = {
  title: string;
  category: string;
  required: boolean;
};

type DocumentStatus = "missing" | "uploaded" | "pending";

type SuggestedDocument = {
  title: string;
  category: string;
  status: DocumentStatus;
  statusText?: string;
};

type Template = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  documents: Array<{ title: string; category: string }>;
};

type RequestDocumentsDialogProps = {
  clientName: string;
  periodName: string;
  onSubmit: (requests: DocumentRequest[], message: string) => void | Promise<void>;
  trigger?: React.ReactNode;
  suggestedDocuments?: SuggestedDocument[];
};

export function RequestDocumentsDialog({
  clientName,
  periodName,
  onSubmit,
  trigger,
  suggestedDocuments,
}: RequestDocumentsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDocs, setSelectedDocs] = React.useState<Map<string, boolean>>(new Map());
  const [message, setMessage] = React.useState(
    `Hi,\n\nPlease upload the following documents for ${periodName}.\n\nThank you!`
  );
  const [loading, setLoading] = React.useState(false);
  const [showMessage, setShowMessage] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);

  // Define templates
  const templates: Template[] = [
    {
      id: "standard",
      name: "Standard Monthly",
      icon: <Zap className="h-5 w-5" />,
      description: "Most common requests",
      documents: [
        { title: "Bank Statement", category: "statement" },
        { title: "Credit Card Statement", category: "statement" },
        { title: "Rent Invoice", category: "invoice" },
        { title: "Utility Bill", category: "bill" },
        { title: "Payroll Records", category: "other" },
      ],
    },
    {
      id: "full",
      name: "Full Month-End",
      icon: <Building2 className="h-5 w-5" />,
      description: "Comprehensive package",
      documents: [
        { title: "Bank Statement", category: "statement" },
        { title: "Credit Card Statement", category: "statement" },
        { title: "Rent Invoice", category: "invoice" },
        { title: "Utility Bill", category: "bill" },
        { title: "Payroll Records", category: "other" },
        { title: "Tax Documents", category: "other" },
        { title: "Receipt", category: "receipt" },
        { title: "Invoice", category: "invoice" },
      ],
    },
  ];

  // Mock suggested documents if not provided
  const suggestions = React.useMemo(() => {
    if (suggestedDocuments) return suggestedDocuments;

    return [
      { title: "Bank Statement", category: "statement", status: "missing", statusText: "Usually uploaded by day 10" },
      { title: "Rent Invoice", category: "invoice", status: "missing", statusText: "Last uploaded Oct 5" },
      { title: "Payroll Records", category: "other", status: "uploaded", statusText: "Uploaded Oct 18" },
      { title: "Credit Card Statement", category: "statement", status: "pending", statusText: "Requested Oct 20" },
    ] as SuggestedDocument[];
  }, [suggestedDocuments]);

  // Common quick-add documents
  const commonDocuments = React.useMemo(() => [
    { title: "Bank Statement", category: "statement" },
    { title: "Credit Card Statement", category: "statement" },
    { title: "Utility Bill", category: "bill" },
    { title: "Rent Invoice", category: "invoice" },
    { title: "Payroll Records", category: "other" },
    { title: "Tax Documents", category: "other" },
    { title: "Receipt", category: "receipt" },
    { title: "Invoice", category: "invoice" },
  ], []);

  // Initialize selected docs with missing suggestions
  React.useEffect(() => {
    if (open) {
      const initialSelection = new Map<string, boolean>();
      suggestions.forEach((doc) => {
        if (doc.status === "missing") {
          initialSelection.set(doc.title, true);
        }
      });
      setSelectedDocs(initialSelection);
    }
  }, [open]);

  const applyTemplate = (template: Template) => {
    const newSelection = new Map<string, boolean>();
    template.documents.forEach((doc) => {
      newSelection.set(doc.title, true);
    });
    setSelectedDocs(newSelection);
  };

  const toggleDocument = (title: string) => {
    setSelectedDocs((prev) => {
      const next = new Map(prev);
      next.set(title, !prev.get(title));
      return next;
    });
  };

  const getSelectedDocuments = (): DocumentRequest[] => {
    const docs: DocumentRequest[] = [];

    selectedDocs.forEach((isSelected, title) => {
      if (isSelected) {
        // Find category from suggestions or common documents
        const suggestion = suggestions.find((s) => s.title === title);
        const common = commonDocuments.find((c) => c.title === title);
        const category = suggestion?.category || common?.category || "other";

        docs.push({ title, category, required: true });
      }
    });

    return docs;
  };

  const handleSubmit = async () => {
    const requests = getSelectedDocuments();

    if (requests.length === 0) {
      alert("Please select at least one document to request");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(requests, message);
      setOpen(false);
      // Reset form
      setSelectedDocs(new Map());
      setMessage(
        `Hi,\n\nPlease upload the following documents for ${periodName}.\n\nThank you!`
      );
      setShowMessage(false);
      setShowPreview(false);
    } catch (error) {
      console.error("Failed to send request:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case "missing":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Missing
          </Badge>
        );
      case "uploaded":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Uploaded
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Requested
          </Badge>
        );
    }
  };

  const selectedCount = Array.from(selectedDocs.values()).filter(Boolean).length;
  const newRequestsCount = Array.from(selectedDocs.entries())
    .filter(([title, isSelected]) => {
      if (!isSelected) return false;
      const suggestion = suggestions.find((s) => s.title === title);
      return !suggestion || suggestion.status === "missing";
    })
    .length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Mail className="h-4 w-4" />
            Request Documents
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <div className="space-y-1">
            <DialogTitle className="text-2xl">Request Documents</DialogTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-muted-foreground">Period:</span>
              <span className="font-medium">{periodName}</span>
              <span className="text-muted-foreground">•</span>
              <span className="font-semibold text-muted-foreground">Client:</span>
              <span className="font-medium">{clientName}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Quick Start Templates */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Start Templates
              </h3>
              <p className="text-sm text-muted-foreground">
                Click a template to instantly select all included documents
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="flex flex-col items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-accent transition-all text-left group"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="text-primary group-hover:scale-110 transition-transform">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.description}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {template.documents.length}
                    </Badge>
                  </div>
                  <div className="w-full pl-8">
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {template.documents.slice(0, 3).map((doc) => (
                        <li key={doc.title} className="flex items-center gap-1">
                          <span className="text-[10px]">•</span>
                          {doc.title}
                        </li>
                      ))}
                      {template.documents.length > 3 && (
                        <li className="flex items-center gap-1 font-medium">
                          <span className="text-[10px]">•</span>
                          +{template.documents.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Documents Summary */}
          {selectedCount > 0 && (
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm">
                      Selected Documents ({selectedCount})
                    </h4>
                    {newRequestsCount > 0 && (
                      <Badge variant="default" className="text-xs">
                        {newRequestsCount} new
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getSelectedDocuments().map((doc) => (
                      <Badge
                        key={doc.title}
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {doc.title}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDocs(new Map())}
                  className="text-xs h-8"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t" />

          {/* Smart Recommendations */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                Recommended Based on History
              </h3>
              <p className="text-sm text-muted-foreground">
                Documents automatically selected based on missing items
              </p>
            </div>
            <div className="space-y-2">
              {suggestions.map((doc) => {
                const isSelected = selectedDocs.get(doc.title) || false;
                const isAlreadyHandled = doc.status === "uploaded" || doc.status === "pending";

                return (
                  <div
                    key={doc.title}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      isAlreadyHandled
                        ? "bg-muted/30"
                        : "bg-background"
                    } hover:bg-accent/50 transition-colors cursor-pointer`}
                    onClick={() => toggleDocument(doc.title)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleDocument(doc.title)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{doc.title}</div>
                      {doc.statusText && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {doc.statusText}
                        </div>
                      )}
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Quick Add More */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add More Documents
              </h3>
              <p className="text-sm text-muted-foreground">
                Click to add additional document types
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {commonDocuments
                .filter((doc) => !suggestions.find((s) => s.title === doc.title))
                .map((doc) => {
                  const isSelected = selectedDocs.get(doc.title) || false;
                  return (
                    <Badge
                      key={doc.title}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer text-sm py-1.5 px-3 transition-all ${
                        isSelected
                          ? "hover:opacity-80"
                          : "hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      }`}
                      onClick={() => toggleDocument(doc.title)}
                    >
                      {isSelected && "✓ "}
                      {doc.title}
                    </Badge>
                  );
                })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Message Section (Collapsible) */}
          <div className="space-y-3">
            <Collapsible open={showMessage} onOpenChange={setShowMessage}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between px-0 hover:bg-transparent -mx-0"
                >
                  <span className="text-base font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Message to Client
                    <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
                  </span>
                  {showMessage ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Add a personalized message to include with the document request
                </p>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Hi,&#10;&#10;Please upload the following documents for this period.&#10;&#10;Thank you!"
                  className="resize-none"
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <>
              {/* Divider */}
              <div className="border-t" />

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Email Preview
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Preview of what {clientName} will receive
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-6">
                  <div className="bg-background rounded-lg p-4 text-sm space-y-3 shadow-sm">
                    <p>Hi {clientName},</p>
                    <div className="whitespace-pre-wrap">{message}</div>
                    <div>
                      <p className="font-semibold mb-2">Required Documents:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {getSelectedDocuments().map((doc) => (
                          <li key={doc.title}>{doc.title}</li>
                        ))}
                      </ul>
                    </div>
                    <Button size="sm" className="w-full">
                      Upload Documents
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      This link expires in 7 days.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t pt-6 mt-6">
          <div className="flex flex-col w-full gap-4">
            {/* Document Count Section */}
            <div className="flex items-center justify-between pb-2">
              <div className="text-sm">
                {selectedCount > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base">
                      {selectedCount} document{selectedCount !== 1 ? "s" : ""} selected
                    </span>
                    {newRequestsCount > 0 && (
                      <Badge variant="secondary" className="font-normal">
                        {newRequestsCount} new request{newRequestsCount !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-base">No documents selected</span>
                )}
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2 sm:w-auto w-full"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? "Hide Preview" : "Preview Email"}
              </Button>
              <div className="flex gap-3 sm:ml-auto w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="flex-1 sm:flex-initial sm:w-24"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || selectedCount === 0}
                  className="gap-2 flex-1 sm:flex-initial"
                >
                  {loading ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
