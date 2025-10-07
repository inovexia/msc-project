'use client';
import * as React from 'react';
import { useParams } from 'next/navigation';
import { bootstrapPortal, listDocuments, assignDocument } from '@/lib/api'; // reuse bootstrap for mock data by tokenless path
import { Document, PeriodRequest } from '@/lib/types';
import { DocumentTable } from '@/components/workspace/DocumentTable';
import { FileViewer } from '@/components/workspace/FileViewer';

export default function PeriodWorkspacePage() {
  const params = useParams<{ clientId: string; period: string }>();
  const [requests, setRequests] = React.useState<PeriodRequest[]>([]);
  const [docs, setDocs] = React.useState<Document[]>([]);
  const [periodId, setPeriodId] = React.useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Use the mock bootstrap without token to produce the same period
    (async () => {
      const boot = await fetch('/api/mock/bootstrap?forceDemo=1').then(r => r.json());
      setRequests(boot.requests);
      setPeriodId(boot.period.id);
      const ds = await listDocuments(boot.period.id);
      setDocs(ds);
    })();
  }, [params.clientId, params.period]);

  React.useEffect(() => {
    if (!periodId) return;
    const t = setInterval(async () => {
      const ds = await listDocuments(periodId);
      setDocs(ds);
    }, 1500);
    return () => clearInterval(t);
  }, [periodId]);

  const onAssign = async (docId: string, requestId: string | null) => {
    await assignDocument(docId, requestId);
    if (periodId) {
      const ds = await listDocuments(periodId);
      setDocs(ds);
    }
  };

  const selected = docs.find(d => d.id === selectedDocId) || null;

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
        <div className="lg:col-span-3">
          <div className="mb-2 text-sm font-medium">Documents</div>
          <DocumentTable
            documents={docs}
            requests={requests}
            onAssign={onAssign}
            onSelect={setSelectedDocId}
            selectedId={selectedDocId}
          />
        </div>
        <div className="lg:col-span-2">
          <div className="mb-2 text-sm font-medium">Preview</div>
          <div className="rounded-md border h-[70vh]">
            <FileViewer doc={selected} />
          </div>
        </div>
      </div>
    </div>
  );
}
