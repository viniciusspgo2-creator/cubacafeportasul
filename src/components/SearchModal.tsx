'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Search, X, TrendingUp, CornerDownLeft } from 'lucide-react';
import { navigate } from '@/lib/router';
import { fmtBRL } from '@/lib/store';
import type { Product } from '@/lib/types';

const QUICK_TERMS = ['Narguile', 'Seda', 'FM', 'Carvão', 'Backwoods', 'Grinder', 'Kit', 'RAW'];
const CATEGORY_HINTS: Record<string, string[]> = {
  narg: ['Narguiles', 'Vasos', 'Rosh', 'Mangueiras', 'Carvão'],
  seda: ['Sedas', 'RAW', 'Ziggy', 'Bambu'],
  ess: ['Essências', 'FM', 'NAY', 'Zombie'],
  taba: ['Tabacos', 'Charutos', 'Backwoods'],
  head: ['Headshop', 'Grinders', 'Pites', 'Bongs'],
  cach: ['Cachimbos', 'Maestro'],
  acess: ['Acessórios', 'HMD', 'Isqueiros'],
  kit: ['Kits', 'Presentes'],
  presente: ['Kits', 'Presentes'],
  carv: ['Carvão de coco', 'HMD'],
};

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
      setQuery('');
      setResults([]);
      setActiveIdx(0);
    }
  }, [open]);

  // Autocomplete com debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data.slice(0, 8) : []);
        setActiveIdx(0);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  const hints = (() => {
    const q = query.toLowerCase();
    for (const [prefix, cats] of Object.entries(CATEGORY_HINTS)) {
      if (q.startsWith(prefix)) return cats;
    }
    return null;
  })();

  const go = (product?: Product) => {
    onClose();
    if (product) navigate(`/produto/${product.slug}`);
    else if (query.trim()) navigate(`/catalogo?q=${encodeURIComponent(query.trim())}`);
  };

  // Teclado
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') { go(results[activeIdx]); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[85] bg-black/85 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -30, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-3xl border border-white/12 bg-[#111] shadow-2xl"
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <Search className="h-5 w-5 shrink-0 text-[#ff4b4b]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKey}
                placeholder="Busque por narguile, seda, essência, carvão..."
                className="w-full bg-transparent text-base text-white placeholder:text-white/30 focus:outline-none md:text-lg"
              />
              {loading && <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-[#ff4b4b]" />}
              <button onClick={onClose} className="shrink-0 text-white/40 hover:text-white" aria-label="Fechar busca">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sugestões de categoria */}
            {hints && (
              <div className="border-b border-white/8 px-5 py-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Categorias relacionadas
                </p>
                <div className="flex flex-wrap gap-2">
                  {hints.map((h) => (
                    <button
                      key={h}
                      onClick={() => { onClose(); navigate(`/categoria/${h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '')}`); }}
                      className="rounded-lg border border-[#c90000]/35 bg-[#c90000]/10 px-3 py-1.5 text-xs font-semibold text-[#ff6b6b] transition-colors hover:bg-[#c90000]/25"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resultados */}
            <div className="max-h-[52vh] overflow-y-auto">
              {!query.trim() ? (
                <div className="px-5 py-5">
                  <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                    <TrendingUp className="h-3.5 w-3.5" /> Buscas populares
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TERMS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setQuery(t)}
                        className="rounded-lg border border-white/12 bg-white/5 px-3.5 py-1.5 text-xs text-white/70 transition-all hover:border-[#c90000]/50 hover:text-white"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 && !loading ? (
                <div className="px-5 py-10 text-center">
                  <p className="font-display text-2xl text-white/60">NADA ENCONTRADO</p>
                  <p className="mt-2 text-sm text-white/35">
                    Não achamos &quot;{query}&quot;. Tente outro termo ou chame no WhatsApp que buscamos pra você.
                  </p>
                </div>
              ) : (
                <ul>
                  {results.map((p, i) => (
                    <li key={p.slug}>
                      <button
                        onClick={() => go(p)}
                        onMouseEnter={() => setActiveIdx(i)}
                        className={`flex w-full items-center gap-4 px-5 py-3 text-left transition-colors ${
                          i === activeIdx ? 'bg-[#c90000]/12' : ''
                        }`}
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10">
                          <Image src={p.images[0] || '/photos/loja-prateleiras.webp'} alt={p.name} fill sizes="56px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{p.name}</p>
                          <p className="text-xs text-white/40">{p.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-xl text-white">{fmtBRL(p.price)}</p>
                          <p className="flex items-center justify-end gap-1 text-[10px] text-white/30">
                            {i === activeIdx && <CornerDownLeft className="h-3 w-3" />} abrir
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 px-5 py-2.5 text-[10px] text-white/30">
              <span>↑↓ navegar · ENTER abrir</span>
              <span>Busca inteligente Cuba & Café</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
