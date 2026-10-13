'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';

export default function FeaturedCarousel({ products }: { products: Product[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    dragFree: false,
    containScroll: 'trimSnaps',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(true);
  const [canNext, setCanNext] = useState(true);
  const [isPointerDown, setIsPointerDown] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('pointerDown', () => setIsPointerDown(true));
    emblaApi.on('pointerUp', () => setIsPointerDown(false));
    queueMicrotask(onSelect);
  }, [emblaApi, onSelect]);

  // Auto-play com pausa no drag
  useEffect(() => {
    if (!emblaApi) return;
    let interval: ReturnType<typeof setInterval>;
    const start = () => {
      interval = setInterval(() => {
        if (!document.hidden && !isPointerDown) emblaApi.scrollNext();
      }, 4200);
    };
    start();
    return () => clearInterval(interval);
  }, [emblaApi, isPointerDown]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef} style={{ borderRadius: '1.5rem' }}>
        <div className="flex gap-4 px-1 py-2 md:gap-5">
          {products.map((p, i) => (
            <div
              key={p.slug}
              className="w-[72%] min-w-0 shrink-0 sm:w-[52%] md:w-[38%] lg:w-[27%] xl:w-[23%]"
            >
              <ProductCard product={p} index={i} big />
            </div>
          ))}
        </div>
      </div>

      {/* Controles */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canPrev}
        className="absolute -left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/80 text-white backdrop-blur-md transition-all hover:border-[#c90000] hover:bg-[#c90000] disabled:opacity-0 md:flex"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canNext}
        className="absolute -right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/80 text-white backdrop-blur-md transition-all hover:border-[#c90000] hover:bg-[#c90000] disabled:opacity-0 md:flex"
        aria-label="Próximo"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="mt-6 flex justify-center gap-2">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === selectedIndex ? 'w-8 bg-[#c90000]' : 'w-1.5 bg-white/25 hover:bg-white/50'
            }`}
            aria-label={`Ir para slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
