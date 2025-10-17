// These 'export type' statements make our data structures reusable and safe across the app.
export type DocumentStatus = "pending" | "needs_review" | "approved" | "rejected";

export type Document = {
  id: string;
  title: string;
  status: DocumentStatus;
  uploadedOn?: string; // The '?' makes this property optional
  fileUrl?: string;
  notes?: string;
};

export type Client = {
  id: string;
  name: string;
  companyName: string;
  documents: Document[]; // This is an array of Document objects
};

// Mock data remains the same
export const mockAccountantData: Client[] = [
  {
    id: "client-1",
    name: "Elara Vance",
    companyName: "Vance Industries",
    documents: [
      { id: "doc-a", title: "2024 Tax Return", status: "pending" },
      { id: "doc-b", title: "Final Balance Sheet", status: "needs_review", uploadedOn: "2025-10-16", fileUrl: "#" },
      { id: "doc-c", title: "Business License", status: "approved" },
      { id: "doc-d", title: "Q2 Expense Report", status: "rejected", notes: "Missing receipts for transactions over $50." },
    ],
  },
  {
    id: "client-2",
    name: "Marcus Cole",
    companyName: "Cole Logistics",
    documents: [
      { id: "doc-e", title: "W-9 Form", status: "pending" },
      { id: "doc-f", title: "Driver Payroll Records", status: "approved" },
      { id: "doc-g", title: "Proof of Insurance", status: "needs_review", uploadedOn: "2025-10-15", fileUrl: "#" },
    ],
  },
  {
    id: "client-3",
    name: "Sofia Rossi",
    companyName: "Rossi & Co.",
    documents: [
      { id: "doc-h", title: "Incorporation Documents", status: "approved" },
    ],
  },
];