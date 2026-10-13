'use client';

import { useEffect, useState, useCallback } from 'react';

export interface RouteInfo {
  path: string;        // ex: "", "produto/slug", "categoria/narguiles", "blog", "blog/slug", "admin", "catalogo"
  params: string[];
  hash: string;
}

function parseHash(): RouteInfo {
  if (typeof window === 'undefined') return { path: '', params: [], hash: '' };
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = raw.split('?');
  const params = pathPart ? pathPart.split('/').filter(Boolean) : [];
  const query = new URLSearchParams(queryPart || '');
  return { path: pathPart || '', params, hash: query.get('q') || '' };
}

export function useHashRoute() {
  const [route, setRoute] = useState<RouteInfo>({ path: '', params: [], hash: '' });

  useEffect(() => {
    const update = () => setRoute(parseHash());
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  return route;
}

declare global {
  interface Window {
    __ccScroll?: Record<string, number | undefined>;
  }
}

export function navigate(to: string) {
  if (typeof window === 'undefined') return;
  // Guarda a posição de scroll do caminho atual (para restaurar ao voltar do produto)
  const oldPath = window.location.hash.replace(/^#\/?/, '').split('?')[0] || '';
  window.__ccScroll = window.__ccScroll || {};
  window.__ccScroll[oldPath] = window.scrollY;
  window.location.hash = to.startsWith('#') ? to : `/${to.replace(/^\//, '')}`;
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}
