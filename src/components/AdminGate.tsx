'use client';

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Lock, Loader2, LogOut } from 'lucide-react';
import { navigate } from '@/lib/router';

type Status = 'checking' | 'locked' | 'authed';

/**
 * Porta de entrada do painel admin: só renderiza o painel com sessão válida.
 * Também derruba o painel para a tela de login se a sessão expirar (401 da API).
 */
export default function AdminGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('checking');
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/login', { cache: 'no-store' });
      const data = (await res.json()) as { configured?: boolean; authed?: boolean };
      setConfigured(data.configured !== false);
      setStatus(data.authed ? 'authed' : 'locked');
    } catch {
      setStatus('locked');
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Sessão expirou no meio do uso → volta para a tela de login
  useEffect(() => {
    if (status !== 'authed') return;
    const original = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const res = await original(...args);
      const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].pathname : (args[0] as Request).url;
      if (res.status === 401 && url.includes('/api/') && !url.includes('/api/admin/login')) {
        setStatus('locked');
        setError('Sua sessão expirou. Entre novamente.');
      }
      return res;
    };
    return () => {
      window.fetch = original;
    };
  }, [status]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setPassword('');
        setStatus('authed');
      } else {
        setError(data.error || 'Não foi possível entrar.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
    } catch {
      /* ignora */
    }
    setStatus('locked');
  }

  if (status === 'authed') {
    return (
      <>
        {children}
        <button
          type="button"
          onClick={logout}
          className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs text-white/60 backdrop-blur transition hover:border-white/25 hover:text-white"
          aria-label="Sair do painel"
        >
          <LogOut className="h-3.5 w-3.5" /> Sair
        </button>
      </>
    );
  }

  if (status === 'checking') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#151515] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c90000]/15 text-[#ff2d2d]">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-center font-display text-3xl uppercase tracking-wide text-white">Painel Admin</h1>
        <p className="mt-1 text-center text-sm text-white/50">Cuba &amp; Café Tabacaria</p>

        {!configured ? (
          <p className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            Painel bloqueado: defina a variável <strong>ADMIN_PASSWORD</strong> na Vercel
            (Settings → Environment Variables) e faça um novo deploy.
          </p>
        ) : (
          <>
            <label htmlFor="admin-password" className="mt-6 block text-xs uppercase tracking-widest text-white/50">
              Senha
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-base text-white outline-none transition focus:border-[#c90000]"
              placeholder="Digite a senha do painel"
            />
            {error && (
              <p role="alert" className="mt-3 text-sm text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c90000] px-5 py-3 font-display text-xl tracking-wider text-white transition hover:bg-[#e00000] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'ENTRAR'}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-5 block w-full text-center text-xs text-white/40 transition hover:text-white/70"
        >
          ← Voltar ao site
        </button>
      </form>
    </div>
  );
}
