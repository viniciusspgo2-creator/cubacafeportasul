'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, MessageCircle, ChevronLeft, ChevronRight, ZoomIn,
  Truck, Store, BadgeCheck, Flame, X,
} from 'lucide-react';
import { useBag, fmtBRL } from '@/lib/store';
import { navigate } from '@/lib/router';
import { buildWhatsAppMessage, whatsappLink, storeInfo } from '@/lib/helpers';
import { getBrand, getInstallments, installmentLabel, getPromoDeal } from '@/lib/product-display';
import ProductCard from '@/components/ProductCard';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';

export default function ProductView({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setImgIdx(0);
      setQty(1);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) throw new Error('not found');
        const data: Product = await res.json();
        if (cancelled) return;
        setProduct(data);
        fetch(`/api/products?category=${encodeURIComponent(data.category)}&limit=5`)
          .then((r) => r.json())
          .then((list: Product[]) => { if (!cancelled) setRelated(list.filter((p) => p.slug !== slug).slice(0, 4)); })
          .catch(() => null);
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: `/produto/${slug}`, action: 'product_view' }),
        }).catch(() => null);
      } catch {
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const nextImg = useCallback(() => {
    if (!product) return;
    setImgIdx((i) => (i + 1) % Math.max(product.images.length, 1));
  }, [product]);
  const prevImg = useCallback(() => {
    if (!product) return;
    setImgIdx((i) => (i - 1 + Math.max(product.images.length, 1)) % Math.max(product.images.length, 1));
  }, [product]);

  if (loading) {
    return (
      <div className="grid min-h-screen grid-cols-1 gap-8 bg-black px-5 pb-24 pt-32 md:grid-cols-2 md:px-10">
        <div className="aspect-square animate-pulse rounded-3xl bg-[#151515]" />
        <div className="space-y-5 pt-4">
          <div className="h-10 w-3/4 animate-pulse rounded-xl bg-[#151515]" />
          <div className="h-6 w-1/3 animate-pulse rounded-xl bg-[#151515]" />
          <div className="h-32 w-full animate-pulse rounded-xl bg-[#151515]" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-5 text-center">
        <Flame className="mb-5 h-14 w-14 text-[#c90000]" />
        <h1 className="font-display text-4xl">PRODUTO NÃO ENCONTRADO</h1>
        <p className="mt-3 max-w-sm text-sm text-white/50">
          Esse produto pode ter saído do catálogo. Confira o restante — temos novidades toda semana.
        </p>
        <button
          onClick={() => navigate('/catalogo')}
          className="btn-shimmer mt-8 rounded-xl bg-[#c90000] px-8 py-3.5 font-bold uppercase tracking-wider hover:bg-[#e00000]"
        >
          Ir para o catálogo
        </button>
      </div>
    );
  }

  const images = product.images.length ? product.images : ['/photos/loja-prateleiras.webp'];
  const specs = product.specs || {};
  const inst = getInstallments(product);
  const promo = getPromoDeal(product);
  const brand = getBrand(product);
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* JSON-LD Product — rich results + citabilidade para IAs (GEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description || product.longDesc || product.name,
            image: (images.length ? images : ['/photos/loja-prateleiras.webp']).map(
              (img) => (img.startsWith('http') ? img : `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://cubacafe.com.br').replace(/\/$/, '')}${img}`)
            ),
            sku: product.slug,
            category: product.category,
            brand: brand ? { '@type': 'Brand', name: brand } : { '@type': 'Brand', name: 'Cuba & Café' },
            offers: {
              '@type': 'Offer',
              url: `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://cubacafe.com.br').replace(/\/$/, '')}/#/produto/${product.slug}`,
              priceCurrency: 'BRL',
              price: product.price.toFixed(2),
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              itemCondition: 'https://schema.org/NewCondition',
              seller: { '@type': 'Organization', name: 'Cuba & Café Tabacaria' },
              areaServed: 'BR',
            },
          }),
        }}
      />
      <div className="mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-28">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-white/40" aria-label="Trilha">
          <button onClick={() => navigate('/')} className="hover:text-white">Home</button>
          <span>/</span>
          <button onClick={() => navigate(`/categoria/${product.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`)} className="hover:text-white">
            {product.category}
          </button>
          <span>/</span>
          <span className="truncate text-white/70">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Galeria */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <div className="group relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-[#121212]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={imgIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[imgIdx]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded-lg bg-[#c90000] px-3 py-1.5 font-display text-lg tracking-wider text-white">
                  -{discount}% OFF
                </span>
              )}

              {/* Zoom */}
              <button
                onClick={() => setZoomOpen(true)}
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-black/60 text-white/80 backdrop-blur-md transition-all hover:bg-black/80"
                aria-label="Ampliar imagem"
              >
                <ZoomIn className="h-5 w-5" />
              </button>

              {images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white opacity-0 backdrop-blur-md transition-all hover:bg-black/85 group-hover:opacity-100" aria-label="Anterior">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextImg} className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white opacity-0 backdrop-blur-md transition-all hover:bg-black/85 group-hover:opacity-100" aria-label="Próxima">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-6 gap-2.5">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                      i === imgIdx ? 'border-[#c90000]' : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`Imagem ${i + 1}`}
                  >
                    <Image src={img} alt={`${product.name} — foto ${i + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Informações */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {brand && (
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff6b6b]">{brand}</span>
              )}
              <span className="rounded-md border border-[#c90000]/40 bg-[#c90000]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#ff6b6b]">
                {product.category}
              </span>
              {product.isNew && (
                <span className="rounded-md bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-black">Novo</span>
              )}
              {product.stock > 0 ? (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <BadgeCheck className="h-3.5 w-3.5" /> Disponível ({product.stock} em estoque)
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-white/40">Sob consulta</span>
              )}
            </div>

            <h1 className="font-display text-4xl leading-[0.95] md:text-6xl">{product.name.toUpperCase()}</h1>

            <p className="mt-4 text-[15px] leading-relaxed text-white/60">{product.description}</p>

            {/* Preço */}
            <div className="mt-7 flex flex-wrap items-end gap-3">
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="pb-1.5 text-lg text-white/35 line-through">{fmtBRL(product.oldPrice)}</span>
              )}
              <span className="font-display text-6xl leading-none text-white">{fmtBRL(product.price)}</span>
              {inst && (
                <span className="pb-1.5 text-sm font-medium text-emerald-400/90">
                  ou {installmentLabel(inst)}
                </span>
              )}
            </div>

            {/* Promoção R$ por R$ */}
            {promo && (
              <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#ffb400]/30 bg-[#ffb400]/10 px-4 py-3 text-sm font-semibold leading-relaxed text-[#ffcf60]">
                <Flame className="mt-0.5 h-4 w-4 shrink-0" />
                {promo}
              </p>
            )}

            {/* Quantidade + Ações */}
            <div className="mt-7 space-y-3">
              {/* Stepper — compacto, acima dos botões no mobile */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Quantidade</span>
                <div className="flex items-center gap-1 rounded-xl border border-white/12 bg-white/5 px-1">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center text-white/60 transition-colors hover:text-white" aria-label="Diminuir quantidade">−</button>
                  <span className="w-7 text-center text-sm font-bold tabular-nums">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(99, q + 1))} className="flex h-9 w-9 items-center justify-center text-white/60 transition-colors hover:text-white" aria-label="Aumentar quantidade">+</button>
                </div>
              </div>
              <button
                onClick={() => {
                  useBag.getState().addItem(
                    { slug: product.slug, name: product.name, price: product.price, image: images[0] },
                    qty
                  );
                  useBag.getState().setOpen(true);
                  toast.success('Adicionado na sacola', { description: `${qty}x ${product.name}` });
                }}
                className="btn-shimmer group flex w-full items-center justify-center gap-2 rounded-xl bg-[#c90000] py-3.5 font-display text-lg tracking-[0.08em] transition-all hover:-translate-y-0.5 hover:bg-[#e00000] hover:shadow-[0_8px_36px_rgba(201,0,0,0.45)] active:translate-y-0 md:rounded-2xl md:py-4 md:text-xl"
              >
                <ShoppingBag className="h-[18px] w-[18px] transition-transform group-hover:scale-110 md:h-5 md:w-5" />
                ADICIONAR À SACOLA
                <span className="ml-1 hidden text-white/60 sm:inline">·</span>
                <span className="hidden text-white/90 sm:inline">{fmtBRL(product.price * qty)}</span>
              </button>
              <a
                href={whatsappLink(
                  buildWhatsAppMessage({
                    clientName: '', clientPhone: '',
                    notes: `Produto da página: ${product.name} (${qty}x)`,
                    items: [{ name: product.name, qty, price: product.price }],
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#25D366]/45 bg-[#25D366]/10 py-3.5 font-display text-lg tracking-[0.08em] text-[#4ae386] transition-all hover:-translate-y-0.5 hover:bg-[#25D366]/20 md:rounded-2xl md:py-4 md:text-xl"
              >
                <MessageCircle className="h-[18px] w-[18px] md:h-5 md:w-5" /> COMPRAR PELO WHATSAPP
              </a>
            </div>

            {/* Selos */}
            <div className="mt-8 grid grid-cols-3 gap-2.5">
              {[
                { icon: Truck, t: 'Envio nacional', s: 'Todo o Brasil' },
                { icon: Store, t: 'Retire na loja', s: 'Portal Sul Shopping' },
                { icon: BadgeCheck, t: 'Original', s: 'Garantido' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3.5 text-center">
                  <b.icon className="mb-1 h-5 w-5 text-[#ff4b4b]" />
                  <span className="text-[11px] font-bold uppercase tracking-wide text-white/80">{b.t}</span>
                  <span className="text-[10px] text-white/40">{b.s}</span>
                </div>
              ))}
            </div>

            {/* Descrição longa */}
            {product.longDesc && (
              <div className="mt-8 border-t border-white/10 pt-7">
                <h2 className="font-display text-2xl tracking-wide text-white/90">SOBRE O PRODUTO</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{product.longDesc}</p>
              </div>
            )}

            {/* Características — oculta chaves internas (parcelas/juros/promocao são metadados de venda) */}
            {Object.entries(specs).filter(([k]) => !['parcelas', 'juros', 'promocao'].includes(k)).length > 0 && (
              <div className="mt-7 border-t border-white/10 pt-7">
                <h2 className="font-display text-2xl tracking-wide text-white/90">CARACTERÍSTICAS</h2>
                <dl className="mt-4 grid gap-2.5">
                  {Object.entries(specs).filter(([k]) => !['parcelas', 'juros', 'promocao'].includes(k)).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5">
                      <dt className="text-sm text-white/50">{k}</dt>
                      <dd className="text-sm font-semibold text-white/90">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <span key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-white/45">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Relacionados */}
        {related.length > 0 && (
          <div className="mt-24">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-display text-4xl md:text-5xl">
                COMBINA <span className="grad-red">COM ISSO</span>
              </h2>
              <button
                onClick={() => navigate(`/categoria/${product.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`)}
                className="text-sm font-semibold uppercase tracking-wider text-[#ff4b4b] hover:text-[#ff7b7b]"
              >
                Ver categoria →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {related.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Zoom */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
            onClick={() => setZoomOpen(false)}
          >
            <button className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white" aria-label="Fechar zoom">
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative h-[82vh] w-full max-w-3xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={images[imgIdx]} alt={product.name} fill sizes="90vw" className="object-contain" />
              {images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white" aria-label="Anterior">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white" aria-label="Próxima">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
