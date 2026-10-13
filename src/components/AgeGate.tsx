'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

export default function AgeGate() {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setVerified(window.localStorage.getItem('cc-age-ok') === 'true');
    });
  }, []);

  const accept = () => {
    window.localStorage.setItem('cc-age-ok', 'true');
    setVerified(true);
  };

  const deny = () => {
    setDenied(true);
  };

  const blocked = verified === false || denied;

  return (
    <AnimatePresence>
      {verified === null || blocked ? (
        <motion.div
          key="agegate"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
        >
          {/* fundo glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/3 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c90000]/25 blur-[130px]" />
            <div className="absolute bottom-0 left-0 h-[240px] w-[240px] rounded-full bg-[#c90000]/15 blur-[100px]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 60px), repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 60px)',
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative z-10 mx-4 w-full max-w-md"
          >
            <div className="glass relative overflow-hidden rounded-2xl p-8 text-center shadow-2xl">
              {!denied ? (
                <>
                  <div className="mx-auto mb-6 w-40">
                    <Image
                      src="/brand/logo.png"
                      alt="Cuba & Café Tabacaria"
                      width={400}
                      height={303}
                      className="h-auto w-full"
                      priority
                    />
                  </div>

                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c90000]/40 bg-[#c90000]/10 px-4 py-1.5">
                    <span className="font-display text-xl text-[#ff4b4b]">+18</span>
                    <span className="text-xs tracking-wide text-white/70">CONTEÚDO RESTRITO</span>
                  </div>

                  <h1 className="font-display mb-2 text-4xl leading-none">
                    VOCÊ TEM MAIS DE <span className="text-glow-red text-[#ff2d2d]">18 ANOS</span>?
                  </h1>
                  <p className="mb-8 text-sm leading-relaxed text-white/60">
                    Ao entrar, você declara ter 18 anos ou mais.
                    Venda proibida para menores de 18 anos.
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={accept}
                      className="btn-shimmer group flex w-full items-center justify-center gap-2 rounded-xl bg-[#c90000] px-6 py-4 font-display text-xl tracking-wide transition-all duration-300 hover:bg-[#e00000] hover:shadow-[0_0_30px_rgba(201,0,0,0.5)]"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      TENHO 18 ANOS OU MAIS
                    </button>
                    <button
                      onClick={deny}
                      className="w-full rounded-xl border border-white/15 px-6 py-3.5 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white/80"
                    >
                      ✕ Sou menor de idade / Sair
                    </button>
                  </div>

                  <p className="mt-6 text-[11px] leading-relaxed text-white/40">
                    Conteúdo destinado exclusivamente a adultos.
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#c90000]/50 bg-[#c90000]/10">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ff4b4b" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M4.93 4.93l14.14 14.14" />
                    </svg>
                  </div>
                  <h1 className="font-display mb-3 text-4xl">ACESSO RESTRITO</h1>
                  <p className="mb-2 text-sm leading-relaxed text-white/60">
                    Este site é destinado exclusivamente a maiores de 18 anos.
                  </p>
                  <p className="text-sm text-white/40">
                    Volte quando completar a idade permitida. Até logo!
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
