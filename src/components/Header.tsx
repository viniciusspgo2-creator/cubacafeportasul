'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Search, ShoppingBag, Menu, MapPin, Instagram, Home, LayoutGrid,
  MessageCircle, X, Cigarette, Flame, Leaf, Gift, Sparkles, Package,
  Wind, Hexagon, Star, ScrollText,
} from 'lucide-react';
import { useBag } from '@/lib/store';
import { navigate } from '@/lib/router';
import { storeInfo } from '@/lib/helpers';

export const NAV_CATEGORIES = [
  { slug: 'narguiles', name: 'Narguiles', icon: Wind },
  { slug: 'essencias', name: 'Essências', icon: Flame },
  { slug: 'sedas', name: 'Sedas', icon: ScrollText },
  { slug: 'tabacos', name: 'Tabacos', icon: Leaf },
  { slug: 'headshop', name: 'Headshop', icon: Hexagon },
  { slug: 'cachimbos', name: 'Cachimbos', icon: Cigarette },
  { slug: 'acessorios', name: 'Acessórios', icon: Package },
  { slug: 'kits', name: 'Kits', icon: Gift },
  { slug: 'presentes', name: 'Presentes', icon: Star },
  { slug: 'novidades', name: 'Novidades', icon: Sparkles },
];

/** Contador da sacola com pulso animado ao mudar */
function BagCount({ count, className = '' }: { count: number; className?: string }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 1.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 380 }}
          className={`flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-black bg-white px-1 text-[10px] font-bold text-black ${className}`}
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export default function Header({ onSearch, onMobileMenu }: { onSearch: () => void; onMobileMenu: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const bagCount = useBag((s) => s.items.reduce((acc, i) => acc + i.qty, 0));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (hash: string) => {
    navigate(hash);
    window.scrollTo({ top: 0 });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-white/10 bg-black/70 py-1.5 shadow-lg shadow-black/40 backdrop-blur-xl backdrop-saturate-150'
          : 'bg-transparent py-3.5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        {/* Logo — wordmark (nome sem estrela) */}
        <button onClick={() => go('/')} className="group flex shrink-0 items-center" aria-label="Início">
          <Image
            src="/brand/logo-header.png"
            alt="Cuba & Café Tabacaria"
            width={640}
            height={252}
            className={`w-auto transition-all duration-500 ${scrolled ? 'h-8' : 'h-10 md:h-11'}`}
            priority
          />
        </button>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Categorias">
          {NAV_CATEGORIES.slice(0, 7).map((cat) => (
            <button
              key={cat.slug}
              onClick={() => go(`/categoria/${cat.slug}`)}
              className="rounded-lg px-3 py-2 text-[13px] font-medium uppercase tracking-wider text-white/65 transition-all hover:bg-white/5 hover:text-white"
            >
              {cat.name}
            </button>
          ))}
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onSearch}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all hover:border-[#c90000]/50 hover:text-white"
            aria-label="Buscar produtos"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          <button
            onClick={() => go('/catalogo')}
            className="hidden h-10 items-center rounded-xl px-4 text-[13px] font-semibold uppercase tracking-wider text-white/70 transition-all hover:text-white md:flex"
          >
            Catálogo
          </button>
          <button
            onClick={() => go('/blog')}
            className="hidden h-10 items-center rounded-xl px-4 text-[13px] font-semibold uppercase tracking-wider text-white/70 transition-all hover:text-white md:flex"
          >
            Universo
          </button>

          {/* Sacola */}
          <button
            onClick={() => useBag.getState().setOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#c90000] text-white transition-all hover:bg-[#e00000] hover:shadow-[0_0_24px_rgba(201,0,0,0.45)]"
            aria-label={`Sacola com ${bagCount} itens`}
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            <BagCount count={bagCount} className="absolute -right-1.5 -top-1.5" />
          </button>

          {/* Hamburger */}
          <button
            onClick={onMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition-all hover:text-white lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ============ MENU LATERAL (painel deslizante) ============ */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [search, setSearch] = useState('');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
          />

          {/* Painel lateral direito */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-[82] flex w-[88%] max-w-sm flex-col border-l border-white/10 bg-[#0b0b0b]"
            role="dialog"
            aria-label="Menu"
          >
            {/* Glow decorativo */}
            <div className="pointer-events-none absolute -top-24 right-0 h-[300px] w-[300px] rounded-full bg-[#c90000]/20 blur-[120px]" />

            {/* Topo */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-5 py-4">
              <Image src="/brand/logo-header.png" alt="Cuba & Café" width={640} height={252} className="h-9 w-auto" />
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-10 pt-5">
              {/* Busca */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (search.trim()) {
                    onClose();
                    navigate(`/catalogo?q=${encodeURIComponent(search.trim())}`);
                  }
                }}
                className="relative mb-6"
              >
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar narguile, seda, essência..."
                  className="w-full rounded-xl border border-white/15 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/35 focus:border-[#c90000]/60 focus:outline-none"
                />
              </form>

              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">Categorias</p>
              <div className="space-y-1.5">
                {NAV_CATEGORIES.map((cat, i) => (
                  <motion.button
                    key={cat.slug}
                    initial={{ x: 24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 + i * 0.035 }}
                    onClick={() => { onClose(); navigate(`/categoria/${cat.slug}`); }}
                    className="group flex w-full items-center gap-3.5 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition-all hover:border-[#c90000]/40 hover:bg-[#c90000]/10"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#ff4b4b] transition-colors group-hover:border-[#c90000]/50">
                      <cat.icon className="h-4 w-4" />
                    </span>
                    <span className="font-display flex-1 text-lg tracking-wide">{cat.name}</span>
                    <span className="text-[#ff4b4b] opacity-0 transition-opacity group-hover:opacity-100">→</span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <motion.button
                  initial={{ x: 24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  onClick={() => { onClose(); navigate('/catalogo'); }}
                  className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5 text-left"
                >
                  <span className="font-display text-lg tracking-wide">Catálogo</span>
                </motion.button>
                <motion.button
                  initial={{ x: 24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.49 }}
                  onClick={() => { onClose(); navigate('/blog'); }}
                  className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5 text-left"
                >
                  <span className="font-display text-lg tracking-wide">Universo Blog</span>
                </motion.button>
                <motion.button
                  initial={{ x: 24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.53 }}
                  onClick={() => { onClose(); navigate('/glossario'); }}
                  className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5 text-left"
                >
                  <span className="font-display text-lg tracking-wide">Glossário</span>
                </motion.button>
              </div>

              {/* Links rápidos */}
              <div className="mt-7 space-y-1 border-t border-white/10 pt-6">
                <a
                  href={storeInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl px-2 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Instagram className="h-4 w-4 text-[#ff4b4b]" />
                  </span>
                  Instagram — {storeInfo.instagramHandle}
                </a>
                <a
                  href={`https://wa.me/${storeInfo.whatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl px-2 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <svg className="h-4 w-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.03c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24s-3.7 8.24-8.24 8.24z"/></svg>
                  </span>
                  WhatsApp — (62) 8263-3610
                </a>
                <button
                  onClick={() => { onClose(); navigate('/#localizacao'); }}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <MapPin className="h-4 w-4 text-[#ff4b4b]" />
                  </span>
                  Como chegar — Portal Sul Shopping
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============ BARRA INFERIOR MOBILE — SEMPRE FIXA EM TODO O SITE ============ */
export function BottomBar() {
  const bagCount = useBag((s) => s.items.reduce((acc, i) => acc + i.qty, 0));
  const isAdmin = typeof window !== 'undefined' && window.location.hash.startsWith('#/admin');

  if (isAdmin) return null;

  const go = (hash: string) => {
    navigate(hash);
    window.scrollTo({ top: 0 });
  };

  return (
    <nav
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
      className="fixed inset-x-0 bottom-0 z-[55] border-t border-white/10 bg-black/90 backdrop-blur-xl md:hidden"
      aria-label="Navegação rápida"
    >
      <div className="grid grid-cols-4">
            <button onClick={() => go('/')} className="flex min-h-[56px] flex-col items-center justify-center gap-1 text-white/60 transition-colors hover:text-white active:text-[#ff4b4b]" aria-label="Início">
              <Home className="h-5 w-5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Início</span>
            </button>
            <button onClick={() => go('/catalogo')} className="flex min-h-[56px] flex-col items-center justify-center gap-1 text-white/60 transition-colors hover:text-white active:text-[#ff4b4b]" aria-label="Catálogo">
              <LayoutGrid className="h-5 w-5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Catálogo</span>
            </button>
            <a
              href={`https://wa.me/${storeInfo.whatsApp}?text=${encodeURIComponent('Olá, Cuba & Café! Vim pelo site.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[56px] flex-col items-center justify-center gap-1 text-white/60 transition-colors hover:text-white active:text-[#25D366]"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">WhatsApp</span>
            </a>
            <button
              onClick={() => useBag.getState().setOpen(true)}
              className="relative flex min-h-[56px] flex-col items-center justify-center gap-1 text-white/60 transition-colors hover:text-white active:text-[#ff4b4b]"
              aria-label={`Sacola com ${bagCount} itens`}
            >
              <span className="relative">
                <ShoppingBag className="h-5 w-5" />
                <BagCount count={bagCount} className="absolute -right-2.5 -top-2" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider">Sacola</span>
            </button>
          </div>
      </nav>
  );
}
