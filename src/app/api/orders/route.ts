import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';
import { parseModel } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const where = status ? { status } : {};
  const orders = await db.order.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(orders.map((o) => parseModel<OrderType>(o as unknown as Record<string, unknown>, ['items'])));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.items?.length) return NextResponse.json({ error: 'Pedido vazio' }, { status: 400 });
    const total = body.items.reduce((s: number, it: { price: number; qty: number }) => s + it.price * it.qty, 0);
    const code = `CC-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const order = await db.order.create({
      data: {
        code,
        clientName: body.clientName || 'Cliente',
        clientPhone: body.clientPhone || '',
        items: JSON.stringify(body.items),
        notes: body.notes || '',
        total,
        status: 'novo',
      },
    });

    // Atualiza/cria cliente automaticamente
    if (body.clientName && body.clientPhone) {
      const existingClient = await db.client.findFirst({ where: { phone: body.clientPhone } });
      if (existingClient) {
        await db.client.update({
          where: { id: existingClient.id },
          data: { orders: { increment: 1 }, spent: { increment: total } },
        });
      } else {
        await db.client.create({
          data: { name: body.clientName, phone: body.clientPhone, orders: 1, spent: total },
        });
      }
    }

    // Registra conversão WhatsApp
    await db.visit.create({ data: { path: '/checkout', action: 'order_sent' } });

    return NextResponse.json(parseModel<OrderType>(order as unknown as Record<string, unknown>, ['items']), { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao criar pedido', detail: String(e) }, { status: 400 });
  }
}

export interface OrderType {
  id: string; code: string; clientName: string; clientPhone: string;
  items: { name: string; qty: number; price: number }[];
  notes: string; total: number; status: string;
  createdAt: string; updatedAt: string;
}
