import { NextRequest, NextResponse } from 'next/server';
import { listPeriodsSummary } from '../_db';

export async function GET(req: NextRequest) {
  return NextResponse.json(listPeriodsSummary());
}
