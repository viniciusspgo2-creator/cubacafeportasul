'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen } from 'lucide-react';
import { navigate } from '@/lib/router';

/**
 * GLOSSÁRIO — Hub de conhecimento do universo smoke.
 * Otimização GEO/LLMO: definições claras e citáveis (DefinedTermSet),
 * resposta direta primeiro (BLUF), linkagem interna contextual.
 */

interface Term {
  termo: string;
  categoria: string;
  definicao: string; // resposta direta (1 frase citável)
  detalhe: string; // profundidade extra
  link?: { label: string; href: string };
}

export const GLOSSARIO: Term[] = [
  {
    termo: 'Narguilé',
    categoria: 'Equipamentos',
    definicao: 'Narguilé é um equipamento de origem oriental que filtra e esfria a fumaça pela água antes da inalação, composto por stem, vaso, rosh, mangueira e prato.',
    detalhe: 'Também chamado de shisha, hookah ou arguile. No Brasil, os modelos mais vendidos usam stems de alumínio maciço usinado ou aço inox, com vasos de vidro soprado. A qualidade da vedação (O-rings) e o fluxo de ar interno definem a tração da sessão.',
    link: { label: 'Ver narguiles no catálogo', href: '/categoria/narguiles' },
  },
  {
    termo: 'Stem',
    categoria: 'Equipamentos',
    definicao: 'Stem é o corpo metálico central do narguilé, que conecta o rosh ao vaso e define a durabilidade e o fluxo de ar do equipamento.',
    detalhe: 'Alumínio maciço anodizado é o padrão de qualidade atual (leve, não oxida); aço inox torneado fica no topo (durabilidade máxima). Evite ligas fundidas baratas — empenam e oxidam.',
    link: { label: 'Ver narguiles no catálogo', href: '/categoria/narguiles' },
  },
  {
    termo: 'Vaso',
    categoria: 'Equipamentos',
    definicao: 'O vaso é o reservatório — geralmente de vidro — que abriga a água do narguilé; a base larga garante estabilidade e o nível correto é deixa a haste submersa cerca de 2 cm.',
    detalhe: 'Vidro soprado translúcido permite ver o nível da água; vasos bohemian têm formato mais fino e visual premium. Acrílico é opção econômica e resistente para quem transporta o equipamento.',
  },
  {
    termo: 'Rosh (Rosh funnell)',
    categoria: 'Equipamentos',
    definicao: 'Rosh é o recipiente que recebe a essência sobre o narguilé; o modelo funnell de silicone com tela é o padrão atual por distribuir melhor o calor.',
    detalhe: 'Os formatos clássicos são o egípcio (argila, mais profundo) e o funnell (raso e largo). Silicone resiste a quedas e facilita a limpeza. Capacidade típica: 10–20g de essência.',
    link: { label: 'Ver roshs no catálogo', href: '/categoria/acessorios' },
  },
  {
    termo: 'HMD (gestor de calor)',
    categoria: 'Equipamentos',
    definicao: 'HMD (Heat Management Device) é um acessório de metal que substitui o alumínio no controle da temperatura sobre o rosh, evitando queima irregular e cinza na fumaça.',
    detalhe: 'O Kaloud popularizou a categoria. Com tampa ajustável, você controla a intensidade da brasa girando a abertura. Vale mais que stem caro: o gerenciamento de calor é o fator nº 1 da qualidade da sessão.',
    link: { label: 'Ver acessórios', href: '/categoria/acessorios' },
  },
  {
    termo: 'Essência',
    categoria: 'Consumo',
    definicao: 'Essência é a mistura de tabaco, melaço e aromatizantes usada no narguilé, disponível nos perfis frutado, bebível (drinks/sobremesas) e mentolado.',
    detalhe: 'Marcas confiáveis no Brasil: FM, NAY, Zombie, Zahrah e Zomo. Teor de nicotina varia de 0,05% a 0,5%. Guarde o pote fechado, longe de luz e calor — dura de 6 a 12 meses.',
    link: { label: 'Ver essências no catálogo', href: '/categoria/essencias' },
  },
  {
    termo: 'Seda',
    categoria: 'Consumo',
    definicao: 'Seda é o papel usado para enrolar; RAW (papel de arroz), OCB e Smoking são as marcas de referência, e a espessura e o material definem a velocidade da queima.',
    detalhe: 'Formatos: King size (padrão), King slim (mais discreto) e 1 ¼ (compacto). Linhas premium: RAW Black (arroz, queima muito lenta), OCB Virgin (sem cloro) e Smoking Brown.',
    link: { label: 'Ver sedas no catálogo', href: '/categoria/sedas' },
  },
  {
    termo: 'Carvão de coco',
    categoria: 'Consumo',
    definicao: 'Carvão de coco é o carvão natural feito de casca de coco, preferido por queimar 90 a 120 minutos com sabor neutro e quase nenhuma cinza.',
    detalhe: 'Contra o quick light (comum), rende ~40% mais barato por sessão no acumulado. Acenda no fogão ou acendedor elétrico até a brasa ficar 100% coberta de cinza clara antes de usar.',
    link: { label: 'Ver carvões', href: '/categoria/acessorios' },
  },
  {
    termo: 'Headshop',
    categoria: 'Mercado',
    definicao: 'Headshop é a categoria (ou loja especializada) de acessórios para o universo smoke — grinders, pites, bandejas, isqueiros e itens de armazenamento.',
    detalhe: 'Originado nos anos 1960, o headshop moderno combina acessórios funcionais com lifestyle. Na Cuba & Café, a área de headshop reúne grinders, pites de metal, bandejas e stashs.',
    link: { label: 'Ver headshop', href: '/categoria/headshop' },
  },
  {
    termo: 'Tabacaria',
    categoria: 'Mercado',
    definicao: 'Tabacaria é a loja especializada na venda de produtos para adultos do universo smoke — narguiles, sedas, tabacos, charutos, cachimbos e acessórios, sempre para maiores de 18 anos.',
    detalhe: 'No Brasil, boas tabacarias se diferenciam pela procedência (distribuidores oficiais), curadoria e atendimento técnico. A venda é regulamentada e proibida para menores de 18 anos.',
  },
  {
    termo: 'Grinder',
    categoria: 'Acessórios',
    definicao: 'Grinder é o acessório de dentes que desfia uniformemente ervas e tabacos, garantindo queima homogênea.',
    detalhe: 'Materiais: alumínio (padrão premium, dentes de precisão) e acrílico (econômico). Modelos de 2, 3 e 4 partes — as versões 4 partes incluem peneira e coletor de pó (kief).',
    link: { label: 'Ver headshop', href: '/categoria/headshop' },
  },
  {
    termo: 'Pite',
    categoria: 'Acessórios',
    definicao: 'Pite é o tubo de metal usado como ponteira descartável/reutilizável para narguilé, garantindo higiene entre usuários.',
    detalhe: 'Cromados, anodizados ou de inox — elevam o padrão da sessão em grupo. É um dos acessórios mais vendidos da Cuba & Café.',
    link: { label: 'Ver acessórios', href: '/categoria/acessorios' },
  },
  {
    termo: 'Charuto',
    categoria: 'Consumo',
    definicao: 'Charuto é o rolo de tabaco puro em folhas (capa, capote e tripa), apreciado sem inalação, com origens em Cuba, Nicarágua e República Dominicana.',
    detalhe: 'Avalie por vitola (comprimento x bitola), origem e força. Guarde em umidor (65–72% de umidade) para preservar as folhas. Na dúvida, a equipe indica por perfil e momento.',
    link: { label: 'Ver tabacos', href: '/categoria/tabacos' },
  },
  {
    termo: 'Blunt',
    categoria: 'Consumo',
    definicao: 'Blunt é o cigarro grande enrolado em folha de tabaco reconstituído, com maior capacidade e queima lenta.',
    detalhe: 'Marcas populares no Brasil: Backwoods, Blunt e Swisher. Versões "wrap" vendem só a folha para quem prefere enrolar do seu jeito.',
    link: { label: 'Ver tabacos', href: '/categoria/tabacos' },
  },
  {
    termo: 'Mix de essências',
    categoria: 'Técnica',
    definicao: 'Mix de essências é a combinação de dois ou mais sabores no mesmo rosh — a regra clássica é 2/3 de frutada + 1/3 de mentolada para sessões longas sem enjoar.',
    detalhe: 'Comece com proporções simples (70/30), ajuste conforme o paladar e anote as receitas que funcionam. A equipe da loja monta amostras de mix antes de você levar o frasco inteiro.',
  },
  {
    termo: 'Retirada na loja',
    categoria: 'Serviços',
    definicao: 'Retirada na loja é a modalidade em que o cliente finaliza pelo WhatsApp e retira o pedido na loja física, já separado com seu nome, todos os dias das 10h às 22h.',
    detalhe: 'A Cuba & Café fica no Portal Sul Shopping (Av. dos Ipês, Jardins Lisboa, Goiânia-GO), com estacionamento do shopping e horário estendido 7 dias por semana.',
    link: { label: 'Como chegar', href: '/#localizacao' },
  },
];

export default function GlossarioView() {
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filtered = GLOSSARIO.filter(
    (t) =>
      t.termo.toLowerCase().includes(search.toLowerCase()) ||
      t.definicao.toLowerCase().includes(search.toLowerCase()) ||
      t.categoria.toLowerCase().includes(search.toLowerCase())
  );

  // JSON-LD DefinedTermSet — citabilidade para LLMs e rich results
  useEffect(() => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'DefinedTermSet',
      name: 'Glossário do Universo Smoke — Cuba & Café Tabacaria',
      description: 'Definições claras e citáveis dos termos técnicos do universo smoke: narguilé, rosh, HMD, essências, sedas e mais.',
      inLanguage: 'pt-BR',
      url: `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://cubacafe.com.br').replace(/\/$/, '')}/#/glossario`,
      hasDefinedTerm: GLOSSARIO.map((t) => ({
        '@type': 'DefinedTerm',
        name: t.termo,
        description: t.definicao,
        inDefinedTermSet: 'Glossário do Universo Smoke — Cuba & Café Tabacaria',
      })),
    };
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.text = JSON.stringify(jsonLd);
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/10 bg-[#0d0d0d] pb-12 pt-28 md:pt-36">
        <div className="pointer-events-none absolute -top-20 right-1/4 h-[320px] w-[320px] rounded-full bg-[#c90000]/15 blur-[130px]" />
        <div className="relative mx-auto max-w-4xl px-5 md:px-8">
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-[#ff4b4b]">
            <BookOpen className="h-3.5 w-3.5" /> Glossário
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="font-display text-5xl leading-[0.95] md:text-7xl">
            GLOSSÁRIO <span className="grad-red">SMOKE</span>
          </motion.h1>
          {/* BLUF — resposta direta para pessoas e IAs */}
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-5 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
            Este glossário define, em uma frase direta cada, os termos essenciais do universo smoke —
            de narguilé e rosh a HMD, sedas e carvão de coco — com a curadoria da
            <strong className="text-white/85"> Cuba &amp; Café Tabacaria</strong> (Goiânia-GO), equipe
            que atende clientes todos os dias das 10h às 22h no Portal Sul Shopping.
          </motion.p>

          <div className="relative mt-7 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar termo (ex: rosh, HMD, seda...)"
              className="w-full rounded-xl border border-white/15 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/35 focus:border-[#c90000]/60 focus:outline-none"
              aria-label="Buscar termo no glossário"
            />
          </div>
        </div>
      </div>

      {/* Termos */}
      <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
        {filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-white/45">
            Nenhum termo encontrado para “{search}”. Chame no WhatsApp e a gente explica!
          </p>
        )}

        <div className="space-y-3">
          {filtered.map((t, i) => {
            const open = openIdx === i;
            return (
              <motion.div
                key={t.termo}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: Math.min(i, 6) * 0.04 }}
                className={`overflow-hidden rounded-2xl border transition-colors ${
                  open ? 'border-[#c90000]/50 bg-[#141414]' : 'border-white/10 bg-[#111]'
                }`}
              >
                <button
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-2xl tracking-wide text-white">{t.termo}</span>
                    <span className="rounded-full border border-[#c90000]/35 bg-[#c90000]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ff6b6b]">
                      {t.categoria}
                    </span>
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-lg leading-none transition-all duration-300 ${
                      open ? 'rotate-45 border-[#c90000] bg-[#c90000] text-white' : 'border-white/20 text-white/50'
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                {open && (
                  <div className="px-5 pb-5">
                    {/* Definição direta — citável */}
                    <p className="rounded-xl border-l-4 border-[#c90000] bg-white/[0.04] px-4 py-3 text-sm font-medium leading-relaxed text-white/90">
                      {t.definicao}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{t.detalhe}</p>
                    {t.link && (
                      <button
                        onClick={() => navigate(t.link!.href)}
                        className="mt-4 text-xs font-bold uppercase tracking-wider text-[#ff4b4b] transition-colors hover:text-white"
                      >
                        {t.link.label} →
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-3xl border border-[#c90000]/30 bg-gradient-to-br from-[#c90000]/15 to-transparent p-8 text-center">
          <p className="font-display text-3xl leading-tight md:text-4xl">FICOU COM DÚVIDA DE ALGUM TERMO?</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
            A equipe da Cuba &amp; Café explica na prática — no balcão da loja ou pelo WhatsApp, todos os dias das 10h às 22h.
          </p>
          <a
            href="https://wa.me/556282633610?text=Ol%C3%A1%21%20Tenho%20uma%20d%C3%BAvida%20sobre%20um%20termo%20do%20universo%20smoke."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shimmer mt-6 inline-block rounded-xl bg-[#c90000] px-7 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-[#e00000]"
          >
            Perguntar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
