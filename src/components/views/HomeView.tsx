'use client';

import { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import ProductCard from '@/components/ProductCard';
import { Marquee, CategoryCarousel, ExperienceSection, BlogTeaser, GEOSection } from '@/components/Sections';
import { ReviewsSection, FAQSection } from '@/components/TrustSections';
import { LocationSection } from '@/components/LocationFooter';
import { navigate } from '@/lib/router';
import { storeInfo } from '@/lib/helpers';
import type { Product, Article, Category } from '@/lib/types';

/* Cache module-level:voltar pra home reusa os dados (sem "Carregando" piscar) */
interface HomeCache {
  featured?: Product[];
  news?: Product[];
  articles?: Article[];
  categories?: Category[];
  counts?: Record<string, number>;
}
const cache: HomeCache = {};

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((r) => r.json()) as Promise<T>;
}

export default function HomeView() {
  const [featured, setFeatured] = useState<Product[]>(cache.featured || []);
  const [news, setNews] = useState<Product[]>(cache.news || []);
  const [articles, setArticles] = useState<Article[]>(cache.articles || []);
  const [categories, setCategories] = useState<Category[]>(cache.categories || []);
  const [counts, setCounts] = useState<Record<string, number>>(cache.counts || {});
  const loaded = featured.length > 0;

  useEffect(() => {
    let alive = true;

    // Produtos em destaque + novidades + contagem por categoria (uma chamada única)
    fetchJSON<Product[]>('/api/products').then((all) => {
      if (!alive || !Array.isArray(all)) return;
      const feat = all.filter((p) => p.featured).slice(0, 8);
      const nw = all.filter((p) => p.isNew).slice(0, 8);
      const cnt: Record<string, number> = {};
      for (const p of all) {
        const slug = p.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        cnt[slug] = (cnt[slug] || 0) + 1;
      }
      cache.featured = feat;
      cache.news = nw;
      cache.counts = cnt;
      setFeatured(feat);
      setNews(nw);
      setCounts(cnt);
    }).catch(() => null);

    // Categorias: usa cache ou busca
    if (!cache.categories) {
      fetchJSON<{ value?: string }>('/api/settings?key=categories').then((d) => {
        if (!alive) return;
        const cats: Category[] = d.value ? JSON.parse(d.value) : [];
        cache.categories = cats;
        setCategories(cats);
      }).catch(() => null);
    }

    if (!cache.articles) {
      fetchJSON<Article[]>('/api/articles').then((data) => {
        if (!alive || !Array.isArray(data)) return;
        cache.articles = data;
        setArticles(data);
      }).catch(() => null);
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/', action: 'visit' }),
    }).catch(() => null);

    return () => { alive = false; };
  }, []);

  return (
    <div>
      <Hero />
      <Marquee />

      {/* Destaques */}
      <section id="destaques" className="relative overflow-hidden bg-[#0d0d0d] py-20 md:py-28">
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
            <div>
              <span className="mb-3 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-[#ff4b4b]">
                <span className="h-px w-8 bg-[#c90000]" /> Seleção especial
              </span>
              <h2 className="font-display text-5xl leading-[0.95] md:text-7xl">
                EM <span className="grad-red">DESTAQUE</span>
              </h2>
              <p className="mt-4 max-w-lg text-sm text-white/55 md:text-base">
                Os produtos mais desejados da casa, escolhidos a dedo pela nossa equipe.
                Arraste para o lado e descubra.
              </p>
            </div>
            <button
              onClick={() => navigate('/catalogo')}
              className="btn-shimmer rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all hover:border-[#c90000] hover:bg-[#c90000]"
            >
              Ver catálogo completo
            </button>
          </div>

          {loaded ? (
            <FeaturedCarousel products={featured} />
          ) : (
            /* Skeleton elegante com shimmer */
            <div className="flex gap-4 overflow-hidden md:gap-5" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[70%] shrink-0 sm:w-[45%] md:w-[30%] lg:w-[24%]">
                  <div className="skeleton-shimmer rounded-2xl" style={{ aspectRatio: '4/5' }} />
                  <div className="skeleton-shimmer mt-3 h-4 w-3/4 rounded-md" />
                  <div className="skeleton-shimmer mt-2 h-6 w-1/3 rounded-md" />
                </div>
              ))}
            </div>
          )}

          {/* Estado vazio (sem destaques cadastrados) */}
          {loaded && featured.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#121212] py-16 text-center">
              <p className="font-display text-3xl text-white/75">DESTAQUES EM BREVE</p>
              <p className="mt-2 max-w-sm text-sm text-white/50">
                Nossa equipe está preparando a seleção. Enquanto isso, fale com a gente e
                descubra o que chegou de novo.
              </p>
              <a
                href={`https://wa.me/${storeInfo.whatsApp}?text=${encodeURIComponent('Olá! Quais produtos vocês recomendam?')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer mt-6 rounded-xl bg-[#c90000] px-7 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#e00000]"
              >
                Falar no WhatsApp
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Categorias — carrossel horizontal com snap */}
      <section className="relative bg-black py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-10 text-center md:mb-12">
            <span className="mb-3 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-[#ff4b4b]">
              <span className="h-px w-8 bg-[#c90000]" /> Navegue <span className="h-px w-8 bg-[#c90000]" />
            </span>
            <h2 className="font-display text-5xl leading-[0.95] md:text-7xl">
              TODAS AS <span className="text-stroke-red">CATEGORIAS</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-white/55 md:text-base">
              Do narguilé ao presente perfeito — deslize para o lado e tudo fica a um toque.
            </p>
          </div>
          <CategoryCarousel categories={categories} counts={counts} />
        </div>
      </section>

      <ExperienceSection />

      {/* Novidades */}
      <section className="relative overflow-hidden bg-[#151515] py-20 md:py-28">
        <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-[#c90000]/10 blur-[140px]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
            <div>
              <span className="mb-3 inline-block rounded-md bg-[#c90000] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em]">
                Recém-chegados
              </span>
              <h2 className="font-display mt-3 text-5xl leading-[0.95] md:text-7xl">
                O QUE ACABOU <span className="grad-red">DE CHEGAR</span>
              </h2>
            </div>
          </div>
          {news.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {news.slice(0, 8).map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer rounded-2xl" style={{ aspectRatio: '3/4' }} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ReviewsSection />
      <FAQSection />
      <GEOSection />
      <BlogTeaser articles={articles} />
      <LocationSection />
    </div>
  );
}
