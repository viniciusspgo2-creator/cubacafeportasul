import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();
  const suppliers = await db.supplier.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(suppliers);
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });
    const supplier = await db.supplier.create({
      data: { name: body.name, contact: body.contact || '', products: body.products || '', lastOrder: Number(body.lastOrder) || 0 },
    });
    return NextResponse.json(supplier, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao criar fornecedor', detail: String(e) }, { status: 400 });
  }
}
