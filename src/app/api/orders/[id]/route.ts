import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';
import { parseModel } from '@/lib/helpers';

interface OrderType { id: string; code: string; status: string; items: unknown[]; [k: string]: unknown }

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) return unauthorized();
  const { id } = await params;
  try {
    const body = await req.json();
    const order = await db.order.update({
      where: { id },
      data: { status: body.status },
    });
    return NextResponse.json(parseModel<OrderType>(order as unknown as Record<string, unknown>, ['items']));
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao atualizar pedido', detail: String(e) }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(_req)) return unauthorized();
  const { id } = await params;
  await db.order.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
