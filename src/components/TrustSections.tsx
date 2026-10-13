'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, ExternalLink, MapPin } from 'lucide-react';
import { REVIEWS, FAQ_ITEMS, GOOGLE_REVIEWS_URL } from '@/lib/reviews';

/* ============ AVALIAÇÕES — carrossel de prova social ============ */
function Stars({ n, className = 'h-3.5 w-3.5' }: { n: number; className?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${n} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${className} ${i < n ? 'fill-[#ffb400] text-[#ffb400]' : 'fill-white/10 text-white/10'}`}
        />
      ))}
    </span>
  );
}

export function ReviewsSection() {
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
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#0d0d0d] py-20 md:py-28">
      <div className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-[#c90000]/10 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
          <div>
            <span className="mb-3 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-[#ff4b4b]">
              <span className="h-px w-8 bg-[#c90000]" /> Prova social
            </span>
            <h2 className="font-display text-5xl leading-[0.95] md:text-6xl">
              O QUE DIZEM <span className="grad-red">NOSSOS CLIENTES</span>
            </h2>
            <div className="mt-3 flex items-center gap-2.5">
              <Stars n={5} className="h-4 w-4" />
              <span className="text-sm text-white/55">Nota média 4.9 · avaliações do Google</span>
            </div>
          </div>
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white/70 transition-all hover:border-white/50 hover:text-white"
          >
            Ver todas no Google <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="relative">
          <div
            ref={scrollerRef}
            className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 pb-2 md:mx-0 md:gap-4 md:px-0"
          >
            {REVIEWS.map((r, i) => (
              <motion.figure
                key={r.name + i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: Math.min(i, 3) * 0.08 }}
                className="flex w-[84vw] shrink-0 snap-start flex-col justify-between rounded-2xl border border-white/10 bg-[#141414] p-5 sm:w-[380px] md:p-6"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Stars n={r.rating} />
                    <span className="text-[11px] text-white/35">{r.when}</span>
                  </div>
                  <blockquote className="mt-4 text-sm leading-relaxed text-white/75 md:text-[15px]">
                    “{r.text}”
                  </blockquote>
                </div>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-white/8 pt-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c90000]/20 text-xs font-bold text-[#ff6b6b]">
                    {r.initials}
                  </span>
                  <span className="text-sm font-semibold text-white/85">{r.name}</span>
                  <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                    <MapPin className="h-3 w-3" /> Google
                  </span>
                </figcaption>
              </motion.figure>
            ))}
          </div>

          {canPrev && (
            <button
              onClick={() => scrollerRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
              className="absolute -left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/85 text-white backdrop-blur-md transition-colors hover:bg-[#c90000] lg:flex"
              aria-label="Avaliações anteriores"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {canNext && (
            <button
              onClick={() => scrollerRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
              className="absolute -right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/85 text-white backdrop-blur-md transition-colors hover:bg-[#c90000] lg:flex"
              aria-label="Próximas avaliações"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============ FAQ — accordion elegante ============ */
export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  // JSON-LD FAQPage — rich results + citabilidade para IAs (GEO)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'pt-BR',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <section className="relative bg-black py-20 md:py-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="mb-10 text-center md:mb-12">
          <span className="mb-3 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-[#ff4b4b]">
            <span className="h-px w-8 bg-[#c90000]" /> Dúvidas frequentes <span className="h-px w-8 bg-[#c90000]" />
          </span>
          <h2 className="font-display text-5xl leading-[0.95] md:text-6xl">
            TUDO QUE VOCÊ <span className="grad-red">PRECISA SABER</span>
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const open = openIdx === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className={`overflow-hidden rounded-2xl border transition-colors ${
                  open ? 'border-[#c90000]/50 bg-[#141414]' : 'border-white/10 bg-[#111]'
                }`}
              >
                <button
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="text-[15px] font-semibold text-white/90">{item.q}</span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-lg leading-none transition-all duration-300 ${
                      open ? 'rotate-45 border-[#c90000] bg-[#c90000] text-white' : 'border-white/20 text-white/50'
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-white/60">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
