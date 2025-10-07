import { NextRequest, NextResponse } from 'next/server';
import { getBootstrap, resetDB } from '../_db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('forceDemo')) {
    resetDB();
  }
  return NextResponse.json(getBootstrap());
}
