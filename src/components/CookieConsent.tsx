'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState<'privacidade' | 'termos' | 'dados' | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.localStorage.getItem('cc-cookies-ok') !== 'true' && window.localStorage.getItem('cc-age-ok') === 'true') {
        setShow(true);
      }
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const accept = () => {
    window.localStorage.setItem('cc-cookies-ok', 'true');
    setShow(false);
  };

  const texts: Record<string, { title: string; body: string }> = {
    privacidade: {
      title: 'Política de Privacidade',
      body: 'Coletamos apenas dados essenciais para funcionamento do site: confirmação de idade, preferências de cookies e itens adicionados à sacola. Seu nome e telefone são usados exclusivamente para processar o pedido enviado ao WhatsApp da loja. Não vendemos, alugamos ou compartilhamos seus dados com terceiros. Você pode solicitar exclusão dos seus dados a qualquer momento pelo WhatsApp (62) 8263-3610.',
    },
    termos: {
      title: 'Termos de Uso',
      body: 'Este site é destinado exclusivamente a maiores de 18 anos. O uso do catálogo digital é gratuito. Pedidos são finalizados via WhatsApp, sujeitos à confirmação de disponibilidade pela loja. Preços e estoque podem variar sem aviso prévio. Imagens meramente ilustrativas. Venda, entrega e consumo de produtos de tabaco são regulados pela Lei nº 10.674/2003 e Lei nº 12.527/2011 (LAI).',
    },
    dados: {
      title: 'Política de Dados',
      body: 'Utilizamos cookies funcionais para lembrar sua confirmação de idade e o estado da sacola de compras, além de métricas anônimas de navegação (visitas e produtos mais visualizados) para melhorar a experiência. Nenhum dado sensível é armazenado em servidores externos. Os dados de pedidos ficam retidos pelo tempo necessário para atendimento e obrigações legais.',
    },
  };

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-xl md:bottom-6 md:left-6 md:right-auto"
          >
            <div className="glass rounded-2xl p-5 shadow-2xl shadow-black/60">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#c90000]/20">
                  <Cookie className="h-5 w-5 text-[#ff4b4b]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">Usamos cookies</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/55">
                    Utilizamos cookies para melhorar sua experiência, lembrar sua sacola e métricas anônimas.{' '}
                    <button
                      onClick={() => setExpanded('privacidade')}
                      className="text-[#ff4b4b] underline underline-offset-2 hover:text-[#ff6b6b]"
                    >
                      Saiba mais
                    </button>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={accept}
                      className="btn-shimmer rounded-lg bg-[#c90000] px-5 py-2 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-[#e00000]"
                    >
                      ACEITAR COOKIES
                    </button>
                    <button
                      onClick={() => setExpanded('dados')}
                      className="rounded-lg border border-white/15 px-4 py-2 text-xs text-white/60 transition-colors hover:text-white"
                    >
                      Política de dados
                    </button>
                    <button
                      onClick={() => setExpanded('termos')}
                      className="rounded-lg border border-white/15 px-4 py-2 text-xs text-white/60 transition-colors hover:text-white"
                    >
                      Termos de uso
                    </button>
                  </div>
                </div>
                <button
                  onClick={accept}
                  className="ml-auto shrink-0 text-white/40 transition-colors hover:text-white"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de política expandida */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setExpanded(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#151515] p-7"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-2xl">{texts[expanded].title}</h3>
                <button onClick={() => setExpanded(null)} className="text-white/50 hover:text-white" aria-label="Fechar">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-white/65">{texts[expanded].body}</p>
              <p className="mt-4 text-xs text-white/35">Última atualização: Janeiro 2026</p>
              <button
                onClick={() => { window.localStorage.setItem('cc-cookies-ok', 'true'); setExpanded(null); setShow(false); }}
                className="btn-shimmer mt-6 w-full rounded-xl bg-[#c90000] py-3 text-sm font-semibold tracking-wide hover:bg-[#e00000]"
              >
                ENTENDI E ACEITO
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
