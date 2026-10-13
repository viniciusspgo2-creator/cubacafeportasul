import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) return unauthorized();
  const { id } = await params;
  try {
    const body = await req.json();
    const entry = await db.financeEntry.update({
      where: { id },
      data: { status: body.status },
    });
    return NextResponse.json(entry);
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao atualizar', detail: String(e) }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(_req)) return unauthorized();
  const { id } = await params;
  await db.financeEntry.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
