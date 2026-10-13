'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Search, User } from 'lucide-react';
import { navigate } from '@/lib/router';
import type { Article } from '@/lib/types';

/** Renderiza linhas de tabela markdown (| a | b |) em <table> semântica — RAG/GEO friendly */
function renderTable(lines: string[], keyPrefix: string) {
  const rows = lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|'))
    .map((l) => l.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()))
    .filter((cells) => !cells.every((c) => /^:?-{2,}:?$/.test(c)));
  if (rows.length === 0) return null;
  const [head, ...body] = rows;
  const bold = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>');
  return (
    <div key={keyPrefix} className="my-6 overflow-x-auto rounded-2xl border border-white/12">
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-[#c90000]/15">
            {head.map((c, ci) => (
              <th key={ci} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#ff6b6b]"
                dangerouslySetInnerHTML={{ __html: bold(c) }} />
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((cells, ri) => (
            <tr key={ri} className="border-t border-white/8 odd:bg-white/[0.02]">
              {cells.map((c, ci) => (
                <td key={ci} className="px-4 py-3 align-top text-white/70"
                  dangerouslySetInnerHTML={{ __html: bold(c) }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderContent(content: string) {
  const lines = content.split('\n');
  const out: React.ReactNode[] = [];
  let tableBuffer: string[] = [];

  const flushTable = (idx: number) => {
    if (tableBuffer.length) {
      const t = renderTable(tableBuffer, `t-${idx}`);
      if (t) out.push(t);
      tableBuffer = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('|')) {
      tableBuffer.push(trimmed);
      return;
    }
    flushTable(i);
    if (!trimmed) return;
    if (trimmed.startsWith('# ')) {
      out.push(<h1 key={i} className="font-display mb-5 mt-2 text-4xl leading-tight md:text-5xl">{trimmed.slice(2)}</h1>);
    } else if (trimmed.startsWith('## ')) {
      out.push(<h2 key={i} className="font-display mb-3 mt-9 text-2xl tracking-wide text-[#ff6b6b] md:text-3xl">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith('### ')) {
      out.push(<h3 key={i} className="mt-7 mb-2 text-lg font-bold text-white/90">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith('> ')) {
      out.push(
        <blockquote key={i} className="my-6 rounded-r-xl border-l-4 border-[#c90000] bg-[#c90000]/8 px-5 py-3.5 text-sm font-medium text-white/80">
          {trimmed.slice(2)}
        </blockquote>
      );
    } else if (/^\d+\.\s/.test(trimmed) || trimmed.startsWith('- ')) {
      const text = trimmed.replace(/^(\d+\.|-)\s/, '');
      out.push(
        <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-white/70">
          <span className="mt-0.5 font-display text-[#ff4b4b]">{trimmed.startsWith('- ') ? '—' : text.split('.')[0] + '.'}</span>
          <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/^(\d+\.)\s*/, '') }} />
        </li>
      );
    } else {
      out.push(
        <p
          key={i}
          className="mb-4 text-[15px] leading-relaxed text-white/65"
          dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }}
        />
      );
    }
  });
  flushTable(lines.length);
  return out;
}

export function BlogListView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then((r) => r.json())
      .then(setArticles)
      .finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/10 bg-[#0d0d0d] pb-12 pt-28 md:pt-36">
        <div className="pointer-events-none absolute -top-20 right-1/4 h-[320px] w-[320px] rounded-full bg-[#c90000]/15 blur-[130px]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8">
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.3em] text-[#ff4b4b]">
            Blog & Cultura
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-5xl leading-[0.92] md:text-8xl">
            UNIVERSO<br />
            <span className="grad-red">CUBA & CAFÉ</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-5 max-w-xl text-sm text-white/50 md:text-base">
            Guias completos, dicas de quem entende e a cultura smoke em Goiânia e no Brasil.
            Conteúdo novo toda semana.
          </motion.p>

          <div className="relative mt-8 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar artigos..."
              className="w-full rounded-xl border border-white/12 bg-white/5 py-3 pl-11 pr-4 text-sm placeholder:text-white/30 focus:border-[#c90000]/60 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        {loading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-[#151515]" />
            ))}
          </div>
        ) : (
          <>
            {/* Artigo destaque */}
            {featured && (
              <motion.article
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/blog/${featured.slug}`)}
                className="group mb-12 grid cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-[#121212] md:grid-cols-2"
              >
                <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[340px]">
                  <Image src={featured.cover} alt={featured.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="img-zoom object-cover" />
                  <span className="absolute left-4 top-4 rounded-lg bg-[#c90000] px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                    Destaque
                  </span>
                </div>
                <div className="flex flex-col justify-center p-7 md:p-10">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {featured.tags.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-full border border-white/12 px-3 py-0.5 text-[10px] uppercase tracking-wider text-white/45">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-display text-3xl leading-tight transition-colors group-hover:text-[#ff4b4b] md:text-4xl">
                    {featured.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm text-white/50">{featured.excerpt}</p>
                  <p className="mt-5 flex items-center gap-2 text-xs text-white/35">
                    <Clock className="h-3.5 w-3.5" /> {featured.readTime} min de leitura ·{' '}
                    {new Date(featured.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </motion.article>
            )}

            {/* Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((a, i) => (
                <motion.article
                  key={a.slug}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: (i % 3) * 0.08, duration: 0.5 }}
                  onClick={() => navigate(`/blog/${a.slug}`)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#121212] transition-all hover:border-[#c90000]/50"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image src={a.cover} alt={a.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="img-zoom object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/85 to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/75 backdrop-blur-sm">
                      {a.readTime} min
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-2xl leading-tight transition-colors group-hover:text-[#ff4b4b]">
                      {a.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-white/45">{a.excerpt}</p>
                    <p className="mt-4 text-[11px] text-white/30">
                      {new Date(a.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>

            {!filtered.length && (
              <div className="py-24 text-center">
                <p className="font-display text-3xl text-white/60">NENHUM ARTIGO ENCONTRADO</p>
                <p className="mt-2 text-sm text-white/35">Tente outra busca.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function BlogArticleView({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/articles?slug=${slug}`);
        if (!res.ok) throw new Error('404');
        const data: Article = await res.json();
        if (cancelled) return;
        setArticle(data);
        const allRes = await fetch('/api/articles');
        const all: Article[] = await allRes.json();
        if (!cancelled) setRelated(all.filter((a) => a.slug !== slug).slice(0, 3));
      } catch {
        if (!cancelled) setArticle(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    window.scrollTo({ top: 0 });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black px-5 pb-24 pt-32">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="h-10 w-3/4 animate-pulse rounded-xl bg-[#151515]" />
          <div className="aspect-[16/8] animate-pulse rounded-2xl bg-[#151515]" />
          <div className="h-4 w-full animate-pulse rounded bg-[#151515]" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-[#151515]" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-center">
        <h1 className="font-display text-4xl">ARTIGO NÃO ENCONTRADO</h1>
        <button onClick={() => navigate('/blog')} className="btn-shimmer mt-7 rounded-xl bg-[#c90000] px-7 py-3.5 font-bold uppercase tracking-wider">
          Voltar ao blog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header do artigo */}
      <div className="relative overflow-hidden border-b border-white/10 bg-[#0d0d0d] pb-10 pt-24 md:pt-28">
        <div className="pointer-events-none absolute -top-16 left-1/3 h-[280px] w-[280px] rounded-full bg-[#c90000]/12 blur-[120px]" />
        <div className="relative mx-auto max-w-3xl px-5 md:px-8">
          <button
            onClick={() => navigate('/blog')}
            className="mb-7 flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Universo Cuba & Café
          </button>
          <div className="mb-4 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <span key={t} className="rounded-full border border-[#c90000]/35 bg-[#c90000]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#ff6b6b]">
                {t}
              </span>
            ))}
          </div>
          <h1 className="font-display text-4xl leading-[0.95] md:text-6xl">{article.title.toUpperCase()}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/40">
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {article.readTime} min de leitura</span>
            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Por {article.author || 'Equipe Cuba & Café'}</span>
            <span>
              Publicado em {new Date(article.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              {article.updatedAt && new Date(article.updatedAt).getTime() - new Date(article.createdAt).getTime() > 86400000 &&
                ` · Atualizado em ${new Date(article.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`}
            </span>
          </div>
          {/* JSON-LD Article — citabilidade para IA e rich results */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: article.title,
                description: article.excerpt,
                image: article.cover?.startsWith('http') ? article.cover : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cubacafe.com.br'}${article.cover}`,
                datePublished: article.createdAt,
                dateModified: article.updatedAt || article.createdAt,
                inLanguage: 'pt-BR',
                author: { '@type': 'Organization', name: article.author || 'Equipe Cuba & Café', url: process.env.NEXT_PUBLIC_SITE_URL || 'https://cubacafe.com.br' },
                publisher: {
                  '@type': 'Organization',
                  name: 'Cuba & Café Tabacaria',
                  logo: { '@type': 'ImageObject', url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cubacafe.com.br'}/brand/logo.png` },
                },
                mainEntityOfPage: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cubacafe.com.br'}/#/blog/${article.slug}`,
              }),
            }}
          />
        </div>
      </div>

      {/* Capa */}
      <div className="mx-auto mt-10 max-w-4xl px-5 md:px-8">
        <div className="relative aspect-[16/8] overflow-hidden rounded-3xl border border-white/10">
          <Image src={article.cover} alt={article.title} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" priority />
        </div>
      </div>

      {/* Conteúdo */}
      <article className="mx-auto max-w-3xl px-5 py-12 md:px-8">
        {renderContent(article.content)}

        {/* CTA */}
        <div className="mt-14 rounded-3xl border border-[#c90000]/30 bg-gradient-to-br from-[#c90000]/15 to-transparent p-8 text-center">
          <p className="font-display text-3xl leading-tight md:text-4xl">
            GOSTOU? DÊ UM UP NA SUA SESSÃO.
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
            Passe na loja física do Portal Sul Shopping ou peça pelo WhatsApp —
            enviamos para todo o Brasil.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate('/catalogo')}
              className="btn-shimmer rounded-xl bg-[#c90000] px-7 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-[#e00000]"
            >
              Explorar catálogo
            </button>
            <a
              href="https://wa.me/556282633610"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/20 px-7 py-3.5 text-sm font-bold uppercase tracking-wider transition-colors hover:border-white/50"
            >
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </article>

      {/* Relacionados */}
      {related.length > 0 && (
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="font-display mb-8 text-4xl md:text-5xl">
            LEIA <span className="grad-red">TAMBÉM</span>
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((a) => (
              <article
                key={a.slug}
                onClick={() => navigate(`/blog/${a.slug}`)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#121212] transition-all hover:border-[#c90000]/50"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image src={a.cover} alt={a.title} fill sizes="33vw" className="img-zoom object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-2xl leading-tight group-hover:text-[#ff4b4b]">{a.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-white/45">{a.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
