'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X, ShoppingBag, Minus, Plus, ArrowRight, BadgePercent } from 'lucide-react';
import { useBag, fmtBRL } from '@/lib/store';
import { navigate } from '@/lib/router';
import { toast } from 'sonner';
import { getBrand, getInstallments, installmentLabel, getPromoDeal } from '@/lib/product-display';
import type { Product } from '@/lib/types';

/**
 * Visualização rápida — bottom-sheet no mobile, modal centralizado no desktop.
 * Galeria, marca, descrição, especificações, parcelamento, promoção e compra rápida.
 */
export default function QuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);

  // Ajuste de estado durante render (padrão recomendado) — reseta ao trocar de produto
  const [prevSlug, setPrevSlug] = useState<string | null>(null);
  if (product && product.slug !== prevSlug) {
    setPrevSlug(product.slug);
    setImgIdx(0);
    setQty(1);
  }

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  const images = product?.images?.length ? product.images : ['/photos/loja-prateleiras.webp'];
  const brand = product ? getBrand(product) : null;
  const inst = product ? getInstallments(product) : null;
  const promo = product ? getPromoDeal(product) : null;
  const specs = product?.specs
    ? Object.entries(product.specs).filter(([k, v]) => v && !['parcelas', 'juros', 'promocao'].includes(k))
    : [];

  const addToBag = () => {
    if (!product) return;
    useBag.getState().addItem(
      { slug: product.slug, name: product.name, price: product.price, image: images[0] },
      qty
    );
    toast.success('Adicionado na sacola', { description: `${qty}x ${product.name}` });
    onClose();
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[88] bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-x-0 bottom-0 z-[90] flex justify-center md:inset-0 md:items-center md:p-6">
            <motion.div
              initial={{ y: '100%', opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.4 }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Visualização rápida: ${product.name}`}
              className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-white/12 bg-[#111] md:rounded-3xl"
            >
              {/* Alça do bottom-sheet */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#111]/95 px-5 py-3 backdrop-blur-md">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Visualização rápida
                </span>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 text-white/60 hover:text-white"
                  aria-label="Fechar visualização rápida"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="grid gap-6 p-5 md:grid-cols-2 md:p-7">
                {/* Galeria */}
                <div>
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10">
                    <Image
                      src={images[imgIdx]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 92vw, 340px"
                      className="object-cover"
                      priority
                    />
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="absolute left-3 top-3 rounded-lg bg-[#c90000] px-2.5 py-1 text-xs font-bold text-white">
                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                      </span>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                            i === imgIdx ? 'border-[#c90000]' : 'border-white/10 opacity-60 hover:opacity-100'
                          }`}
                          aria-label={`Imagem ${i + 1}`}
                        >
                          <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col">
                  {brand && (
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff4b4b]">{brand}</span>
                  )}
                  <h3 className="mt-1 font-display text-3xl leading-[0.95] md:text-4xl">{product.name.toUpperCase()}</h3>

                  <div className="mt-3 flex flex-wrap items-baseline gap-2.5">
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="text-sm text-white/35 line-through">{fmtBRL(product.oldPrice)}</span>
                    )}
                    <span className="font-display text-4xl text-white">{fmtBRL(product.price)}</span>
                  </div>
                  {inst && (
                    <p className="mt-1 text-xs font-medium text-emerald-400/90">{installmentLabel(inst)}</p>
                  )}
                  {promo && (
                    <p className="mt-2.5 flex items-start gap-2 rounded-xl border border-[#ffb400]/25 bg-[#ffb400]/8 px-3.5 py-2.5 text-xs font-semibold leading-relaxed text-[#ffcf60]">
                      <BadgePercent className="mt-0.5 h-4 w-4 shrink-0" />
                      {promo}
                    </p>
                  )}

                  <p className="mt-4 text-sm leading-relaxed text-white/60">{product.description}</p>

                  {specs.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {specs.map(([k, v]) => (
                        <span key={k} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/60">
                          <span className="font-semibold text-white/80">{k}:</span> {v}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quantidade + Ações */}
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex items-center gap-1 rounded-xl border border-white/12 bg-white/5 px-1">
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center text-white/60 hover:text-white" aria-label="Diminuir quantidade">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold tabular-nums">{qty}</span>
                      <button onClick={() => setQty((q) => Math.min(99, q + 1))} className="flex h-9 w-9 items-center justify-center text-white/60 hover:text-white" aria-label="Aumentar quantidade">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={addToBag}
                      className="btn-shimmer flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#c90000] font-display text-lg tracking-wider transition-all hover:bg-[#e00000] active:scale-[0.98]"
                    >
                      <ShoppingBag className="h-4.5 w-4.5" />
                      ADICIONAR · {fmtBRL(product.price * qty)}
                    </button>
                  </div>

                  <button
                    onClick={() => { onClose(); navigate(`/produto/${product.slug}`); }}
                    className="group mt-3.5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-white/15 text-xs font-bold uppercase tracking-[0.16em] text-white/65 transition-all hover:border-white/40 hover:text-white"
                  >
                    Ver página completa
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
