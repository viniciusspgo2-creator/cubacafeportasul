'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X, Send } from 'lucide-react';
import { fmtBRL, useBag, useUI } from '@/lib/store';
import { navigate } from '@/lib/router';
import { storeInfo } from '@/lib/helpers';

interface ChatProduct {
  slug: string; name: string; price: number; image: string; category: string;
}
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  products?: ChatProduct[];
}

const SUGGESTIONS = ['Qual narguilé vocês recomendam pra iniciante?', 'Tem essência da FM?', 'Como funciona a entrega?', 'Sugestão de presente'];

export default function ChatBot() {
  // Estado controlado pelo FloatingDock (useUI store)
  const open = useUI((s) => s.chatOpen);
  const setOpen = useUI((s) => s.setChatOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'E aí! Sou o Cuba, assistente da Cuba & Café 🔥\n\nPosso te ajudar a achar o produto perfeito, tirar dúvidas sobre narguilé, sedas, essências... O que você procura?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bagOpen = useBag((s) => s.open);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: message }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: messages.slice(-6),
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.reply || data.error, products: data.products }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Ops, deu ruim na conexão. Chama no WhatsApp ' + storeInfo.whatsApp + ' que respondemos rapidinho!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Janela do chat — aberta pelo FloatingDock, acima da barra inferior mobile */}
      <AnimatePresence>
        {open && !bagOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            style={{ bottom: 'calc(env(safe-area-inset-bottom) + 4.75rem)' }}
            className="fixed right-4 z-[60] flex h-[min(540px,70dvh)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-white/12 bg-[#0d0d0d] shadow-2xl md:bottom-28 md:right-7"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[#c90000]/20 to-transparent px-4 py-3.5">
              <Image src="/brand/logo.png" alt="Cuba" width={40} height={30} className="h-8 w-auto" />
              <div className="flex-1">
                <p className="text-sm font-bold">Cuba — Assistente IA</p>
                <p className="flex items-center gap-1.5 text-[11px] text-white/45">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online agora
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white" aria-label="Fechar">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mensagens */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-br-sm bg-[#c90000] text-white'
                        : 'rounded-bl-sm border border-white/10 bg-[#1a1a1a] text-white/85'
                    }`}
                  >
                    {msg.content}

                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.products.map((p) => (
                          <button
                            key={p.slug}
                            onClick={() => { setOpen(false); navigate(`/produto/${p.slug}`); }}
                            className="flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-black/40 p-2 text-left transition-all hover:border-[#c90000]/60"
                          >
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                              <Image src={p.image || '/photos/loja-prateleiras.webp'} alt={p.name} fill sizes="44px" className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold">{p.name}</p>
                              <p className="font-display text-base text-[#ff6b6b]">{fmtBRL(p.price)}</p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Ver →</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-[#1a1a1a] px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                        className="h-1.5 w-1.5 rounded-full bg-[#ff4b4b]"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sugestões */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[11px] text-white/60 transition-colors hover:border-[#c90000]/50 hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-center gap-2 border-t border-white/10 px-3 py-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre produtos, entrega..."
                className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm placeholder:text-white/30 focus:border-[#c90000]/60 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c90000] text-white transition-all hover:bg-[#e00000] disabled:opacity-40"
                aria-label="Enviar mensagem"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
