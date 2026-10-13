import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();
  const entries = await db.financeEntry.findMany({ orderBy: { createdAt: 'desc' } });
  const entradas = entries.filter((e) => e.type === 'entrada' && e.status === 'pago').reduce((s, e) => s + e.amount, 0);
  const saidas = entries.filter((e) => e.type === 'saida' && e.status === 'pago').reduce((s, e) => s + e.amount, 0);
  const aReceber = entries.filter((e) => e.type === 'entrada' && e.status === 'pendente').reduce((s, e) => s + e.amount, 0);
  const aPagar = entries.filter((e) => e.type === 'saida' && e.status === 'pendente').reduce((s, e) => s + e.amount, 0);
  return NextResponse.json({ entries, summary: { entradas, saidas, aReceber, aPagar, saldo: entradas - saidas } });
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();
  try {
    const body = await req.json();
    if (!body.description || !body.amount) return NextResponse.json({ error: 'Descrição e valor obrigatórios' }, { status: 400 });
    const entry = await db.financeEntry.create({
      data: {
        type: body.type === 'saida' ? 'saida' : 'entrada',
        category: body.category || 'Geral',
        description: body.description,
        amount: Number(body.amount),
        status: body.status || 'pago',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao criar lançamento', detail: String(e) }, { status: 400 });
  }
}
