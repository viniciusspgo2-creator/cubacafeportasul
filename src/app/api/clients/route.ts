import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();
  const clients = await db.client.findMany({ orderBy: { spent: 'desc' } });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();
  try {
    const body = await req.json();
    if (!body.name || !body.phone) return NextResponse.json({ error: 'Nome e telefone obrigatórios' }, { status: 400 });
    const client = await db.client.create({
      data: { name: body.name, phone: body.phone, notes: body.notes || '' },
    });
    return NextResponse.json(client, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao criar cliente', detail: String(e) }, { status: 400 });
  }
}
