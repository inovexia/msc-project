"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Download,
  CheckCircle,
  XCircle,
  Edit,
  FileText,
  User,
  Calendar,
  DollarSign,
  Tag,
} from "lucide-react";
import { useState } from "react";
import type { Document } from "../data";

type InboxDocumentDetailProps = {
  document: Document | null;
};

export function InboxDocumentDetail({ document }: InboxDocumentDetailProps) {
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  if (!document) {
    return (
      <div className="w-96 bg-background p-6 flex items-center justify-center">
        <div className="text-center space-y-2">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-sm">
            Select a document to view details
          </p>
        </div>
      </div>
    );
  }

  const formatAmount = (amount?: number) => {
    if (!amount) return "N/A";
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "needs_review":
        return "text-orange-600 dark:text-orange-400";
      case "approved":
        return "text-emerald-600 dark:text-emerald-400";
      case "rejected":
        return "text-red-600 dark:text-red-400";
      case "pending":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="w-96 bg-background overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Document Preview Placeholder */}
        <Card>
          <CardContent className="p-0">
            <div className="aspect-[3/4] bg-muted flex items-center justify-center rounded-t-lg">
              <FileText className="h-24 w-24 text-muted-foreground" />
            </div>
            <div className="p-4">
              {document.fileUrl && (
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Download Document
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Document Info */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {document.title}
            </h2>
            <p className={`text-sm font-medium mt-1 ${getStatusColor(document.status)}`}>
              {document.status.replace("_", " ").toUpperCase()}
            </p>
          </div>

          {/* Details Grid */}
          <div className="space-y-3">
            {document.vendor && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Vendor</p>
                  <p className="text-sm font-medium text-foreground">
                    {document.vendor}
                  </p>
                </div>
              </div>
            )}

            {document.amount && (
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatAmount(document.amount)}
                  </p>
                </div>
              </div>
            )}

            {document.date && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(document.date)}
                  </p>
                </div>
              </div>
            )}

            {document.type && (
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium text-foreground">
                    {getTypeLabel(document.type)}
                  </p>
                </div>
              </div>
            )}

            {document.clientName && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="text-sm font-medium text-foreground">
                    {document.clientName}
                  </p>
                </div>
              </div>
            )}

            {document.uploadedOn && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Uploaded</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(document.uploadedOn)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Existing Notes */}
          {document.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {document.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Edit Details Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4" />
            Edit Details
          </Button>

          {/* Add Notes */}
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="notes">Add Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes or comments..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {document.status === "needs_review" && (
          <div className="space-y-2 pt-4 border-t border-border">
            <Button
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
            >
              <CheckCircle className="h-5 w-5" />
              Approve Document
            </Button>
            <Button variant="destructive" size="lg" className="w-full gap-2">
              <XCircle className="h-5 w-5" />
              Reject Document
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
