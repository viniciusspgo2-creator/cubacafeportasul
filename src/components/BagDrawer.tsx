'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, StickyNote, Sparkles, ArrowRight, Truck, Store, MapPin } from 'lucide-react';
import { useBag, fmtBRL } from '@/lib/store';
import { buildWhatsAppMessage, whatsappLink, storeInfo } from '@/lib/helpers';
import { navigate } from '@/lib/router';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';

/** Gatilhos de gancho — giram conforme a sacola muda */
const HOOKS = [
  { title: 'VOCÊ PODE GOSTAR', sub: 'Seleção da casa combinando com sua sacola' },
  { title: 'COMPRE TAMBÉM', sub: 'Quem leva isso, costuma levar junto' },
  { title: 'COMPLETA SUA SESSÃO', sub: 'Não deixe faltar nada pro momento' },
];

export default function BagDrawer() {
  const { items, open, setOpen, setQty, removeItem, setNote, clear } = useBag();
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [generalNote, setGeneralNote] = useState('');
  const [district, setDistrict] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'entrega' | 'retirada'>('entrega');
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const hook = HOOKS[items.length % HOOKS.length];

  // Sugestão do tipo de entrega a partir do bairro/cidade
  const deliveryHint = (() => {
    if (deliveryMode === 'retirada') {
      return 'Retirada na loja — Portal Sul Shopping, Goiânia. A gente separa com seu nome e avisa quando estiver pronto.';
    }
    const d = district.trim().toLowerCase();
    if (!d) return null;
    const goianiaHints = ['goiânia', 'goiania', 'jardins', 'jardim', 'kubitschek', 'portal sul', 'batel', 'campinas', 'setor', 'serrinha', 'bueno', 'oeste', 'sul', 'norte', 'leste', 'vila nova', 'azar', 'marista', 'bela vista', 'pedro ludovico', 'goiá', 'apanhueira', 'campos elíseos', 'shireen', 'santa mônida', 'santa monica', 'jacutinga', 'faiçal', 'faiscal', 'bandeiras', 'morada do sol'];
    if (goianiaHints.some((k) => d.includes(k))) {
      return 'Entrega local em Goiânia — via motoboy ou apps (Uber/99/InDrive). Valor e prazo confirmados no WhatsApp.';
    }
    return 'Envio nacional — Correios ou transportadora com código de rastreio. Confirmamos frete e prazo no WhatsApp.';
  })();

  // Sugestões inteligentes: mesmas categorias dos itens da sacola, fora os já escolhidos
  useEffect(() => {
    if (!open || items.length === 0) {
      setSuggestions([]);
      return;
    }
    const cats = Array.from(new Set(items.map((i) => i.slug.split('-')[0])));
    const inBag = new Set(items.map((i) => i.slug));
    (async () => {
      try {
        // Busca por cada categoria derivada do item + fallback com destaques
        const fetches = [
          ...items.slice(0, 2).map((i) =>
            fetch(`/api/products?search=${encodeURIComponent(i.name.split(' ')[0])}&limit=8`).then((r) => r.json()).catch(() => [])
          ),
          fetch('/api/products?featured=true&limit=8').then((r) => r.json()).catch(() => []),
        ];
        const results = await Promise.all(fetches);
        const pool: Product[] = [];
        const seen = new Set<string>();
        for (const list of results) {
          for (const p of Array.isArray(list) ? list : []) {
            if (!inBag.has(p.slug) && !seen.has(p.slug) && pool.length < 6) {
              seen.add(p.slug);
              pool.push(p);
            }
          }
        }
        setSuggestions(pool.slice(0, 6));
      } catch {
        setSuggestions([]);
      }
    })();
  }, [open, items]);

  const quickAdd = (p: Product) => {
    useBag.getState().addItem({ slug: p.slug, name: p.name, price: p.price, image: p.images[0] || '' });
    toast.success('Adicionado na sacola', { description: p.name });
  };

  const continueShopping = () => {
    setOpen(false);
    setTimeout(() => {
      if (window.location.hash === '' || window.location.hash === '#/') {
        document.getElementById('destaques')?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 350);
  };

  const finalize = async () => {
    if (!items.length) return;
    if (!clientName.trim()) {
      toast.error('Informe seu nome para continuar');
      return;
    }
    setSending(true);
    try {
      // Registra o pedido no banco (painel admin)
      const deliveryLabel = deliveryMode === 'retirada' ? 'Retirada na loja' : `Entrega: ${district.trim() || 'a combinar'}`;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          notes: [deliveryLabel, generalNote.trim(), ...items.filter((i) => i.note).map((i) => `${i.name}: ${i.note}`)].filter(Boolean).join(' | '),
          items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        }),
      });
      const order = await res.json();

      const message = buildWhatsAppMessage({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        notes: [
          deliveryMode === 'retirada' ? 'Retirada na loja (Portal Sul Shopping)' : `Bairro/cidade: ${district.trim() || 'a combinar'}`,
          generalNote.trim(),
          ...items.filter((i) => i.note).map((i) => `${i.name} → ${i.note}`),
        ].filter(Boolean).join('\n'),
        items,
      });

      window.open(whatsappLink(message), '_blank');
      toast.success(`Pedido ${order.code || ''} enviado ao WhatsApp!`, {
        description: 'Nossa equipe confirma disponibilidade em instantes.',
      });
      clear();
      setShowForm(false);
      setClientName('');
      setClientPhone('');
      setGeneralNote('');
      setOpen(false);
    } catch {
      toast.error('Erro ao registrar pedido. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-[75] flex w-full max-w-md flex-col border-l border-white/10 bg-[#0d0d0d]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-[#ff4b4b]" />
                <h2 className="font-display text-2xl tracking-wide">SUA SACOLA</h2>
                {items.length > 0 && (
                  <span className="rounded-full bg-[#c90000] px-2.5 py-0.5 text-xs font-bold">{items.length}</span>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white" aria-label="Fechar sacola">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Itens */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <ShoppingBag className="h-8 w-8 text-white/30" />
                  </div>
                  <p className="font-display text-2xl text-white/80">SACOLA VAZIA</p>
                  <p className="mt-2 max-w-[240px] text-sm text-white/40">
                    Explore o catálogo e adicione seus produtos favoritos.
                  </p>
                  <button
                    onClick={() => { setOpen(false); navigate('/catalogo'); }}
                    className="btn-shimmer mt-6 flex items-center gap-2 rounded-xl bg-[#c90000] px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#e00000]"
                  >
                    Explorar produtos <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <ul className="space-y-3">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <motion.li
                          key={item.slug}
                          layout
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0 }}
                          className="group rounded-2xl border border-white/10 bg-[#151515] p-3"
                        >
                          <div className="flex gap-3">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                              <Image src={item.image || '/photos/loja-prateleiras.webp'} alt={item.name} fill sizes="80px" className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="line-clamp-2 text-sm font-semibold leading-snug">{item.name}</h4>
                                <button
                                  onClick={() => removeItem(item.slug)}
                                  className="shrink-0 text-white/30 transition-colors hover:text-[#ff4b4b]"
                                  aria-label={`Remover ${item.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="mt-0.5 text-xs text-white/40">{fmtBRL(item.price)} cada</p>

                              <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center gap-1 rounded-lg border border-white/15 bg-black/40">
                                  <button onClick={() => setQty(item.slug, item.qty - 1)} className="flex h-8 w-8 items-center justify-center text-white/70 hover:text-white" aria-label="Diminuir">
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-bold tabular-nums">{item.qty}</span>
                                  <button onClick={() => setQty(item.slug, item.qty + 1)} className="flex h-8 w-8 items-center justify-center text-white/70 hover:text-white" aria-label="Aumentar">
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <span className="font-display text-xl text-white">{fmtBRL(item.price * item.qty)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Observação por item */}
                          <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-black/30 px-2.5 py-2">
                            <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/30" />
                            <input
                              value={item.note || ''}
                              onChange={(e) => setNote(item.slug, e.target.value)}
                              placeholder="Observação (ex: sabor, cor, presente)..."
                              className="w-full bg-transparent text-xs text-white/70 placeholder:text-white/25 focus:outline-none"
                            />
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  {/* Gancho cross-sell: VOCÊ PODE GOSTAR / COMPRE TAMBÉM */}
                  {suggestions.length > 0 && (
                    <div className="mt-7">
                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#ff4b4b]" />
                        <div>
                          <p className="font-display text-lg leading-none tracking-wide text-white">{hook.title}</p>
                          <p className="mt-1 text-[11px] text-white/40">{hook.sub}</p>
                        </div>
                      </div>
                      <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-1">
                        {suggestions.map((p) => (
                          <div
                            key={p.slug}
                            className="group w-[124px] shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 bg-[#151515] transition-colors hover:border-[#c90000]/50"
                          >
                            <button
                              onClick={() => { setOpen(false); navigate(`/produto/${p.slug}`); }}
                              className="relative block aspect-square w-full overflow-hidden"
                              aria-label={`Ver ${p.name}`}
                            >
                              <Image src={p.images[0] || '/photos/loja-prateleiras.webp'} alt={p.name} fill sizes="124px" className="img-zoom object-cover" />
                            </button>
                            <div className="p-2">
                              <button
                                onClick={() => { setOpen(false); navigate(`/produto/${p.slug}`); }}
                                className="line-clamp-2 min-h-[28px] text-left text-[11px] font-medium leading-tight text-white/80 transition-colors hover:text-white"
                              >
                                {p.name}
                              </button>
                              <div className="mt-1.5 flex items-center justify-between gap-1">
                                <span className="font-display text-sm tracking-wide text-white">{fmtBRL(p.price)}</span>
                                <button
                                  onClick={() => quickAdd(p)}
                                  className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-[#c90000] text-white transition-all hover:scale-110 hover:bg-[#e00000] active:scale-95"
                                  aria-label={`Adicionar ${p.name} na sacola`}
                                >
                                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer / checkout */}
            {items.length > 0 && (
              <div className="border-t border-white/10 bg-[#0d0d0d] px-5 py-4 pb-6">
                <AnimatePresence mode="wait">
                  {!showForm ? (
                    <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm text-white/55">Total estimado</span>
                        <span className="font-display text-3xl text-white">{fmtBRL(total)}</span>
                      </div>
                      <button
                        onClick={() => setShowForm(true)}
                        className="btn-shimmer flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] py-4 font-display text-xl tracking-wide text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(37,211,102,0.35)]"
                      >
                        <MessageCircle className="h-5 w-5" />
                        ENVIAR PEDIDO PELO WHATSAPP
                      </button>
                      <button
                        onClick={continueShopping}
                        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] py-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white/75 transition-all hover:border-[#c90000]/50 hover:bg-[#c90000]/10 hover:text-white"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Continuar comprando
                      </button>
                      <button
                        onClick={() => { clear(); toast.info('Sacola esvaziada'); }}
                        className="mt-2 w-full rounded-xl py-2 text-xs text-white/35 transition-colors hover:text-white/60"
                      >
                        Esvaziar sacola
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xl tracking-wide">SEUS DADOS</span>
                        <span className="font-display text-xl text-[#ff4b4b]">{fmtBRL(total)}</span>
                      </div>
                      <input
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Seu nome *"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm placeholder:text-white/30 focus:border-[#c90000] focus:outline-none"
                      />
                      <input
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Seu telefone (ex: (62) 9 9999-9999)"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm placeholder:text-white/30 focus:border-[#c90000] focus:outline-none"
                      />

                      {/* Tipo de entrega */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDeliveryMode('entrega')}
                          className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                            deliveryMode === 'entrega'
                              ? 'border-[#c90000] bg-[#c90000]/15 text-white'
                              : 'border-white/12 bg-white/[0.03] text-white/50 hover:text-white/80'
                          }`}
                        >
                          <Truck className="h-4 w-4" /> Entrega / Envio
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryMode('retirada')}
                          className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                            deliveryMode === 'retirada'
                              ? 'border-[#c90000] bg-[#c90000]/15 text-white'
                              : 'border-white/12 bg-white/[0.03] text-white/50 hover:text-white/80'
                          }`}
                        >
                          <Store className="h-4 w-4" /> Retirar na loja
                        </button>
                      </div>
                      {deliveryMode === 'entrega' && (
                        <input
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="Seu bairro/cidade (opcional) — ex: Jardins, Goiânia"
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm placeholder:text-white/30 focus:border-[#c90000] focus:outline-none"
                        />
                      )}
                      {deliveryHint && (
                        <p className="flex items-start gap-2 rounded-xl border border-[#c90000]/30 bg-[#c90000]/8 px-3.5 py-2.5 text-xs leading-relaxed text-white/70">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff6b6b]" />
                          {deliveryHint}
                        </p>
                      )}
                      <textarea
                        value={generalNote}
                        onChange={(e) => setGeneralNote(e.target.value)}
                        placeholder="Observações gerais do pedido (entrega, trocas, etc.)"
                        rows={2}
                        className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm placeholder:text-white/30 focus:border-[#c90000] focus:outline-none"
                      />
                      <p className="text-[11px] leading-relaxed text-white/35">
                        Ao enviar, seu pedido será registrado e abrirá o WhatsApp da loja ({storeInfo.whatsApp.replace('55', '+').replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '$1 $2 $3-$4')}) com o resumo pronto.
                      </p>
                      <button
                        onClick={finalize}
                        disabled={sending}
                        className="btn-shimmer flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] py-4 font-display text-xl tracking-wide text-black transition-all hover:-translate-y-0.5 disabled:opacity-60"
                      >
                        {sending ? 'ENVIANDO...' : (
                          <>
                            <MessageCircle className="h-5 w-5" />
                            FINALIZAR NO WHATSAPP
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowForm(false)}
                        className="w-full rounded-xl border border-white/10 py-2.5 text-xs text-white/40 transition-colors hover:text-white/70"
                      >
                        Voltar para a sacola
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
