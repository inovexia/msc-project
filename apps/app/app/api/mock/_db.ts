import { randomUUID } from 'crypto';
import { Document, MagicLinkBootstrap, Period, PeriodRequest } from '@/lib/types';

type DB = {
  firmId: string;
  clientId: string;
  clientName: string;
  period: Period;
  requests: PeriodRequest[];
  documents: Document[];
};

const now = () => new Date().toISOString();

const monthId = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}`;

let db: DB = seed();

function seed(): DB {
  const firmId = randomUUID();
  const clientId = 'demo-client';
  const year = 2025, month = 9;
  const period: Period = {
    id: randomUUID(),
    clientId,
    year, month,
    status: 'open',
  };
  const requests: PeriodRequest[] = [
    { id: randomUUID(), periodId: period.id, title: 'Bank statement - Main', category: 'Banking', required: true, sortOrder: 0, status: 'pending' },
    { id: randomUUID(), periodId: period.id, title: 'AP invoices', category: 'AP', required: true, sortOrder: 1, status: 'pending' },
    { id: randomUUID(), periodId: period.id, title: 'Receipts, meals & travel', category: 'Expenses', required: false, sortOrder: 2, status: 'pending' },
  ];
  return {
    firmId, clientId, clientName: 'Demo Client Co.',
    period, requests, documents: []
  };
}

export function resetDB() {
  db = seed();
}

export function getBootstrap(): MagicLinkBootstrap {
  return {
    client: { id: db.clientId, firmId: db.firmId, name: db.clientName, status: 'active' },
    period: db.period,
    requests: db.requests,
    link: { expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString() },
    limits: { maxFileSize: 2_000_000_000, allowedTypes: ['application/pdf', 'image/*'] },
    documents: computeStatuses(db.documents),
  };
}

export function listPeriodsSummary() {
  // Single demo period; compute counts.
  const required = db.requests.filter(r => r.required).length;
  const received = new Set(db.documents.map(d => d.periodRequestId).filter(Boolean)).size;
  return [{
    id: db.period.id,
    clientId: db.clientId,
    clientName: db.clientName,
    year: db.period.year,
    month: db.period.month,
    status: db.period.status,
    required,
    received,
    docs: db.documents.length,
  }];
}

export function insertDocument(payload: {
  filename: string;
  byteSize: number;
  contentType?: string;
  relativePath?: string;
  requestId?: string | null;
}) {
  // rudimentary duplicate detection: (filename, size) within same period
  const dup = db.documents.find(d => d.filename === payload.filename && d.byteSize === payload.byteSize);
  const doc: Document = {
    id: randomUUID(),
    firmId: db.firmId,
    clientId: db.clientId,
    periodId: db.period.id,
    periodRequestId: payload.requestId || null,
    fileKey: `mock://${db.firmId}/client/${db.clientId}/period/${monthId(db.period.year, db.period.month)}/originals/${randomUUID()}__${payload.filename}`,
    filename: payload.filename,
    byteSize: payload.byteSize,
    contentType: payload.contentType || 'application/octet-stream',
    version: 1,
    uploadedAt: now(),
    virusStatus: 'pending',
    ocrStatus: 'pending',
    extracted: { relativePath: payload.relativePath },
    tags: [],
    status: dup ? 'duplicate' : 'processing',
    progress: 100,
    readyAt: new Date(Date.now() + 2500).toISOString(),
    duplicateOfId: dup ? dup.id : null,
  };
  db.documents.unshift(doc);
  return doc;
}

export function computeStatuses(docs: Document[]): Document[] {
  const nowTs = Date.now();
  return docs.map(d => {
    if (d.status === 'processing' && d.readyAt && nowTs >= Date.parse(d.readyAt)) {
      return { ...d, status: 'clean', virusStatus: 'clean', ocrStatus: 'done' };
    }
    return d;
  });
}

export function getDocuments(periodId: string): Document[] {
  if (periodId !== db.period.id) return [];
  db.documents = computeStatuses(db.documents);
  // Update request statuses based on docs
  const reqCounts: Record<string, number> = {};
  for (const d of db.documents) {
    if (d.periodRequestId) reqCounts[d.periodRequestId] = (reqCounts[d.periodRequestId] || 0) + 1;
  }
  db.requests = db.requests.map(r => {
    const count = reqCounts[r.id] || 0;
    if (count === 0) return { ...r, status: 'pending' };
    // simple rule: if ≥1 doc, mark received
    return { ...r, status: 'received' };
  });
  return db.documents;
}

export function assignDocument(documentId: string, requestId: string | null) {
  const idx = db.documents.findIndex(d => d.id === documentId);
  if (idx === -1) return false;
  db.documents[idx] = { ...db.documents[idx], periodRequestId: requestId };
  return true;
}
