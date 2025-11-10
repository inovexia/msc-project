/**
 * Mock period data for testing the client periods page
 */

export interface MockPeriodSummary {
  id: string;
  clientId: string;
  clientName: string;
  year: number;
  month: number;
  required: number;
  received: number;
  docs: number;
  status: "open" | "in_review" | "closed" | "locked";
}

export const mockPeriods: MockPeriodSummary[] = [
  {
    id: "period-1",
    clientId: "client-1",
    clientName: "Vance Industries",
    year: 2025,
    month: 10,
    required: 8,
    received: 6,
    docs: 10,
    status: "open",
  },
  {
    id: "period-2",
    clientId: "client-1",
    clientName: "Vance Industries",
    year: 2025,
    month: 9,
    required: 8,
    received: 8,
    docs: 12,
    status: "closed",
  },
  {
    id: "period-3",
    clientId: "client-2",
    clientName: "Cole Logistics",
    year: 2025,
    month: 10,
    required: 6,
    received: 4,
    docs: 7,
    status: "open",
  },
  {
    id: "period-4",
    clientId: "client-2",
    clientName: "Cole Logistics",
    year: 2025,
    month: 9,
    required: 6,
    received: 6,
    docs: 9,
    status: "in_review",
  },
  {
    id: "period-5",
    clientId: "client-3",
    clientName: "Rossi & Co.",
    year: 2025,
    month: 10,
    required: 5,
    received: 5,
    docs: 8,
    status: "in_review",
  },
  {
    id: "period-6",
    clientId: "client-3",
    clientName: "Rossi & Co.",
    year: 2025,
    month: 9,
    required: 5,
    received: 5,
    docs: 6,
    status: "closed",
  },
  {
    id: "period-7",
    clientId: "client-1",
    clientName: "Vance Industries",
    year: 2025,
    month: 8,
    required: 8,
    received: 8,
    docs: 11,
    status: "closed",
  },
  {
    id: "period-8",
    clientId: "client-4",
    clientName: "Thompson & Associates",
    year: 2025,
    month: 10,
    required: 10,
    received: 2,
    docs: 3,
    status: "open",
  },
  {
    id: "period-9",
    clientId: "client-5",
    clientName: "Garcia Manufacturing",
    year: 2025,
    month: 10,
    required: 12,
    received: 12,
    docs: 15,
    status: "in_review",
  },
  {
    id: "period-10",
    clientId: "client-6",
    clientName: "Chen Tech Solutions",
    year: 2025,
    month: 10,
    required: 7,
    received: 0,
    docs: 0,
    status: "open",
  },
];
