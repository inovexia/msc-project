// These 'export type' statements make our data structures reusable and safe across the app.
export type DocumentStatus = "pending" | "needs_review" | "approved" | "rejected";

export type DocumentType = "invoice" | "receipt" | "statement" | "bill" | "other";

export type Document = {
  id: string;
  title: string;
  status: DocumentStatus;
  type: DocumentType;
  vendor?: string;
  amount?: number;
  date?: string; // Document date (invoice date, receipt date, etc.)
  uploadedOn?: string; // When it was uploaded to the system
  fileUrl?: string;
  notes?: string;
  clientId?: string; // Reference to which client this belongs to
  clientName?: string; // For easier display in inbox view
};

export type Client = {
  id: string;
  name: string;
  companyName: string;
  documents: Document[]; // This is an array of Document objects
};

// Mock data with enhanced document details
export const mockAccountantData: Client[] = [
  {
    id: "client-1",
    name: "Elara Vance",
    companyName: "Vance Industries",
    documents: [
      {
        id: "doc-a",
        title: "Office Supplies Invoice",
        status: "needs_review",
        type: "invoice",
        vendor: "Office Depot",
        amount: 245.50,
        date: "2025-10-15",
        uploadedOn: "2025-10-16",
        fileUrl: "#",
        clientId: "client-1",
        clientName: "Elara Vance"
      },
      {
        id: "doc-b",
        title: "Monthly Software Subscription",
        status: "needs_review",
        type: "receipt",
        vendor: "Adobe Creative Cloud",
        amount: 89.99,
        date: "2025-10-14",
        uploadedOn: "2025-10-16",
        fileUrl: "#",
        clientId: "client-1",
        clientName: "Elara Vance"
      },
      {
        id: "doc-c",
        title: "Bank Statement",
        status: "approved",
        type: "statement",
        vendor: "Chase Bank",
        date: "2025-10-01",
        uploadedOn: "2025-10-05",
        clientId: "client-1",
        clientName: "Elara Vance"
      },
      {
        id: "doc-d",
        title: "Rent Invoice",
        status: "rejected",
        type: "invoice",
        vendor: "Commercial Properties LLC",
        amount: 3500.00,
        date: "2025-10-01",
        uploadedOn: "2025-10-12",
        notes: "Missing landlord signature.",
        clientId: "client-1",
        clientName: "Elara Vance"
      },
      {
        id: "doc-i",
        title: "Coffee Shop Receipt",
        status: "pending",
        type: "receipt",
        vendor: "Starbucks",
        amount: 12.50,
        date: "2025-10-20",
        uploadedOn: "2025-10-20",
        fileUrl: "#",
        clientId: "client-1",
        clientName: "Elara Vance"
      },
    ],
  },
  {
    id: "client-2",
    name: "Marcus Cole",
    companyName: "Cole Logistics",
    documents: [
      {
        id: "doc-e",
        title: "Fuel Receipt",
        status: "needs_review",
        type: "receipt",
        vendor: "Shell Gas Station",
        amount: 125.75,
        date: "2025-10-18",
        uploadedOn: "2025-10-19",
        fileUrl: "#",
        clientId: "client-2",
        clientName: "Marcus Cole"
      },
      {
        id: "doc-f",
        title: "Vehicle Maintenance Invoice",
        status: "approved",
        type: "invoice",
        vendor: "Mike's Auto Repair",
        amount: 890.00,
        date: "2025-10-10",
        uploadedOn: "2025-10-11",
        clientId: "client-2",
        clientName: "Marcus Cole"
      },
      {
        id: "doc-g",
        title: "Insurance Bill",
        status: "needs_review",
        type: "bill",
        vendor: "State Farm Insurance",
        amount: 1250.00,
        date: "2025-10-15",
        uploadedOn: "2025-10-15",
        fileUrl: "#",
        clientId: "client-2",
        clientName: "Marcus Cole"
      },
    ],
  },
  {
    id: "client-3",
    name: "Sofia Rossi",
    companyName: "Rossi & Co.",
    documents: [
      {
        id: "doc-h",
        title: "Legal Services Invoice",
        status: "approved",
        type: "invoice",
        vendor: "Johnson & Associates Law",
        amount: 2500.00,
        date: "2025-10-05",
        uploadedOn: "2025-10-06",
        clientId: "client-3",
        clientName: "Sofia Rossi"
      },
      {
        id: "doc-j",
        title: "Office Lunch Receipt",
        status: "pending",
        type: "receipt",
        vendor: "Chipotle",
        amount: 45.00,
        date: "2025-10-21",
        uploadedOn: "2025-10-21",
        fileUrl: "#",
        clientId: "client-3",
        clientName: "Sofia Rossi"
      },
      {
        id: "doc-k",
        title: "Equipment Purchase",
        status: "needs_review",
        type: "invoice",
        vendor: "Best Buy",
        amount: 1899.99,
        date: "2025-10-19",
        uploadedOn: "2025-10-20",
        fileUrl: "#",
        clientId: "client-3",
        clientName: "Sofia Rossi"
      },
    ],
  },
];