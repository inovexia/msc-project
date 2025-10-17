"use client";

import { useMemo, useState } from "react";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@repo/design-system/components/ui/tabs";
import { cn } from "@repo/design-system/lib/utils";
import { Download, FileText, Send } from "lucide-react";
import type { Client, DocumentStatus } from "../data";
import { RequestDocumentModal } from "./request-document-modal";

type ClientDocumentPortalProps = {
  client: Client;
};

export function ClientDocumentPortal({ client }: ClientDocumentPortalProps) {
  const [filter, setFilter] = useState<DocumentStatus>("needs_review");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredDocuments = useMemo(
    () => client.documents.filter((doc) => doc.status === filter),
    [client.documents, filter]
  );

  const handleRequestSubmit = (title: string, notes: string) => {
    console.log(`Requesting new document for ${client.name}:`, {
      title,
      notes,
    });

    setIsModalOpen(false);
  };

  const statusConfig: Record<DocumentStatus, { label: string; count: number }> =
    {
      pending: {
        label: "Pending",
        count: client.documents.filter((d) => d.status === "pending").length,
      },
      needs_review: {
        label: "Needs Review",
        count: client.documents.filter((d) => d.status === "needs_review")
          .length,
      },
      approved: {
        label: "Approved",
        count: client.documents.filter((d) => d.status === "approved").length,
      },
      rejected: {
        label: "Rejected",
        count: client.documents.filter((d) => d.status === "rejected").length,
      },
    };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
          <p className="text-muted-foreground">{client.companyName}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Send className="h-4 w-4" />
          Request New Document
        </Button>
      </div>

      {/* Document Status Tabs */}
      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as DocumentStatus)}
      >
        <TabsList className="grid w-full grid-cols-4">
          {(Object.keys(statusConfig) as DocumentStatus[]).map((status) => (
            <TabsTrigger key={status} value={status} className="gap-2">
              {statusConfig[status].label}
              {statusConfig[status].count > 0 && (
                <span className="bg-muted-foreground/20 text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                  {statusConfig[status].count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Document Content */}
        <TabsContent value={filter} className="space-y-4 mt-6">
          {filteredDocuments.length > 0 ? (
            <div className="grid gap-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold text-foreground">
                            {doc.title}
                          </h3>
                        </div>

                        {doc.uploadedOn && (
                          <p className="text-sm text-muted-foreground">
                            Uploaded: {doc.uploadedOn}
                          </p>
                        )}

                        {doc.status === "rejected" && doc.notes && (
                          <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-sm text-destructive">
                              <strong>Rejection Note:</strong> {doc.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {doc.fileUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.fileUrl} download className="gap-2">
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        )}

                        {doc.status === "needs_review" && (
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm">
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    No documents with {statusConfig[filter].label.toLowerCase()}{" "}
                    status.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <RequestDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRequestSubmit}
      />
    </div>
  );
}
