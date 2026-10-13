'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, MessageCircle, X, Plus } from 'lucide-react';
import { storeInfo } from '@/lib/helpers';
import { useBag, useUI } from '@/lib/store';

/**
 * Dock flutuante unificado — UM botão que expande em 2 opções:
 * "Falar no WhatsApp" e "Assistente IA".
 * Fica acima da barra inferior mobile, respeita safe-area do iPhone
 * e se esconde quando a sacola está aberta.
 */
export default function FloatingDock() {
  const [expanded, setExpanded] = useState(false);
  const bagOpen = useBag((s) => s.open);
  const setChatOpen = useUI((s) => s.setChatOpen);
  const chatOpen = useUI((s) => s.chatOpen);
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!expanded) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setExpanded(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [expanded]);

  if (bagOpen) return null;

  return (
    <div
      ref={ref}
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 4.75rem)' }}
      className="fixed right-4 z-[58] flex flex-col items-end gap-2.5 md:bottom-7 md:right-7"
    >
      {/* Opções expandidas */}
      <AnimatePresence>
        {expanded && (
          <>
            <motion.button
              key="wa"
              initial={{ opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ delay: 0.03 }}
              onClick={() => {
                setExpanded(false);
                window.open(
                  `https://wa.me/${storeInfo.whatsApp}?text=${encodeURIComponent('Olá, Cuba & Café Tabacaria! Vim pelo site.')}`,
                  '_blank'
                );
              }}
              className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-[#25D366]/40 bg-[#0d0d0d]/95 py-2 pl-2 pr-4 shadow-xl shadow-black/50 backdrop-blur-xl transition-colors hover:border-[#25D366]"
              aria-label="Falar no WhatsApp"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366] text-black">
                <MessageCircle className="h-5 w-5" />
              </span>
              <span className="text-left">
                <span className="block text-[13px] font-bold text-white">Falar no WhatsApp</span>
                <span className="block text-[11px] text-white/45">Resposta em minutos</span>
              </span>
            </motion.button>

            <motion.button
              key="ai"
              initial={{ opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ delay: 0.08 }}
              onClick={() => {
                setExpanded(false);
                setChatOpen(true);
              }}
              className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-[#c90000]/40 bg-[#0d0d0d]/95 py-2 pl-2 pr-4 shadow-xl shadow-black/50 backdrop-blur-xl transition-colors hover:border-[#c90000]"
              aria-label="Abrir assistente IA"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c90000] text-white">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-left">
                <span className="block text-[13px] font-bold text-white">Assistente IA</span>
                <span className="block text-[11px] text-white/45">Indico o produto certo</span>
              </span>
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Botão principal */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', damping: 14 }}
        onClick={() => setExpanded((v) => !v)}
        whileTap={{ scale: 0.92 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-[#e00000] to-[#a50000] text-white shadow-xl shadow-[#c90000]/40"
        aria-label={expanded ? 'Fechar opções de contato' : 'Opções de contato'}
        aria-expanded={expanded}
      >
        <span className={`absolute inset-0 rounded-full ${chatOpen || expanded ? '' : 'animate-pulse-red'}`} />
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="plus" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Plus className="h-7 w-7" strokeWidth={2.2} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
