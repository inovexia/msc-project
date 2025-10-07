export type UUID = string;

export type PeriodStatus = 'open' | 'in_review' | 'closed' | 'locked';
export type RequestStatus = 'pending' | 'received' | 'approved';
export type VirusStatus = 'pending' | 'clean' | 'quarantined';
export type OCRStatus = 'pending' | 'done' | 'failed';
export type DocPipelineStatus =
  | 'idle'
  | 'presigning'
  | 'uploading'
  | 'verifying'
  | 'processing'
  | 'clean'
  | 'quarantined'
  | 'duplicate'
  | 'failed';

export interface Firm {
  id: UUID;
  name: string;
}

export interface Client {
  id: UUID;
  firmId: UUID;
  name: string;
  status: 'active' | 'inactive';
}

export interface Period {
  id: UUID;
  clientId: UUID;
  year: number;
  month: number;
  status: PeriodStatus;
  dueDate?: string;
}

export interface PeriodRequest {
  id: UUID;
  periodId: UUID;
  title: string;
  category?: string;
  required: boolean;
  sortOrder: number;
  status: RequestStatus;
}

export interface DocumentExtracted {
  vendor?: string;
  amount?: number;
  date?: string;
  relativePath?: string;
}

export interface Document {
  id: UUID;
  firmId: UUID;
  clientId: UUID;
  periodId: UUID;
  periodRequestId?: UUID | null;
  fileKey: string;
  filename: string;
  byteSize: number;
  contentType?: string;
  sha256?: string;
  version: number;
  uploadedBy?: UUID | null;
  uploadedAt: string; // ISO
  virusStatus: VirusStatus;
  ocrStatus: OCRStatus;
  extracted?: DocumentExtracted;
  tags: string[];
  status: DocPipelineStatus;
  progress?: number;
  uploaderName?: string;
  // mock-specific
  readyAt?: string; // when processing will flip to clean in mocks
  quarantined?: boolean;
  duplicateOfId?: UUID | null;
}

export interface MagicLinkBootstrap {
  client: Client;
  period: Period;
  requests: PeriodRequest[];
  link: { expiresAt: string };
  limits: { maxFileSize: number; allowedTypes: string[] };
  documents: Document[];
}
