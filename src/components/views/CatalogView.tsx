'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, PackageOpen, ChevronLeft, ChevronRight, X, MapPin } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { getBrand } from '@/lib/product-display';
import { navigate } from '@/lib/router';
import { storeInfo } from '@/lib/helpers';
import type { Product, Category } from '@/lib/types';

const PRICE_RANGES = [
  { key: 'todos', label: 'Todos os preços', min: 0, max: Infinity },
  { key: 'ate-50', label: 'Até R$ 50', min: 0, max: 50 },
  { key: '50-100', label: 'R$ 50 a R$ 100', min: 50, max: 100 },
  { key: '100-300', label: 'R$ 100 a R$ 300', min: 100, max: 300 },
  { key: '300-mais', label: 'Acima de R$ 300', min: 300, max: Infinity },
];

const SORTS = [
  { key: 'relevancia', label: 'Relevância' },
  { key: 'novidades', label: 'Novidades' },
  { key: 'populares', label: 'Populares' },
  { key: 'menor-preco', label: 'Menor preço' },
  { key: 'maior-preco', label: 'Maior preço' },
];

export default function CatalogView({
  initialCategory = 'todos',
  initialSearch = '',
}: {
  initialCategory?: string;
  initialSearch?: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [allResults, setAllResults] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState('relevancia');
  const [brand, setBrand] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const chipsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const restoredRef = useRef(false);

  // Sincroniza com ?q= da URL (busca do menu mobile / search modal) sem reload
  useEffect(() => {
    const syncFromHash = () => {
      const raw = window.location.hash.replace(/^#\/?/, '');
      const [pathPart, queryPart] = raw.split('?');
      if (pathPart === 'catalogo') {
        const q = new URLSearchParams(queryPart || '').get('q') || '';
        setSearch(q);
        setCategory('todos');
        setBrand(null);
        setPriceRange('todos');
      }
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  // Indicadores de scroll das categorias
  const updateChipArrows = () => {
    const el = chipsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };
  useEffect(() => {
    updateChipArrows();
    window.addEventListener('resize', updateChipArrows);
    return () => window.removeEventListener('resize', updateChipArrows);
  }, [categories]);

  useEffect(() => {
    fetch('/api/settings?key=categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.value ? JSON.parse(d.value) : []))
      .catch(() => null);
  }, []);

  // Busca server-side por categoria + termo
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'todos') params.set('category', category);
      if (search.trim()) params.set('search', search.trim());
      try {
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) setAllResults(Array.isArray(data) ? data : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [category, search]);

  // Filtros client-side (marca + faixa de preço) e ordenação
  useEffect(() => {
    const range = PRICE_RANGES.find((r) => r.key === priceRange) || PRICE_RANGES[0];
    let list = allResults.filter(
      (p) =>
        (!brand || getBrand(p) === brand) &&
        p.price >= range.min && p.price <= range.max
    );
    if (sort === 'menor-preco') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'maior-preco') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'novidades') list = [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    if (sort === 'populares') list = [...list].sort((a, b) => b.views - a.views);
    setProducts(list);
  }, [allResults, brand, priceRange, sort]);

  // Restaura posição de scroll ao voltar do produto
  useEffect(() => {
    if (!restoredRef.current && !loading && products.length) {
      restoredRef.current = true;
      const saved = window.__ccScroll?.['catalogo'];
      if (saved && saved > 100) {
        setTimeout(() => window.scrollTo({ top: saved }), 60);
        if (window.__ccScroll) window.__ccScroll['catalogo'] = undefined;
      }
    }
  }, [loading, products.length]);

  // Marcas disponíveis no resultado atual
  const brandOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of allResults) {
      const b = getBrand(p);
      if (b) set.add(b);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allResults]);

  const activeFilters = [
    category !== 'todos' && { key: 'category', label: categories.find((c) => c.slug === category)?.name || category, clear: () => setCategory('todos') },
    brand && { key: 'brand', label: brand, clear: () => setBrand(null) },
    priceRange !== 'todos' && { key: 'price', label: PRICE_RANGES.find((r) => r.key === priceRange)?.label || '', clear: () => setPriceRange('todos') },
    search.trim() && { key: 'search', label: `"${search.trim()}"`, clear: () => setSearch('') },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const clearAll = () => {
    setCategory('todos');
    setBrand(null);
    setPriceRange('todos');
    setSearch('');
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header da página */}
      <div className="relative overflow-hidden border-b border-white/10 bg-[#0d0d0d] pb-10 pt-28 md:pt-36">
        <div className="pointer-events-none absolute -top-24 left-1/4 h-[300px] w-[300px] rounded-full bg-[#c90000]/15 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl leading-none md:text-8xl"
          >
            {category === 'todos' ? (
              <>
                CATÁLOGO <span className="grad-red">COMPLETO</span>
              </>
            ) : (
              <>
                {(categories.find((c) => c.slug === category)?.name || category).toUpperCase()}
              </>
            )}
          </motion.h1>
          <p className="mt-3 text-sm text-white/55 md:text-base">
            {loading ? 'Buscando produtos...' : `${products.length} ${products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`}
          </p>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="sticky top-[56px] z-30 border-b border-white/10 bg-black/90 py-3 backdrop-blur-xl md:top-[64px]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2.5 px-5 md:px-8">
          <div className="relative min-w-[150px] flex-1 md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar no catálogo..."
              className="w-full rounded-xl border border-white/12 bg-white/5 py-2.5 pl-10 pr-3 text-sm placeholder:text-white/30 focus:border-[#c90000]/60 focus:outline-none"
            />
          </div>

          {/* Botão filtros (destaca no mobile) */}
          <button
            onClick={() => setSheetOpen(true)}
            className={`relative flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all sm:order-last ${
              activeFilters.length
                ? 'border-[#c90000] bg-[#c90000]/15 text-white'
                : 'border-white/12 bg-white/5 text-white/70 hover:text-white'
            }`}
            aria-label="Abrir filtros"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {activeFilters.length > 0 && (
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#c90000] text-[10px] font-bold">
                {activeFilters.length}
              </span>
            )}
          </button>

          <div className="relative min-w-0 flex-1 basis-full md:basis-0">
            {/* Seta esquerda (indicador que dá pra deslizar) */}
            {canScrollLeft && (
              <>
                <div className="pointer-events-none absolute -left-5 top-0 z-10 h-full w-8 bg-gradient-to-r from-black to-transparent" />
                <button
                  onClick={() => chipsRef.current?.scrollBy({ left: -180, behavior: 'smooth' })}
                  className="absolute -left-5 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/85 text-white/80 backdrop-blur-md transition-colors hover:bg-[#c90000]"
                  aria-label="Rolar categorias para a esquerda"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            <div
              ref={chipsRef}
              onScroll={updateChipArrows}
              className="no-scrollbar flex snap-x gap-1.5 overflow-x-auto scroll-smooth"
            >
              <FilterChip active={category === 'todos'} onClick={() => setCategory('todos')}>Todos</FilterChip>
              {categories.map((c) => (
                <FilterChip key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>
                  {c.name}
                </FilterChip>
              ))}
            </div>
            {canScrollRight && (
              <>
                <div className="pointer-events-none absolute -right-5 top-0 z-10 h-full w-8 bg-gradient-to-l from-black to-transparent" />
                <button
                  onClick={() => chipsRef.current?.scrollBy({ left: 180, behavior: 'smooth' })}
                  className="absolute -right-5 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/85 text-white/80 backdrop-blur-md transition-colors hover:bg-[#c90000]"
                  aria-label="Rolar categorias para a direita"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-white/12 bg-[#151515] px-3 py-2.5 text-sm text-white/80 focus:border-[#c90000]/60 focus:outline-none"
              aria-label="Ordenar por"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Chips de filtros ativos */}
        {activeFilters.length > 0 && (
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-5 pt-2.5 md:px-8">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                onClick={f.clear}
                className="flex items-center gap-1.5 rounded-full border border-[#c90000]/40 bg-[#c90000]/10 px-3 py-1 text-[11px] font-semibold text-white/80 transition-colors hover:bg-[#c90000]/25"
              >
                {f.label}
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              onClick={clearAll}
              className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#ff6b6b] underline-offset-2 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer rounded-2xl" style={{ aspectRatio: '3/4' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center md:py-28">
            <PackageOpen className="mb-5 h-14 w-14 text-white/20" />
            <p className="font-display text-3xl text-white/75">NADA ENCONTRADO POR AQUI</p>
            <p className="mt-2 max-w-sm text-sm text-white/45">
              Tente outro termo, limpe os filtros — ou chame no WhatsApp. Talvez tenhamos o
              que procura na loja física.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                onClick={clearAll}
                className="btn-shimmer rounded-xl bg-[#c90000] px-7 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#e00000]"
              >
                Limpar filtros
              </button>
              <a
                href={`https://wa.me/${storeInfo.whatsApp}?text=${encodeURIComponent('Olá! Estou procurando um produto: ' + (search || '...'))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white/80 transition-colors hover:border-white/50"
              >
                <MapPin className="h-4 w-4" /> Perguntar no WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {products.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Bottom-sheet de filtros (mobile-first) */}
      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        categories={categories}
        category={category}
        setCategory={setCategory}
        brand={brand}
        setBrand={setBrand}
        brandOptions={brandOptions}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        sort={sort}
        setSort={setSort}
        onClear={clearAll}
      />
    </div>
  );
}

/* ============ BOTTOM-SHEET DE FILTROS ============ */
function FilterSheet(props: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  category: string;
  setCategory: (c: string) => void;
  brand: string | null;
  setBrand: (b: string | null) => void;
  brandOptions: string[];
  priceRange: string;
  setPriceRange: (p: string) => void;
  sort: string;
  setSort: (s: string) => void;
  onClear: () => void;
}) {
  const {
    open, onClose, categories, category, setCategory, brand, setBrand,
    brandOptions, priceRange, setPriceRange, sort, setSort, onClear,
  } = props;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[86] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
            className="fixed inset-x-0 bottom-0 z-[88] max-h-[80dvh] overflow-y-auto rounded-t-3xl border-t border-white/12 bg-[#111] md:hidden"
            role="dialog"
            aria-label="Filtros"
          >
            {/* Alça */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111]/95 px-5 py-4 backdrop-blur-md">
              <span className="font-display text-2xl tracking-wide">FILTROS</span>
              <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 text-white/60" aria-label="Fechar filtros">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-7 px-5 py-5">
              {/* Ordenação */}
              <div>
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Ordenar por</p>
                <div className="flex flex-wrap gap-2">
                  {SORTS.map((s) => (
                    <SheetChip key={s.key} active={sort === s.key} onClick={() => setSort(s.key)}>{s.label}</SheetChip>
                  ))}
                </div>
              </div>

              {/* Categoria */}
              <div>
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Categoria</p>
                <div className="flex flex-wrap gap-2">
                  <SheetChip active={category === 'todos'} onClick={() => setCategory('todos')}>Todos</SheetChip>
                  {categories.map((c) => (
                    <SheetChip key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>{c.name}</SheetChip>
                  ))}
                </div>
              </div>

              {/* Marca */}
              {brandOptions.length > 0 && (
                <div>
                  <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Marca</p>
                  <div className="flex flex-wrap gap-2">
                    <SheetChip active={!brand} onClick={() => setBrand(null)}>Todas</SheetChip>
                    {brandOptions.map((b) => (
                      <SheetChip key={b} active={brand === b} onClick={() => setBrand(b)}>{b}</SheetChip>
                    ))}
                  </div>
                </div>
              )}

              {/* Faixa de preço */}
              <div>
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Faixa de preço</p>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((r) => (
                    <SheetChip key={r.key} active={priceRange === r.key} onClick={() => setPriceRange(r.key)}>{r.label}</SheetChip>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex gap-3 border-t border-white/10 bg-[#111]/95 px-5 py-4 backdrop-blur-md">
              <button
                onClick={onClear}
                className="min-h-[48px] flex-1 rounded-xl border border-white/15 text-sm font-bold uppercase tracking-wider text-white/70 transition-colors hover:text-white"
              >
                Limpar filtros
              </button>
              <button
                onClick={onClose}
                className="btn-shimmer min-h-[48px] flex-1 rounded-xl bg-[#c90000] font-display text-lg tracking-wider transition-colors hover:bg-[#e00000]"
              >
                VER RESULTADOS
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SheetChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[40px] rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all ${
        active
          ? 'bg-[#c90000] text-white shadow-[0_0_16px_rgba(201,0,0,0.35)]'
          : 'border border-white/12 bg-white/[0.04] text-white/60 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wider transition-all ${
        active
          ? 'bg-[#c90000] text-white shadow-[0_0_20px_rgba(201,0,0,0.35)]'
          : 'border border-white/10 bg-white/[0.03] text-white/55 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
