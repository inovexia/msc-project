// Thin client wrappers around the mock API routes. Swap these to call your real backend.
import { Document, MagicLinkBootstrap, UUID } from './types';

export async function bootstrapPortal(token: string): Promise<MagicLinkBootstrap> {
  const r = await fetch(`/api/mock/bootstrap?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
  if (!r.ok) throw new Error('bootstrap failed');
  return r.json();
}

export async function listDocuments(periodId: UUID): Promise<Document[]> {
  const r = await fetch(`/api/mock/documents?periodId=${encodeURIComponent(periodId)}`, { cache: 'no-store' });
  if (!r.ok) throw new Error('listDocuments failed');
  return r.json();
}

export async function confirmUpload(payload: {
  periodId: UUID;
  clientId: UUID;
  firmId: UUID;
  filename: string;
  byteSize: number;
  contentType?: string;
  relativePath?: string;
  requestId?: UUID;
}): Promise<Document> {
  const r = await fetch('/api/mock/uploads/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('confirmUpload failed');
  return r.json();
}

export async function assignDocument(documentId: UUID, requestId: UUID | null): Promise<{ ok: true }> {
  const r = await fetch('/api/mock/documents', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, requestId }),
  });
  if (!r.ok) throw new Error('assignDocument failed');
  return r.json();
}

export async function listPeriods(): Promise<any[]> {
  const r = await fetch('/api/mock/periods', { cache: 'no-store' });
  if (!r.ok) throw new Error('listPeriods failed');
  return r.json();
}
