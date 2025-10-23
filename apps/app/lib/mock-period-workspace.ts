/**
 * Mock data for period workspace page
 */

import type { Document, PeriodRequest, Period, Client, MagicLinkBootstrap } from "./types";

// Mock period requests for different periods
export const mockPeriodRequests: Record<string, PeriodRequest[]> = {
  "period-1": [
    {
      id: "req-1",
      periodId: "period-1",
      title: "Bank Statement",
      category: "statement",
      required: true,
      sortOrder: 1,
      status: "received",
    },
    {
      id: "req-2",
      periodId: "period-1",
      title: "Rent Invoice",
      category: "invoice",
      required: true,
      sortOrder: 2,
      status: "received",
    },
    {
      id: "req-3",
      periodId: "period-1",
      title: "Utility Bills",
      category: "bill",
      required: true,
      sortOrder: 3,
      status: "pending",
    },
    {
      id: "req-4",
      periodId: "period-1",
      title: "Payroll Records",
      category: "other",
      required: true,
      sortOrder: 4,
      status: "received",
    },
    {
      id: "req-5",
      periodId: "period-1",
      title: "Credit Card Statement",
      category: "statement",
      required: true,
      sortOrder: 5,
      status: "pending",
    },
    {
      id: "req-6",
      periodId: "period-1",
      title: "Office Supplies",
      category: "receipt",
      required: false,
      sortOrder: 6,
      status: "received",
    },
  ],
  "period-2": [
    {
      id: "req-7",
      periodId: "period-2",
      title: "Bank Statement",
      category: "statement",
      required: true,
      sortOrder: 1,
      status: "approved",
    },
    {
      id: "req-8",
      periodId: "period-2",
      title: "Rent Invoice",
      category: "invoice",
      required: true,
      sortOrder: 2,
      status: "approved",
    },
  ],
};

// Mock documents for different periods
export const mockPeriodDocuments: Record<string, Document[]> = {
  "period-1": [
    {
      id: "doc-1",
      firmId: "firm-1",
      clientId: "client-1",
      periodId: "period-1",
      periodRequestId: "req-1",
      fileKey: "documents/bank-statement-oct.pdf",
      filename: "Chase_Bank_Statement_October_2025.pdf",
      byteSize: 245000,
      contentType: "application/pdf",
      sha256: "abc123...",
      version: 1,
      uploadedAt: "2025-10-15T10:30:00Z",
      virusStatus: "clean",
      ocrStatus: "done",
      extracted: {
        vendor: "Chase Bank",
        date: "2025-10-01",
        relativePath: "/statements/2025-10",
      },
      tags: ["statement", "bank"],
      status: "clean",
      uploaderName: "Elara Vance",
    },
    {
      id: "doc-2",
      firmId: "firm-1",
      clientId: "client-1",
      periodId: "period-1",
      periodRequestId: "req-2",
      fileKey: "documents/rent-invoice.pdf",
      filename: "Commercial_Properties_Rent_Invoice.pdf",
      byteSize: 150000,
      contentType: "application/pdf",
      sha256: "def456...",
      version: 1,
      uploadedAt: "2025-10-16T14:20:00Z",
      virusStatus: "clean",
      ocrStatus: "done",
      extracted: {
        vendor: "Commercial Properties LLC",
        amount: 3500.0,
        date: "2025-10-01",
      },
      tags: ["invoice", "rent"],
      status: "clean",
      uploaderName: "Elara Vance",
    },
    {
      id: "doc-3",
      firmId: "firm-1",
      clientId: "client-1",
      periodId: "period-1",
      periodRequestId: "req-4",
      fileKey: "documents/payroll.pdf",
      filename: "Payroll_Summary_October_2025.pdf",
      byteSize: 320000,
      contentType: "application/pdf",
      sha256: "ghi789...",
      version: 1,
      uploadedAt: "2025-10-18T09:15:00Z",
      virusStatus: "clean",
      ocrStatus: "done",
      extracted: {
        vendor: "ADP Payroll Services",
        amount: 45000.0,
        date: "2025-10-15",
      },
      tags: ["payroll"],
      status: "clean",
      uploaderName: "Elara Vance",
    },
    {
      id: "doc-4",
      firmId: "firm-1",
      clientId: "client-1",
      periodId: "period-1",
      periodRequestId: null,
      fileKey: "documents/misc-receipt.pdf",
      filename: "Coffee_Receipt_Oct_20.pdf",
      byteSize: 85000,
      contentType: "application/pdf",
      sha256: "jkl012...",
      version: 1,
      uploadedAt: "2025-10-20T16:45:00Z",
      virusStatus: "clean",
      ocrStatus: "done",
      extracted: {
        vendor: "Starbucks",
        amount: 12.5,
        date: "2025-10-20",
      },
      tags: ["receipt", "expense"],
      status: "clean",
      uploaderName: "Elara Vance",
    },
    {
      id: "doc-5",
      firmId: "firm-1",
      clientId: "client-1",
      periodId: "period-1",
      periodRequestId: "req-6",
      fileKey: "documents/office-supplies.pdf",
      filename: "Office_Depot_Invoice_October.pdf",
      byteSize: 190000,
      contentType: "application/pdf",
      sha256: "mno345...",
      version: 1,
      uploadedAt: "2025-10-17T11:30:00Z",
      virusStatus: "clean",
      ocrStatus: "done",
      extracted: {
        vendor: "Office Depot",
        amount: 245.5,
        date: "2025-10-15",
      },
      tags: ["receipt", "supplies"],
      status: "clean",
      uploaderName: "Elara Vance",
    },
    {
      id: "doc-6",
      firmId: "firm-1",
      clientId: "client-1",
      periodId: "period-1",
      periodRequestId: null,
      fileKey: "documents/processing-doc.pdf",
      filename: "Uploading_Document.pdf",
      byteSize: 125000,
      contentType: "application/pdf",
      version: 1,
      uploadedAt: "2025-10-21T08:00:00Z",
      virusStatus: "pending",
      ocrStatus: "pending",
      tags: [],
      status: "processing",
      progress: 45,
      uploaderName: "Elara Vance",
    },
  ],
  "period-2": [
    {
      id: "doc-7",
      firmId: "firm-1",
      clientId: "client-1",
      periodId: "period-2",
      periodRequestId: "req-7",
      fileKey: "documents/bank-statement-sep.pdf",
      filename: "Chase_Bank_Statement_September_2025.pdf",
      byteSize: 240000,
      contentType: "application/pdf",
      sha256: "sep123...",
      version: 1,
      uploadedAt: "2025-09-30T10:30:00Z",
      virusStatus: "clean",
      ocrStatus: "done",
      extracted: {
        vendor: "Chase Bank",
        date: "2025-09-01",
      },
      tags: ["statement", "bank"],
      status: "clean",
      uploaderName: "Elara Vance",
    },
  ],
};

// Mock period details
export const mockPeriods: Record<string, Period> = {
  "period-1": {
    id: "period-1",
    clientId: "client-1",
    year: 2025,
    month: 10,
    status: "open",
    dueDate: "2025-11-05",
  },
  "period-2": {
    id: "period-2",
    clientId: "client-1",
    year: 2025,
    month: 9,
    status: "closed",
  },
};

// Mock clients
export const mockClients: Record<string, Client> = {
  "client-1": {
    id: "client-1",
    firmId: "firm-1",
    name: "Vance Industries",
    status: "active",
  },
  "client-2": {
    id: "client-2",
    firmId: "firm-1",
    name: "Cole Logistics",
    status: "active",
  },
  "client-3": {
    id: "client-3",
    firmId: "firm-1",
    name: "Rossi & Co.",
    status: "active",
  },
};

/**
 * Get mock period details for a given period ID
 */
export function getMockPeriodDetails(periodId: string): MagicLinkBootstrap {
  const period = mockPeriods[periodId];
  const client = period ? mockClients[period.clientId] : mockClients["client-1"];
  const requests = mockPeriodRequests[periodId] || [];
  const documents = mockPeriodDocuments[periodId] || [];

  // Default to period-1 if not found
  if (!period) {
    return {
      client: mockClients["client-1"],
      period: mockPeriods["period-1"],
      requests: mockPeriodRequests["period-1"],
      documents: mockPeriodDocuments["period-1"],
      link: {
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      limits: {
        maxFileSize: 52428800, // 50MB
        allowedTypes: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
      },
    };
  }

  return {
    client,
    period,
    requests,
    documents,
    link: {
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    limits: {
      maxFileSize: 52428800, // 50MB
      allowedTypes: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
    },
  };
}

/**
 * Get mock documents for a period ID
 */
export function getMockDocuments(periodId: string): Document[] {
  return mockPeriodDocuments[periodId] || [];
}
