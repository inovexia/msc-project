/**
 * Data adapter to convert existing Period/Document API types
 * to the new dashboard data model
 */

import type {
  Document as ApiDocument,
  Period as ApiPeriod,
  Client as ApiClient,
  PeriodRequest,
} from "./types";
import type {
  Document as DashboardDocument,
  Client as DashboardClient,
  DocumentType,
  DocumentStatus,
} from "@/app/(authenticated)/accountants/dashboard/data";

/**
 * Convert API document to dashboard document format
 */
export function adaptDocument(
  doc: ApiDocument,
  clientName?: string,
  requests?: PeriodRequest[]
): DashboardDocument {
  // Find the request this document is assigned to
  const request = requests?.find((r) => r.id === doc.periodRequestId);

  // Map pipeline status to dashboard status
  const status = mapDocumentStatus(doc);

  // Infer document type from filename or request category
  const type = inferDocumentType(doc.filename, request?.category);

  return {
    id: doc.id,
    title: doc.filename,
    status,
    type,
    vendor: doc.extracted?.vendor,
    amount: doc.extracted?.amount,
    date: doc.extracted?.date,
    uploadedOn: doc.uploadedAt,
    fileUrl: `/api/documents/${doc.id}/download`, // Presigned URL endpoint
    notes: undefined, // Could be added later
    clientId: doc.clientId,
    clientName: clientName,
  };
}

/**
 * Map API document pipeline status to dashboard status
 */
function mapDocumentStatus(doc: ApiDocument): DocumentStatus {
  if (doc.status === "quarantined" || doc.status === "failed") {
    return "rejected";
  }

  if (doc.status === "clean") {
    // If assigned to a request and that request is approved
    return "approved";
  }

  if (doc.status === "processing" || doc.virusStatus === "pending") {
    return "pending";
  }

  // Document is clean but needs review/assignment
  return "needs_review";
}

/**
 * Infer document type from filename and request category
 */
function inferDocumentType(
  filename: string,
  category?: string
): DocumentType {
  const lower = filename.toLowerCase();
  const cat = category?.toLowerCase() || "";

  if (
    lower.includes("invoice") ||
    cat.includes("invoice") ||
    lower.includes("bill")
  ) {
    return "invoice";
  }

  if (
    lower.includes("receipt") ||
    cat.includes("receipt") ||
    lower.includes("rcpt")
  ) {
    return "receipt";
  }

  if (
    lower.includes("statement") ||
    cat.includes("statement") ||
    lower.includes("stmt")
  ) {
    return "statement";
  }

  if (cat.includes("bill") || lower.includes("utility")) {
    return "bill";
  }

  return "other";
}

/**
 * Convert API client + periods to dashboard client format
 */
export function adaptClient(
  client: ApiClient,
  periods: ApiPeriod[],
  allDocuments: ApiDocument[],
  allRequests: PeriodRequest[]
): DashboardClient {
  // Get all documents for this client
  const clientDocs = allDocuments.filter((d) => d.clientId === client.id);

  // Get all requests for this client's periods
  const periodIds = periods.map((p) => p.id);
  const clientRequests = allRequests.filter((r) =>
    periodIds.includes(r.periodId)
  );

  // Convert documents to dashboard format
  const documents = clientDocs.map((doc) =>
    adaptDocument(doc, client.name, clientRequests)
  );

  return {
    id: client.id,
    name: client.name,
    companyName: client.name, // Could add separate company name field
    documents,
  };
}

/**
 * Calculate period completion statistics
 */
export function calculatePeriodCompletion(
  period: ApiPeriod,
  requests: PeriodRequest[],
  documents: ApiDocument[]
) {
  const periodRequests = requests.filter((r) => r.periodId === period.id);
  const periodDocs = documents.filter((d) => d.periodId === period.id);

  const requiredRequests = periodRequests.filter((r) => r.required);
  const receivedRequests = periodRequests.filter(
    (r) => r.status === "received" || r.status === "approved"
  );

  const totalDocs = periodDocs.length;
  const cleanDocs = periodDocs.filter((d) => d.status === "clean").length;
  const processingDocs = periodDocs.filter(
    (d) => d.status === "processing"
  ).length;
  const needsReviewDocs = periodDocs.filter(
    (d) => d.status === "clean" && !d.periodRequestId
  ).length;

  const completionPercentage =
    requiredRequests.length > 0
      ? Math.round((receivedRequests.length / requiredRequests.length) * 100)
      : 0;

  return {
    completionPercentage,
    requiredCount: requiredRequests.length,
    receivedCount: receivedRequests.length,
    totalDocuments: totalDocs,
    cleanDocuments: cleanDocs,
    processingDocuments: processingDocs,
    needsReviewDocuments: needsReviewDocs,
    missingRequests: periodRequests.filter(
      (r) => r.required && r.status === "pending"
    ),
  };
}

/**
 * Get dashboard summary stats across all periods
 */
export function getDashboardStats(
  documents: ApiDocument[],
  requests: PeriodRequest[]
) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return {
    totalDocuments: documents.length,
    needsReview: documents.filter(
      (d) => d.status === "clean" && !d.periodRequestId
    ).length,
    processing: documents.filter((d) => d.status === "processing").length,
    approved: documents.filter(
      (d) => d.status === "clean" && d.periodRequestId
    ).length,
    thisWeek: documents.filter(
      (d) => new Date(d.uploadedAt) >= oneWeekAgo
    ).length,
    unassignedCount: documents.filter(
      (d) => d.status === "clean" && !d.periodRequestId
    ).length,
    requestsPending: requests.filter((r) => r.status === "pending").length,
    requestsReceived: requests.filter(
      (r) => r.status === "received" || r.status === "approved"
    ).length,
  };
}
