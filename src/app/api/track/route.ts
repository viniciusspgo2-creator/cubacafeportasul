import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await db.visit.create({
      data: {
        path: (body.path || '/').slice(0, 200),
        action: ['visit', 'product_view', 'order_sent', 'search'].includes(body.action) ? body.action : 'visit',
        term: (body.term || '').slice(0, 120),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
