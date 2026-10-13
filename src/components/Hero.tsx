'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { MapPin, Truck, Headphones, Store, ShoppingBag } from 'lucide-react';
import SmokeCanvas from '@/components/SmokeCanvas';
import StarRing from '@/components/StarRing';
import { navigate } from '@/lib/router';
import { storeInfo } from '@/lib/helpers';
import { getOpenStatus } from '@/lib/hours';

/** Selo discreto "Aberto agora / Fechado" — calculado no fuso de São Paulo */
function OpenBadge() {
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);
  useEffect(() => {
    const update = () => setStatus(getOpenStatus());
    const t0 = setTimeout(update, 0); // evita mismatch de hidratação
    const t = setInterval(update, 60_000);
    return () => { clearTimeout(t0); clearInterval(t); };
  }, []);
  if (!status) return <div className="mx-auto mb-5 h-7 w-40 rounded-full bg-white/5 md:mb-6" />;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6 }}
      className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-1.5 backdrop-blur-md md:mb-6"
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
            status.open ? 'bg-emerald-400' : 'bg-white/50'
          }`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            status.open ? 'bg-emerald-400' : 'bg-white/60'
          }`}
        />
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75 md:text-xs">
        {status.label}
      </span>
    </motion.div>
  );
}

const FEATURES = [
  { icon: Store, label: 'Loja física', sub: 'Portal Sul Shopping' },
  { icon: Truck, label: 'Envio nacional', sub: 'Todo o Brasil' },
  { icon: Headphones, label: 'Atendimento', sub: 'Especializado' },
  { icon: MapPin, label: 'Goiânia - GO', sub: 'Entregas locais' },
];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '38%']);
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className="noise relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-black">
      {/* Foto real da loja na camada de trás — bem sutil/opaca para não atrapalhar a leitura */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 -z-20">
        <div className="relative h-[120%] w-full">
          <Image
            src="/photos/loja-balcao.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.16]"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-transparent to-black/70" />
        </div>
      </motion.div>

      {/* Fumaça animada (assinatura da marca — densidade moderada, pausa em aba oculta) */}
      <SmokeCanvas className="absolute inset-0 -z-10 h-full w-full" density={0.9} />

      {/* Glow vermelho */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c90000]/20 blur-[140px]" />

      {/* Grid sutil */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 72px), repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 72px)',
        }}
      />

      <motion.div style={{ y: yText, opacity }} className="relative z-10 mx-auto max-w-5xl px-5 pb-24 pt-20 text-center md:px-8 md:pt-24">
        {/* Selo estrela do logo + anel giratório */}
        <div className="mb-5 md:mb-7">
          <StarRing className="mx-auto h-[76px] w-[76px] md:h-24 md:w-24" starClass="h-7 w-7 md:h-9 md:w-9" />
        </div>

        {/* Selo aberto/fechado discreto */}
        <OpenBadge />

        {/* Título único no DOM — sem camada duplicada de glow */}
        <motion.h1
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          className="font-display text-[12.5vw] leading-[0.95] sm:text-7xl md:text-8xl lg:text-[7.4rem]"
        >
          <span className="text-glow-red grad-red">O UNIVERSO SMOKE</span>
          <br />
          COMPLETO, EM UM
          <br />
          SÓ LUGAR.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-white/75 md:mt-7 md:text-xl md:leading-relaxed"
        >
          Narguiles, sedas, bongs, acessórios e as melhores marcas do mercado.
          Loja física e envio para todo o Brasil.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3.5 md:mt-10"
        >
          <button
            onClick={() => navigate('/catalogo')}
            className="btn-shimmer group relative flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#c90000] px-8 py-3.5 font-display text-xl tracking-wider transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e00000] hover:shadow-[0_8px_40px_rgba(201,0,0,0.5)] active:translate-y-0 active:scale-[0.98] sm:w-auto sm:px-9 sm:py-4 sm:text-2xl"
          >
            <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
            EXPLORAR PRODUTOS
          </button>
          <a
            href={`https://wa.me/${storeInfo.whatsApp}?text=${encodeURIComponent('Olá, Cuba & Café! Quero fazer um pedido.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/20 bg-white/5 px-8 py-3.5 font-display text-xl tracking-wider backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10 active:translate-y-0 sm:w-auto sm:px-9 sm:py-4 sm:text-2xl"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366] transition-transform group-hover:scale-110">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.03c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24s-3.7 8.24-8.24 8.24z" />
            </svg>
            PEDIR PELO WHATSAPP
          </a>
        </motion.div>

        {/* Features 2x2 compacto no mobile, 4 colunas no desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mx-auto mt-9 grid max-w-2xl grid-cols-2 gap-2.5 sm:mt-12 md:mt-14 lg:max-w-3xl lg:grid-cols-4"
        >
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="glass flex items-center gap-2.5 rounded-xl px-3 py-3 transition-colors hover:border-[#c90000]/40 lg:flex-col lg:gap-1 lg:px-2 lg:py-4 lg:text-center"
            >
              <f.icon className="h-4.5 w-4.5 shrink-0 text-[#ff4b4b] lg:mb-1 lg:h-5 lg:w-5" />
              <div className="min-w-0 text-left lg:text-center">
                <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-white/85 md:text-xs">{f.label}</p>
                <p className="truncate text-[10px] text-white/50 md:text-[11px]">{f.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex h-12 w-7 items-start justify-center rounded-full border border-white/25 p-1.5">
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="h-2.5 w-1 rounded-full bg-[#ff2d2d]"
          />
        </div>
      </motion.div>
    </section>
  );
}
