'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Eye, BadgePercent } from 'lucide-react';
import { useBag, fmtBRL } from '@/lib/store';
import { navigate } from '@/lib/router';
import { toast } from 'sonner';
import { getBrand, getInstallments, installmentLabel, getPromoDeal } from '@/lib/product-display';
import QuickView from '@/components/QuickView';
import type { Product } from '@/lib/types';

export default function ProductCard({
  product,
  index = 0,
  big = false,
}: {
  product: Product;
  index?: number;
  big?: boolean;
}) {
  const [quickView, setQuickView] = useState(false);
  const addItem = useBag((s) => s.addItem);

  const brand = getBrand(product);
  const inst = getInstallments(product);
  const promo = getPromoDeal(product);
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  const add = () => {
    addItem({ slug: product.slug, name: product.name, price: product.price, image: product.images[0] || '' });
    toast.success('Adicionado na sacola', { description: product.name });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, delay: (index % 4) * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
        className="h-full"
      >
        <div
          className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121212] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_44px_rgba(0,0,0,0.5)]"
          onClick={() => navigate(`/produto/${product.slug}`)}
        >
          {/* Imagem */}
          <div className={`relative overflow-hidden ${big ? 'aspect-[4/5]' : 'aspect-square'}`}>
            <Image
              src={product.images[0] || '/photos/loja-prateleiras.webp'}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 300px"
              className="img-zoom object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />

            {/* Badges */}
            <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5 md:left-3 md:top-3">
              {product.isNew && (
                <span className="rounded-md bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black md:py-1 md:text-[10px]">
                  Novo
                </span>
              )}
              {product.featured && (
                <span className="rounded-md bg-[#c90000] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white md:py-1 md:text-[10px]">
                  Mais pedido
                </span>
              )}
              {discount > 0 && (
                <span className="rounded-md bg-black/85 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#ff6b6b] backdrop-blur-sm md:py-1 md:text-[10px]">
                  -{discount}%
                </span>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <span className="rounded-md bg-black/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/85 backdrop-blur-sm md:py-1 md:text-[10px]">
                  Últimas {product.stock}
                </span>
              )}
            </div>

            {/* Ações flutuantes */}
            <div className="absolute bottom-2.5 right-2.5 flex gap-1.5 md:bottom-3 md:right-3">
              <button
                onClick={(e) => { e.stopPropagation(); setQuickView(true); }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-black/70 text-white/85 shadow-lg shadow-black/40 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:text-white active:scale-95 md:h-10 md:w-10 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
                aria-label={`Visualização rápida de ${product.name}`}
              >
                <Eye className="h-4 w-4 md:h-4.5 md:w-4.5" strokeWidth={2.2} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); add(); }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c90000] text-white shadow-lg shadow-black/40 transition-all duration-300 hover:scale-110 hover:bg-[#e00000] active:scale-95 md:h-10 md:w-10 md:translate-y-2 md:group-hover:translate-y-0"
                aria-label={`Adicionar ${product.name} na sacola`}
              >
                <Plus className="h-4.5 w-4.5 md:h-5 md:w-5" strokeWidth={2.5} />
              </button>
            </div>

            {/* Categoria */}
            <span className="absolute bottom-2.5 left-2.5 rounded-md border border-white/15 bg-black/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm md:bottom-3 md:left-3 md:px-2.5 md:py-1 md:text-[10px]">
              {product.category}
            </span>
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-1 p-3 md:gap-1.5 md:p-4">
            {brand && (
              <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#ff6b6b]/90 md:text-[10px]">
                {brand}
              </span>
            )}
            <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-white transition-colors group-hover:text-[#ff4b4b] md:text-[15px]">
              {product.name}
            </h3>
            <div className="mt-auto pt-2 md:pt-2.5">
              <div className="flex items-end justify-between gap-2">
                <div>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="mr-1.5 text-[10px] text-white/35 line-through md:text-xs">{fmtBRL(product.oldPrice)}</span>
                  )}
                  <span className="font-display text-lg tracking-wide text-white md:text-2xl">{fmtBRL(product.price)}</span>
                </div>
                <span className="hidden pb-1 text-[11px] font-medium text-[#ff4b4b] opacity-0 transition-opacity group-hover:opacity-100 md:inline">
                  Ver detalhes →
                </span>
              </div>
              {inst && (
                <p className="mt-0.5 text-[10px] font-medium text-white/45 md:text-[11px]">
                  {installmentLabel(inst)}
                </p>
              )}
              {promo && (
                <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#ffcf60] md:text-[11px]">
                  <BadgePercent className="h-3 w-3 shrink-0" />
                  <span className="line-clamp-1">{promo}</span>
                </p>
              )}
            </div>
          </div>

          {/* Glow hover */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ boxShadow: 'inset 0 0 0 1px rgba(201,0,0,0.5), 0 0 34px rgba(201,0,0,0.22)' }} />
        </div>
      </motion.div>

      {/* Visualização rápida */}
      <QuickView product={quickView ? product : null} onClose={() => setQuickView(false)} />
    </>
  );
}
