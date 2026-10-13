/* ============================================================
   Autenticação do Painel Admin — senha única (ADMIN_PASSWORD) +
   cookie de sessão assinado (HMAC). Sem dependências externas.

   Variáveis de ambiente:
   - ADMIN_PASSWORD  (obrigatória em produção) senha do painel
   - ADMIN_SECRET    (opcional) segredo extra para assinar a sessão

   Em PRODUÇÃO, sem ADMIN_PASSWORD o painel fica bloqueado (nunca aberto).
   ============================================================ */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

export const ADMIN_COOKIE = 'cc_admin';
const SESSION_HOURS = 12;
const IS_PROD = process.env.NODE_ENV === 'production';

/** senha efetiva. Em dev, sem env, usa "admin" só para facilitar o teste local. */
function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || (IS_PROD ? '' : 'admin');
}

export function isAdminConfigured(): boolean {
  return adminPassword().length > 0;
}

/** chave de assinatura derivada da senha (trocar a senha invalida as sessões) */
function signingKey(): string {
  return `${process.env.ADMIN_SECRET || 'cc-admin-v1'}::${adminPassword()}`;
}

function sign(payload: string): string {
  return createHmac('sha256', signingKey()).update(payload).digest('base64url');
}

export function checkAdminPassword(password: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createAdminToken(): string {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  const payload = Buffer.from(JSON.stringify({ exp }), 'utf8').toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token || !isAdminConfigured()) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number };
    return typeof data.exp === 'number' && data.exp > Date.now();
  } catch {
    return false;
  }
}

/** true se a requisição traz uma sessão de admin válida */
export function requireAdmin(req: Request): boolean {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`));
  return verifyAdminToken(match ? decodeURIComponent(match[1]) : null);
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Não autorizado. Faça login no painel.' }, { status: 401 });
}

/* ---------------- rate limit simples em memória ---------------- */

const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  if (attempts.size > 5000) attempts.clear();
  return entry.count <= max;
}

export const ADMIN_SESSION_MAX_AGE = SESSION_HOURS * 3600;
export const ADMIN_COOKIE_SECURE = IS_PROD && process.env.FORCE_INSECURE_COOKIE !== '1';
