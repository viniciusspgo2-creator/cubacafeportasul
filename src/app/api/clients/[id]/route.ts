import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(_req)) return unauthorized();
  const { id } = await params;
  await db.client.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
