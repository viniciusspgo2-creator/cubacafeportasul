'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { navigate } from '@/lib/router';
import type { Article } from '@/lib/types';

const BRANDS = [
  'PAPELITO', 'SMOKING', 'RAW', 'OCB', 'TATU DU BEM', 'BEM BOLADO', 'ZOMO',
  'ZGY BRASIL', 'TABAQUITO', 'LA REVOLUCION', 'PALHEIROS', 'SQUADAFUM', 'BLUNT', 'BLACK ERVA',
];

/** Letreiro de marcas — cada marca é link pro catálogo filtrado; pausa ao tocar/hover */
export function Marquee({ dark = false }: { dark?: boolean }) {
  const items = [...BRANDS, ...BRANDS];
  return (
    <div
      className={`marquee-hover marquee-touch relative overflow-hidden border-y py-4 md:py-5 ${dark ? 'border-black/10 bg-[#f4f2ee]' : 'border-white/10 bg-[#c90000]'}`}
      aria-label="Marcas trabalhadas"
    >
      {/* Fade nas bordas */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 md:w-16" style={{ backgroundImage: dark ? 'linear-gradient(90deg, #f4f2ee, transparent)' : 'linear-gradient(90deg, #c90000, transparent)' }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 md:w-16" style={{ backgroundImage: dark ? 'linear-gradient(-90deg, #f4f2ee, transparent)' : 'linear-gradient(-90deg, #c90000, transparent)' }} />
      <div className="animate-marquee flex w-max items-center gap-8 md:gap-12">
        {items.map((b, i) => (
          <span key={i} className="flex items-center gap-8 md:gap-12">
            <button
              onClick={() => navigate(`/catalogo?q=${encodeURIComponent(b)}`)}
              tabIndex={i >= BRANDS.length ? -1 : 0}
              className={`font-display whitespace-nowrap text-xl tracking-widest transition-colors md:text-2xl ${dark ? 'text-black/25 hover:text-black/70' : 'text-white/85 hover:text-white'}`}
              aria-label={`Ver produtos da marca ${b}`}
            >
              {b}
            </button>
            <span className={`text-sm ${dark ? 'text-black/15' : 'text-white/45'}`}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============ CATEGORIAS — carrossel horizontal com snap ============ */
const catImages: Record<string, string> = {
  Narguiles: '/photos/narguiles-vitrine.webp',
  Headshop: '/photos/headshop-estante.webp',
  Cachimbos: '/photos/vitrine-boquinhas.webp',
  Sedas: '/photos/vitrine-boquinhas.webp',
  Tabacos: '/photos/cigarrilhas-case.webp',
  Essências: '/photos/essencias-parede.webp',
  Acessórios: '/photos/acessorios-vitrine.webp',
  Kits: '/photos/narguiles-2.webp',
  Presentes: '/photos/essencias-2.webp',
  Novidades: '/photos/loja-prateleiras.webp',
};

export function CategoryCarousel({
  categories,
  counts,
}: {
  categories: { slug: string; name: string; icon: string; desc: string }[];
  counts?: Record<string, number>;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    el?.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el?.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [categories.length]);

  if (!categories.length) {
    return (
      <div className="no-scrollbar flex gap-3 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer w-[42vw] shrink-0 snap-start rounded-2xl md:w-[220px]" style={{ aspectRatio: '4/5' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 md:mx-0 md:gap-4 md:px-0"
        role="list"
        aria-label="Categorias"
      >
        {categories.map((cat, i) => (
          <motion.button
            key={cat.slug}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay: Math.min(i, 5) * 0.06 }}
            onClick={() => navigate(`/categoria/${cat.slug}`)}
            className="group relative w-[42vw] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 text-left sm:w-[38vw] md:w-[220px]"
            role="listitem"
          >
            <div className="relative aspect-[4/5]">
              <Image
                src={catImages[cat.name] || '/photos/loja-prateleiras.webp'}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 42vw, 220px"
                className="img-zoom object-cover opacity-55 transition-opacity group-hover:opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <span className="font-display block text-2xl leading-none tracking-wide text-white">
                  {cat.name.toUpperCase()}
                </span>
                <span className="mt-1.5 block text-[11px] leading-snug text-white/55">
                  {counts?.[cat.slug] !== undefined
                    ? `${counts[cat.slug]} ${counts[cat.slug] === 1 ? 'produto' : 'produtos'}`
                    : cat.desc}
                </span>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#ff4b4b] opacity-100 transition-all duration-300 md:opacity-0 md:group-hover:opacity-100">
                  Explorar <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ boxShadow: 'inset 0 0 0 1px rgba(201,0,0,0.55), 0 0 28px rgba(201,0,0,0.25)' }} />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Setas desktop */}
      {canPrev && (
        <button
          onClick={() => scrollerRef.current?.scrollBy({ left: -480, behavior: 'smooth' })}
          className="absolute -left-4 top-[40%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/85 text-white backdrop-blur-md transition-colors hover:bg-[#c90000] lg:flex"
          aria-label="Categorias anteriores"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canNext && (
        <button
          onClick={() => scrollerRef.current?.scrollBy({ left: 480, behavior: 'smooth' })}
          className="absolute -right-4 top-[40%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/85 text-white backdrop-blur-md transition-colors hover:bg-[#c90000] lg:flex"
          aria-label="Próximas categorias"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

/* ============ CONTADOR ANIMADO ============ */
function CountUp({ to, suffix = '', duration = 1600 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * (prefersReduced ? 1 : eased)));
      if (p < 1 && !prefersReduced) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return <span ref={ref}>{val.toLocaleString('pt-BR')}{suffix}</span>;
}

/* ============ SEÇÃO EXPERIÊNCIA (claro) ============ */
export function ExperienceSection() {
  return (
    <section className="section-light noise relative overflow-hidden py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-[#c90000]"
            >
              <span className="h-px w-8 bg-[#c90000]" /> A Experiência
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-5xl leading-[0.95] text-black md:text-7xl"
            >
              UM PONTO DE
              <br />
              ENCONTRO DA
              <br />
              <span className="text-[#c90000]">CULTURA SMOKE.</span>
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-7 space-y-4 text-[15px] leading-relaxed text-black/70"
            >
              <p>
                No coração do Portal Sul Shopping, a Cuba &amp; Café nasceu com uma ideia clara:
                ser o ponto de encontro de quem vive o universo smoke em Goiânia. Não somos
                apenas uma loja — somos curadoria, conversa, café e comunidade.
              </p>
              <p>
                Nossa equipe conhece cada produto da prateleira: do stem ideal para sua
                primeira sessão ao charuto para o momento especial. Você senta no balcão vermelho,
                toma um café e sai com a escolha certa.
              </p>
              <p>
                E para quem está em qualquer canto do Brasil, o mesmo atendimento especializado
                acontece no WhatsApp — com envio para todo o território nacional.
              </p>
            </motion.div>

            {/* Números com contagem animada */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-9 grid grid-cols-3 gap-4 md:gap-6"
            >
              {[
                { n: 10, suffix: 'K', prefix: '+', l: 'Clientes atendidos' },
                { n: 800, suffix: '', prefix: '+', l: 'Produtos em curadoria' },
                { n: 100, suffix: '%', prefix: '', l: 'Produtos originais' },
              ].map((s) => (
                <div key={s.l} className="border-l-2 border-[#c90000] pl-4">
                  <p className="font-display text-3xl text-black md:text-5xl">
                    {s.prefix}
                    <CountUp to={s.n} suffix={s.suffix} />
                  </p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-black/55">{s.l}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Foto única da loja — balcão vermelho */}
          <div className="relative mx-auto w-full max-w-[520px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative"
            >
              <div className="overflow-hidden rounded-3xl border-[6px] border-white shadow-2xl shadow-black/25">
                <Image
                  src="/photos/loja-balcao.webp"
                  alt="Balcão vermelho da Cuba & Café Tabacaria no Portal Sul Shopping"
                  width={880}
                  height={587}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 90vw, 480px"
                />
              </div>

              {/* Selo DESDE 2021 — legível */}
              <div className="absolute -bottom-6 -left-3 z-20 flex h-28 w-28 animate-floaty flex-col items-center justify-center rounded-full border-4 border-white bg-[#c90000] text-center shadow-xl shadow-[#c90000]/40 md:-left-8 md:h-36 md:w-36">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/85 md:text-xs">Desde</span>
                <span className="font-display text-4xl leading-none text-white md:text-5xl">2021</span>
                <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/75 md:text-[10px]">Goiânia — GO</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ BLOCO GEO — resposta direta + linkagem interna (citável por IAs) ============ */
export function GEOSection() {
  const facts = [
    { k: 'Onde fica', v: 'Portal Sul Shopping — Av. dos Ipês, Jardins Lisboa, Goiânia-GO (CEP 74357-000)' },
    { k: 'Horário', v: 'Todos os dias, das 10h às 22h (inclusive domingos e feriados)' },
    { k: 'Como comprar', v: 'Pelo site (sacola) finalizando no WhatsApp (62) 8263-3610, na loja física ou retirada' },
    { k: 'Entrega', v: 'Goiânia: mesmo dia ou até 24h · Envio para todo o Brasil com rastreio em 1 dia útil' },
    { k: 'Pagamento', v: 'Pix, dinheiro, débito e crédito em até 12x (consulte juros)' },
    { k: 'Garantia', v: '100% produtos originais de distribuidores oficiais · troca em até 7 dias' },
  ];
  return (
    <section className="relative bg-[#0d0d0d] py-16 md:py-20" aria-label="Informações essenciais sobre a Cuba & Café">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-8">
          <span className="mb-3 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-[#ff4b4b]">
            <span className="h-px w-8 bg-[#c90000]" /> Guia rápido
          </span>
          <h2 className="font-display text-4xl leading-[0.95] md:text-5xl">
            TUDO SOBRE A <span className="grad-red">CUBA &amp; CAFÉ</span> EM 1 MINUTO
          </h2>
          {/* BLUF — resposta direta, citável por buscadores e IAs */}
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/60 md:text-base">
            A <strong className="text-white/85">Cuba &amp; Café Tabacaria</strong> é uma tabacaria premium
            em Goiânia-GO, no Portal Sul Shopping, especializada em narguiles, essências, sedas, tabacos,
            cachimbos e acessórios de headshop. Desde 2021, já atendeu mais de 10 mil clientes com
            +800 produtos em curadoria, todos originais e de distribuidores oficiais. O pedido é feito pelo
            site com finalização no WhatsApp, com entrega local em Goiânia e envio para todo o Brasil —
            a loja abre todos os dias, das 10h às 22h.
          </p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((f) => (
            <div key={f.k} className="rounded-2xl border border-white/10 bg-[#121212] p-4">
              <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6b6b]">{f.k}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-white/70">{f.v}</dd>
            </div>
          ))}
        </dl>

        <nav className="mt-7 flex flex-wrap gap-2.5" aria-label="Aprofunde-se">
          {[
            { label: 'Glossário smoke', href: '/glossario' },
            { label: 'Guias de compra (blog)', href: '/blog' },
            { label: 'Catálogo completo', href: '/catalogo' },
            { label: 'Narguiles', href: '/categoria/narguiles' },
            { label: 'Essências', href: '/categoria/essencias' },
            { label: 'Sedas', href: '/categoria/sedas' },
          ].map((l) => (
            <button
              key={l.href}
              onClick={() => navigate(l.href)}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/65 transition-colors hover:border-[#c90000]/60 hover:text-white"
            >
              {l.label}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}

/* ============ BLOG TEASER ============ */
export function BlogTeaser({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;
  return (
    <section className="relative bg-[#0d0d0d] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
          <div>
            <span className="mb-3 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-[#ff4b4b]">
              <span className="h-px w-8 bg-[#c90000]" /> Blog
            </span>
            <h2 className="font-display text-5xl leading-none md:text-7xl">
              UNIVERSO <span className="grad-red">CUBA & CAFÉ</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm text-white/55 md:text-base">
              Guias, dicas e cultura smoke escritos por quem entende — do primeiro narguilé
              ao colecionismo.
            </p>
          </div>
          <button
            onClick={() => navigate('/blog')}
            className="btn-shimmer flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all hover:border-[#c90000] hover:bg-[#c90000]"
          >
            Ver todos os artigos <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {articles.slice(0, 3).map((a, i) => (
            <motion.article
              key={a.slug}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55 }}
              onClick={() => navigate(`/blog/${a.slug}`)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#121212] transition-all hover:border-[#c90000]/50"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image src={a.cover} alt={a.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="img-zoom object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
                  {a.readTime} min de leitura
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl leading-tight transition-colors group-hover:text-[#ff4b4b]">
                  {a.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/50">{a.excerpt}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
