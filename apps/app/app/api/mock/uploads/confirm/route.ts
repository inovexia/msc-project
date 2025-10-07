import { NextRequest, NextResponse } from 'next/server';
import { insertDocument } from '../../mock/_db';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { filename, byteSize, contentType, relativePath, requestId } = body || {};
  if (!filename || !byteSize) {
    return new NextResponse('Bad Request', { status: 400 });
  }
  const doc = insertDocument({ filename, byteSize, contentType, relativePath, requestId });
  return NextResponse.json(doc);
}
