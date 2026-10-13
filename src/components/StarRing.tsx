'use client';

import { motion } from 'framer-motion';
import { useId } from 'react';

/**
 * Estrela 5 pontas do logotipo + anel de texto giratório.
 * - textLength explícito = distribuição uniforme das letras (corrige o "buraco" do anel antigo)
 * - Estrela centralizada por flex (sem conflito de transform com a animação de pulso)
 * - Usado no Hero e no Footer
 */
export function LogoStar({ className = '', fill = '#ed1c24' }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={fill} aria-hidden="true">
      <path d="M12 1.7l3.02 6.42 7.08.9-5.22 4.88 1.36 7.02L12 17.44l-6.24 3.48 1.36-7.02L1.9 9.02l7.08-.9L12 1.7z" />
    </svg>
  );
}

export default function StarRing({
  className = 'h-20 w-20 md:h-24 md:w-24',
  text = 'CUBA & CAFÉ • TABACARIA • DESDE 2021 • ',
  starClass = 'h-8 w-8 md:h-10 md:w-10',
  spinSeconds = 18,
  glow = true,
}: {
  className?: string;
  text?: string;
  starClass?: string;
  spinSeconds?: number;
  glow?: boolean;
}) {
  // r=41 dentro de viewBox 100 → circunferência ≈ 257.6
  const C = (2 * Math.PI * 41).toFixed(1);
  // useId = estável entre SSR e client (contador module-level causava mismatch de hidratação)
  const rawId = useId();
  const pathId = `starring${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: 0.15, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      className={`relative flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      {/* Anel giratório */}
      <svg
        viewBox="0 0 100 100"
        className="animate-spin-slow absolute inset-0 h-full w-full"
        style={{ animationDuration: `${spinSeconds}s` }}
      >
        <defs>
          <path id={pathId} d="M 50,50 m -41,0 a 41,41 0 1,1 82,0 a 41,41 0 1,1 -82,0" />
        </defs>
        <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.6" />
        <text
          className="fill-white/60"
          style={{ fontSize: '9.6px', fontWeight: 600, letterSpacing: '0.8px', fontFamily: 'var(--font-body)' }}
        >
          <textPath href={`#${pathId}`} textLength={C} lengthAdjust="spacingAndGlyphs">
            {text}
          </textPath>
        </text>
      </svg>

      {/* Halo glow */}
      {glow && (
        <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ed1c24]/40 blur-xl" />
      )}

      {/* Estrela do logotipo com pulso — wrapper flex evita conflito transform/scale */}
      <div className="absolute inset-0 flex items-center justify-center">
        <LogoStar className={`animate-star-pulse ${starClass}`} />
      </div>
    </motion.div>
  );
}
