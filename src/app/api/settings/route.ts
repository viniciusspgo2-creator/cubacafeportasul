import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (key) {
    const setting = await db.setting.findUnique({ where: { key } });
    return NextResponse.json({ key, value: setting?.value ?? null });
  }
  const settings = await db.setting.findMany();
  const out: Record<string, string> = {};
  for (const s of settings) out[s.key] = s.value;
  return NextResponse.json(out);
}

export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();
  try {
    const body = await req.json();
    const updates: { key: string; value: string }[] = Array.isArray(body) ? body : Object.entries(body).map(([key, value]) => ({ key, value: String(value) }));
    for (const { key, value } of updates) {
      await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
    }
    return NextResponse.json({ ok: true, updated: updates.length });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao salvar configurações', detail: String(e) }, { status: 400 });
  }
}
