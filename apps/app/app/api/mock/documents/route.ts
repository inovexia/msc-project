import { NextRequest, NextResponse } from 'next/server';
import { assignDocument as assignDoc, getDocuments } from '../_db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get('periodId');
  if (!pid) return new NextResponse('Bad Request', { status: 400 });
  return NextResponse.json(getDocuments(pid));
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { documentId, requestId } = body || {};
  if (!documentId) return new NextResponse('Bad Request', { status: 400 });
  assignDoc(documentId, requestId ?? null);
  return NextResponse.json({ ok: true });
}
