/* ============================================================
   POST   /api/admin/login  → autentica e cria sessão
   GET    /api/admin/login  → informa se a sessão atual é válida
   DELETE /api/admin/login  → encerra sessão
   ============================================================ */

import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_SECURE,
  ADMIN_SESSION_MAX_AGE,
  checkAdminPassword,
  createAdminToken,
  isAdminConfigured,
  rateLimit,
  requireAdmin,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'local'
  );
}

export async function POST(req: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Painel bloqueado: defina ADMIN_PASSWORD nas variáveis de ambiente da Vercel.' },
      { status: 503 },
    );
  }

  if (!rateLimit(`login:${clientIp(req)}`, 8, 10 * 60_000)) {
    return NextResponse.json(
      { ok: false, error: 'Muitas tentativas. Aguarde 10 minutos.' },
      { status: 429 },
    );
  }

  let password = '';
  try {
    const body = (await req.json()) as { password?: string };
    password = String(body.password ?? '');
  } catch {
    return NextResponse.json({ ok: false, error: 'Requisição inválida.' }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ ok: false, error: 'Digite a senha.' }, { status: 400 });
  }
  if (!checkAdminPassword(password)) {
    return NextResponse.json({ ok: false, error: 'Senha incorreta.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
    secure: ADMIN_COOKIE_SECURE,
  });
  return res;
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    ok: true,
    configured: isAdminConfigured(),
    authed: requireAdmin(req),
  });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0, secure: ADMIN_COOKIE_SECURE });
  return res;
}
