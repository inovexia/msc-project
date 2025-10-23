"use client";

import { useState, useMemo } from "react";
import { InboxSidebar, type FilterType } from "./inbox-sidebar";
import { InboxDocumentList } from "./inbox-document-list";
import { InboxDocumentDetail } from "./inbox-document-detail";
import type { Client, Document } from "../data";

type InboxViewProps = {
  clients: Client[];
};

export function InboxView({ clients }: InboxViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("inbox");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(
    new Set()
  );

  // Flatten all documents from all clients
  const allDocuments: Document[] = useMemo(() => {
    return clients.flatMap((client) => client.documents);
  }, [clients]);

  // Filter documents based on active filter
  const filteredDocuments = useMemo(() => {
    let docs = [...allDocuments];

    if (activeFilter === "inbox") {
      return docs;
    }

    if (activeFilter === "this_week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return docs.filter((doc) => {
        if (!doc.uploadedOn) return false;
        return new Date(doc.uploadedOn) >= oneWeekAgo;
      });
    }

    if (activeFilter === "needs_review") {
      return docs.filter((doc) => doc.status === "needs_review");
    }

    if (activeFilter === "approved") {
      return docs.filter((doc) => doc.status === "approved");
    }

    if (activeFilter === "unassigned") {
      // Documents that are clean/approved but not assigned to any request
      // In the real system, these would be docs without periodRequestId
      // For mock data, we'll filter by pending status as a proxy
      return docs.filter((doc) => doc.status === "pending");
    }

    if (typeof activeFilter === "object") {
      if (activeFilter.type === "client") {
        return docs.filter((doc) => doc.clientId === activeFilter.clientId);
      }

      if (activeFilter.type === "month") {
        // For now, just filter by month name in the date
        // In production, you'd have more robust date filtering
        return docs.filter((doc) => {
          if (!doc.date) return false;
          const docDate = new Date(doc.date);
          const monthYear = docDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
          return activeFilter.month === monthYear;
        });
      }

      if (activeFilter.type === "document_type") {
        return docs.filter((doc) => doc.type === activeFilter.docType);
      }
    }

    return docs;
  }, [allDocuments, activeFilter]);

  // Calculate document counts for sidebar
  const documentCounts = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return {
      inbox: allDocuments.length,
      thisWeek: allDocuments.filter((doc) => {
        if (!doc.uploadedOn) return false;
        return new Date(doc.uploadedOn) >= oneWeekAgo;
      }).length,
      needsReview: allDocuments.filter((doc) => doc.status === "needs_review")
        .length,
      approved: allDocuments.filter((doc) => doc.status === "approved").length,
      unassigned: allDocuments.filter((doc) => doc.status === "pending").length,
    };
  }, [allDocuments]);

  // Get selected document
  const selectedDocument = useMemo(() => {
    if (!selectedDocumentId) return null;
    return allDocuments.find((doc) => doc.id === selectedDocumentId) || null;
  }, [selectedDocumentId, allDocuments]);

  // Handle document selection
  const handleSelectDocument = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  // Handle checkbox toggle for bulk selection
  const handleToggleDocumentSelection = (documentId: string) => {
    setSelectedDocumentIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(documentId)) {
        newSet.delete(documentId);
      } else {
        newSet.add(documentId);
      }
      return newSet;
    });
  };

  // Handle select all toggle
  const handleToggleAllSelection = () => {
    if (selectedDocumentIds.size === filteredDocuments.length) {
      setSelectedDocumentIds(new Set());
    } else {
      setSelectedDocumentIds(
        new Set(filteredDocuments.map((doc) => doc.id))
      );
    }
  };

  const allSelected =
    filteredDocuments.length > 0 &&
    selectedDocumentIds.size === filteredDocuments.length;

  return (
    <div className="flex w-full h-screen bg-background">
      <InboxSidebar
        clients={clients}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        documentCounts={documentCounts}
      />
      <InboxDocumentList
        documents={filteredDocuments}
        selectedDocumentId={selectedDocumentId}
        selectedDocumentIds={selectedDocumentIds}
        onSelectDocument={handleSelectDocument}
        onToggleDocumentSelection={handleToggleDocumentSelection}
        onToggleAllSelection={handleToggleAllSelection}
        allSelected={allSelected}
      />
      <InboxDocumentDetail document={selectedDocument} />
    </div>
  );
}
