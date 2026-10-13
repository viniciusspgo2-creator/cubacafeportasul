'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Wallet, Users, Truck, Globe,
  TrendingUp, Eye, MessageCircle, Search, DollarSign, Percent, Plus, Pencil,
  Trash2, X, Upload, Star, Sparkles, ArrowLeft, RefreshCcw, FileText,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import { fmtBRL } from '@/lib/store';
import { navigate } from '@/lib/router';
import { toast } from 'sonner';
import type { Product, Order, Client, Supplier, FinanceEntry, Category } from '@/lib/types';

const CHART_BG = ['#c90000', '#ff4b4b', '#8a0000', '#5a5a5a', '#2a2a2a', '#ff7b7b'];

interface Stats {
  metrics: {
    visits: number; productViews: number; orderSends: number; searches: number;
    totalProducts: number; totalOrders: number; totalArticles: number;
    revenue: number; revenueLast30: number; conversion: number;
    entradas: number; saidas: number; saldo: number;
  };
  days: { date: string; visits: number; views: number; orders: number }[];
  topProducts: { name: string; views: number; category: string; price: number }[];
  topSearches: { term: string; count: number }[];
  ordersByStatus: { status: string; count: number }[];
}

type Tab = 'dashboard' | 'produtos' | 'pedidos' | 'financeiro' | 'clientes' | 'fornecedores' | 'blog' | 'seo';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'produtos', label: 'Produtos', icon: Package },
  { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
  { id: 'financeiro', label: 'Financeiro', icon: Wallet },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'fornecedores', label: 'Fornecedores', icon: Truck },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'seo', label: 'SEO', icon: Globe },
];

const STATUS_STYLE: Record<string, string> = {
  novo: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'em atendimento': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  separando: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  finalizado: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

export default function AdminView() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [refresh, setRefresh] = useState(0);

  const loadStats = useCallback(() => {
    fetch('/api/admin/stats').then((r) => r.json()).then(setStats).catch(() => null);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats, refresh]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-16">
      {/* Topbar */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <Image src="/brand/logo.png" alt="Cuba & Café" width={120} height={91} className="h-9 w-auto" />
          <span className="rounded-lg border border-[#c90000]/40 bg-[#c90000]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff6b6b]">
            Admin
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setRefresh((r) => r + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 text-white/60 transition-all hover:text-white"
              aria-label="Atualizar dados"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/60 transition-all hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Ver site
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="no-scrollbar mx-auto flex max-w-[1500px] gap-1 overflow-x-auto px-4 pb-2.5 md:px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all ${
                tab === t.id ? 'bg-[#c90000] text-white shadow-[0_0_18px_rgba(201,0,0,0.35)]' : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-6">
        <AnimatePresence mode="wait">
          <motion.div key={tab + refresh} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {tab === 'dashboard' && <Dashboard stats={stats} />}
            {tab === 'produtos' && <ProductsAdmin onRefresh={() => setRefresh((r) => r + 1)} />}
            {tab === 'pedidos' && <OrdersAdmin />}
            {tab === 'financeiro' && <FinanceAdmin />}
            {tab === 'clientes' && <ClientsAdmin />}
            {tab === 'fornecedores' && <SuppliersAdmin />}
            {tab === 'blog' && <BlogAdmin />}
            {tab === 'seo' && <SeoAdmin />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============ DASHBOARD ============ */
function Dashboard({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#151515]" />
        ))}
      </div>
    );
  }
  const { metrics } = stats;

  const cards = [
    { label: 'Visitas totais', value: metrics.visits.toLocaleString('pt-BR'), icon: Eye, sub: `${stats.days.slice(-7).reduce((s, d) => s + d.visits, 0).toLocaleString('pt-BR')} nos últimos 7 dias`, color: '#c90000' },
    { label: 'Produtos visualizados', value: metrics.productViews.toLocaleString('pt-BR'), icon: TrendingUp, sub: `${metrics.totalProducts} produtos no catálogo`, color: '#ff4b4b' },
    { label: 'Pedidos enviados', value: metrics.orderSends.toLocaleString('pt-BR'), icon: MessageCircle, sub: `${metrics.totalOrders} pedidos registrados`, color: '#25D366' },
    { label: 'Conversão WhatsApp', value: `${metrics.conversion.toFixed(1)}%`, icon: Percent, sub: 'pedidos / visitas', color: '#ffd166' },
    { label: 'Receita estimada', value: fmtBRL(metrics.revenue), icon: DollarSign, sub: `${fmtBRL(metrics.revenueLast30)} em 30 dias`, color: '#8a0000' },
    { label: 'Buscas no site', value: metrics.searches.toLocaleString('pt-BR'), icon: Search, sub: 'termos digitados', color: '#ff7b7b' },
    { label: 'Financeiro saldo', value: fmtBRL(metrics.saldo), icon: Wallet, sub: `Entradas ${fmtBRL(metrics.entradas)}`, color: '#4ade80' },
    { label: 'Artigos no blog', value: String(metrics.totalArticles), icon: Globe, sub: 'SEO ativo', color: '#a78bfa' },
  ];

  const statusData = stats.ordersByStatus.map((s) => ({ name: s.status, value: s.count }));

  return (
    <div className="space-y-6">
      {/* Cards métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#141414] p-5 transition-all hover:border-[#c90000]/40"
          >
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-40" style={{ background: c.color }} />
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/45">{c.label}</span>
              <c.icon className="h-4.5 w-4.5" style={{ color: c.color }} />
            </div>
            <p className="font-display text-3xl tracking-wide text-white">{c.value}</p>
            <p className="mt-1.5 text-[11px] text-white/35">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Gráfico principal */}
      <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl tracking-wide">TRÁFEGO — ÚLTIMOS 14 DIAS</h2>
            <p className="text-xs text-white/40">Visitas, visualizações de produto e pedidos enviados</p>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.days} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c90000" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#c90000" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff7b7b" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ff7b7b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#777', fontSize: 11 }} axisLine={{ stroke: '#2a2a2a' }} tickLine={false} />
              <YAxis tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#fff', fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="visits" stroke="#c90000" strokeWidth={2.5} fill="url(#gVisits)" name="Visitas" />
              <Area type="monotone" dataKey="views" stroke="#ff7b7b" strokeWidth={2} fill="url(#gViews)" name="Views produtos" />
              <Area type="monotone" dataKey="orders" stroke="#25D366" strokeWidth={2} fill="transparent" name="Pedidos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top produtos */}
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 lg:col-span-2">
          <h2 className="font-display mb-1 text-2xl tracking-wide">PRODUTOS MAIS PROCURADOS</h2>
          <p className="mb-4 text-xs text-white/40">Ranking por visualizações na página do produto</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topProducts} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={190} tick={{ fill: '#bbb', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, fontSize: 12 }}
                  cursor={{ fill: 'rgba(201,0,0,0.08)' }}
                />
                <Bar dataKey="views" radius={[0, 8, 8, 0]} name="Visualizações">
                  {stats.topProducts.map((_, i) => (
                    <Cell key={i} fill={CHART_BG[i % CHART_BG.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pedidos por status */}
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <h2 className="font-display mb-1 text-2xl tracking-wide">PEDIDOS POR STATUS</h2>
          <p className="mb-4 text-xs text-white/40">Distribuição do funil</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={['#3b82f6', '#f59e0b', '#a855f7', '#10b981'][i % 4]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, textTransform: 'capitalize' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top buscas */}
      <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
        <h2 className="font-display mb-4 text-2xl tracking-wide">TERMOS MAIS BUSCADOS</h2>
        <div className="flex flex-wrap gap-2.5">
          {stats.topSearches.length === 0 && <p className="text-sm text-white/35">Nenhuma busca registrada ainda.</p>}
          {stats.topSearches.map((s, i) => (
            <span key={s.term} className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5">
              <span className="font-display text-lg text-[#ff4b4b]">#{i + 1}</span>
              <span className="text-sm font-semibold text-white/85">{s.term}</span>
              <span className="rounded-md bg-[#c90000]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#ff6b6b]">{s.count}x</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ PRODUTOS ============ */
const EMPTY_PRODUCT = {
  name: '', category: 'Narguiles', description: '', longDesc: '',
  price: 0, oldPrice: null as number | null, images: [] as string[],
  tags: [] as string[], specs: {} as Record<string, string>,
  stock: 10, featured: false, isNew: true,
};

function ProductsAdmin({ onRefresh }: { onRefresh: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<null | (typeof EMPTY_PRODUCT & { id?: string; slug?: string })>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const load = useCallback(() => {
    fetch('/api/products').then((r) => r.json()).then(setProducts).catch(() => null);
  }, []);

  useEffect(() => {
    load();
    fetch('/api/settings?key=categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.value ? JSON.parse(d.value) : []))
      .catch(() => null);
  }, [load]);

  const uploadFiles = async (files: FileList) => {
    if (!files.length) return;
    if (editing && editing.images.length + files.length > 6) {
      toast.error('Máximo de 6 imagens por produto');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.urls) {
        setEditing((e) => (e ? { ...e, images: [...e.images, ...data.urls].slice(0, 6) } : e));
        toast.success(`${data.urls.length} imagem(ns) processada(s) em WebP`);
      } else toast.error(data.error || 'Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!editing?.name.trim()) { toast.error('Nome obrigatório'); return; }
    setSaving(true);
    try {
      const isNew = !editing.id;
      const res = await fetch(isNew ? '/api/products' : `/api/products/${editing.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error();
      toast.success(isNew ? 'Produto cadastrado! Chatbot indexado automaticamente.' : 'Produto atualizado!');
      setEditing(null);
      load();
      onRefresh();
    } catch {
      toast.error('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Excluir "${p.name}" definitivamente?`)) return;
    await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
    toast.success('Produto excluído');
    load();
    onRefresh();
  };

  /** Salva chave pontual em specs (parcelamento, juros, promoção) */
  const setSpecKey = (key: string, value: string) => {
    if (!editing) return;
    const specs = { ...editing.specs };
    if (value.trim()) specs[key] = value.trim();
    else delete specs[key];
    setEditing({ ...editing, specs });
  };

  /** Chaves gerenciadas pelos campos dedicados — preservadas ao editar o textarea livre */
  const MANAGED_SPEC_KEYS = ['parcelas', 'juros', 'promocao'];

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-3xl tracking-wide">GERENCIAR PRODUTOS</h2>
        <span className="rounded-lg bg-[#c90000]/15 px-3 py-1 text-xs font-bold text-[#ff6b6b]">{products.length} cadastrados</span>
        <div className="ml-auto flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar produtos..."
            className="w-48 rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm placeholder:text-white/30 focus:border-[#c90000]/60 focus:outline-none"
          />
          <button
            onClick={() => setEditing({ ...EMPTY_PRODUCT })}
            className="btn-shimmer flex items-center gap-2 rounded-xl bg-[#c90000] px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-[#e00000]"
          >
            <Plus className="h-4 w-4" /> Novo produto
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
        <div className="max-h-[62vh] overflow-y-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="sticky top-0 bg-[#1a1a1a] text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-white/6 transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10">
                        <Image src={p.images[0] || '/photos/loja-prateleiras.webp'} alt={p.name} fill sizes="44px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-[260px] truncate font-semibold text-white/90">{p.name}</p>
                        <p className="text-[11px] text-white/35">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-white/60">{p.category}</td>
                  <td className="px-4 py-2.5 font-display text-lg">{fmtBRL(p.price)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-md px-2 py-1 text-xs font-bold ${p.stock > 5 ? 'bg-emerald-500/15 text-emerald-300' : p.stock > 0 ? 'bg-amber-500/15 text-amber-300' : 'bg-red-500/15 text-red-300'}`}>
                      {p.stock} un
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-white/50">{p.views}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      {p.featured && <span className="flex items-center gap-1 rounded-md bg-[#c90000]/20 px-2 py-1 text-[10px] font-bold text-[#ff6b6b]"><Star className="h-3 w-3" /> Destaque</span>}
                      {p.isNew && <span className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold text-white/70"><Sparkles className="h-3 w-3" /> Novo</span>}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditing({
                          id: p.id, slug: p.slug, name: p.name, category: p.category,
                          description: p.description, longDesc: p.longDesc,
                          price: p.price, oldPrice: p.oldPrice ?? null, images: p.images,
                          tags: p.tags, specs: p.specs, stock: p.stock,
                          featured: p.featured, isNew: p.isNew,
                        })}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-white/60 transition-all hover:border-[#c90000] hover:text-white"
                        aria-label={`Editar ${p.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-white/60 transition-all hover:border-red-500 hover:text-red-400"
                        aria-label={`Excluir ${p.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal produto */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="my-8 w-full max-w-2xl rounded-3xl border border-white/12 bg-[#141414] p-7"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-3xl tracking-wide">
                  {editing.id ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}
                </h3>
                <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white" aria-label="Fechar">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-4">
                <Field label="Nome do produto *">
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} placeholder="Ex: Essência FM Double Apple 50g" />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Categoria">
                    <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={inputCls}>
                      {categories.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Preço (R$) *">
                    <input type="number" step="0.01" value={editing.price || ''} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} className={inputCls} />
                  </Field>
                  <Field label="Preço antigo (opcional)">
                    <input type="number" step="0.01" value={editing.oldPrice ?? ''} onChange={(e) => setEditing({ ...editing, oldPrice: e.target.value ? parseFloat(e.target.value) : null })} className={inputCls} />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Estoque">
                    <input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: parseInt(e.target.value) || 0 })} className={inputCls} />
                  </Field>
                  <div className="flex items-end gap-5 pb-1">
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/70">
                      <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="h-4 w-4 accent-[#c90000]" />
                      <Star className="h-4 w-4 text-[#ff6b6b]" /> Destaque
                    </label>
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/70">
                      <input type="checkbox" checked={editing.isNew} onChange={(e) => setEditing({ ...editing, isNew: e.target.checked })} className="h-4 w-4 accent-[#c90000]" />
                      <Sparkles className="h-4 w-4 text-[#ff6b6b]" /> Novidade
                    </label>
                  </div>
                </div>

                {/* Venda: parcelamento + promoção (salvos em specs, sem mudar o banco) */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6b6b]">Venda & Promoção</p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Parcelar em até (x)">
                      <input
                        type="number" min={1} max={12}
                        value={editing.specs.parcelas || ''}
                        onChange={(e) => setSpecKey('parcelas', e.target.value)}
                        className={inputCls}
                        placeholder="Ex: 12"
                      />
                    </Field>
                    <Field label="Juros">
                      <select
                        value={editing.specs.juros || 'sem juros'}
                        onChange={(e) => setSpecKey('juros', e.target.value)}
                        className={inputCls}
                      >
                        <option value="sem juros">Sem juros</option>
                        <option value="com juros">Com juros</option>
                      </select>
                    </Field>
                    <Field label="Promoção R$ por R$">
                      <input
                        value={editing.specs.promocao || ''}
                        onChange={(e) => setSpecKey('promocao', e.target.value)}
                        className={inputCls}
                        placeholder="Ex: Leve R$ 100, pague R$ 85"
                      />
                    </Field>
                  </div>
                  <p className="mt-2.5 text-[11px] leading-relaxed text-white/35">
                    O parcelamento aparece nos cards e na página do produto (ex: “12x de R$ 12,49 sem juros”).
                    Deixe vazio para usar o padrão (3x sem juros acima de R$ 60).
                  </p>
                </div>

                <Field label="Descrição curta">
                  <input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} placeholder="Aparece nos cards do catálogo" />
                </Field>

                <Field label="Descrição longa">
                  <textarea value={editing.longDesc} onChange={(e) => setEditing({ ...editing, longDesc: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="Texto completo da página do produto" />
                </Field>

                <Field label="Tags (separadas por vírgula)">
                  <input
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                      setEditing({ ...editing, tags });
                    }}
                    className={inputCls}
                    placeholder="essência, fm, importado"
                  />
                </Field>

                <Field label={`Imagens (${editing.images.length}/6) — convertidas para WebP automaticamente`}>
                  <div className="grid grid-cols-6 gap-2">
                    {editing.images.map((img, i) => (
                      <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-white/12">
                        <Image src={img} alt={`Imagem ${i + 1}`} fill sizes="80px" className="object-cover" />
                        <button
                          onClick={() => setEditing({ ...editing, images: editing.images.filter((_, j) => j !== i) })}
                          className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="Remover imagem"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                    {editing.images.length < 6 && (
                      <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-white/20 text-white/40 transition-colors hover:border-[#c90000]/60 hover:text-white/70">
                        {uploading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#ff4b4b]" /> : <Upload className="h-5 w-5" />}
                        <span className="text-[9px] font-semibold uppercase">Upload</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
                      </label>
                    )}
                  </div>
                </Field>

                <Field label="Características (formato: Nome: valor, uma por linha)">
                  <textarea
                    defaultValue={Object.entries(editing.specs).filter(([k]) => !MANAGED_SPEC_KEYS.includes(k)).map(([k, v]) => `${k}: ${v}`).join('\n')}
                    onBlur={(e) => {
                      const specs: Record<string, string> = {};
                      e.target.value.split('\n').forEach((line) => {
                        const [k, ...rest] = line.split(':');
                        if (k.trim() && rest.length) specs[k.trim()] = rest.join(':').trim();
                      });
                      // Preserva parcelamento/juros/promoção gerenciados pelos campos dedicados
                      for (const k of MANAGED_SPEC_KEYS) {
                        if (editing.specs[k]) specs[k] = editing.specs[k];
                      }
                      setEditing({ ...editing, specs });
                    }}
                    rows={3}
                    className={`${inputCls} resize-none`}
                    placeholder={'Peso: 50g\nOrigem: Importado'}
                  />
                </Field>
              </div>

              <div className="mt-7 flex gap-3">
                <button
                  onClick={save}
                  disabled={saving}
                  className="btn-shimmer flex-1 rounded-xl bg-[#c90000] py-3.5 font-display text-xl tracking-wide hover:bg-[#e00000] disabled:opacity-50"
                >
                  {saving ? 'SALVANDO...' : editing.id ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR PRODUTO'}
                </button>
                <button onClick={() => setEditing(null)} className="rounded-xl border border-white/15 px-7 text-sm text-white/60 hover:text-white">
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-[#c90000]/70 focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/45">{label}</span>
      {children}
    </label>
  );
}

/* ============ PEDIDOS ============ */
function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);

  const load = useCallback(() => {
    fetch('/api/orders').then((r) => r.json()).then(setOrders).catch(() => null);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    toast.success(`Pedido atualizado: ${status}`);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir este pedido?')) return;
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-3xl tracking-wide">PEDIDOS WHATSAPP</h2>
        <span className="rounded-lg bg-[#c90000]/15 px-3 py-1 text-xs font-bold text-[#ff6b6b]">{orders.length} registros</span>
      </div>

      <div className="space-y-3">
        {orders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-white/35">
            Nenhum pedido registrado ainda. Pedidos enviados pelo site aparecem aqui automaticamente.
          </div>
        )}
        {orders.map((o) => (
          <motion.div key={o.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-display text-2xl tracking-wide text-white">{o.code}</span>
                  <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[o.status] || 'border-white/20 bg-white/10 text-white/70'}`}>
                    {o.status}
                  </span>
                  <span className="text-xs text-white/35">{new Date(o.createdAt).toLocaleString('pt-BR')}</span>
                </div>
                <p className="mt-1.5 text-sm text-white/60">
                  <strong className="text-white/85">{o.clientName}</strong> · {o.clientPhone || 'sem telefone'}
                </p>
                {o.notes && <p className="mt-1 max-w-lg text-xs italic text-white/40">Obs: {o.notes}</p>}
                <ul className="mt-3 space-y-1">
                  {o.items.map((it, i) => (
                    <li key={i} className="text-sm text-white/70">
                      <span className="text-[#ff4b4b]">{it.qty}×</span> {it.name}
                      <span className="ml-2 text-white/40">{fmtBRL(it.price * it.qty)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span className="font-display text-3xl text-white">{fmtBRL(o.total)}</span>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="rounded-xl border border-white/12 bg-[#1a1a1a] px-3.5 py-2.5 text-sm focus:border-[#c90000]/60 focus:outline-none"
                  aria-label={`Status do pedido ${o.code}`}
                >
                  {['novo', 'em atendimento', 'separando', 'finalizado'].map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <button onClick={() => remove(o.id)} className="text-xs text-white/30 hover:text-red-400">
                  Excluir
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============ FINANCEIRO ============ */
function FinanceAdmin() {
  const [data, setData] = useState<{ entries: FinanceEntry[]; summary: { entradas: number; saidas: number; aReceber: number; aPagar: number; saldo: number } } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'entrada', category: '', description: '', amount: 0, status: 'pago', dueDate: '' });

  const load = useCallback(() => {
    fetch('/api/finance').then((r) => r.json()).then(setData).catch(() => null);
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.description || !form.amount) { toast.error('Preencha descrição e valor'); return; }
    await fetch('/api/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    toast.success('Lançamento adicionado');
    setShowForm(false);
    setForm({ type: 'entrada', category: '', description: '', amount: 0, status: 'pago', dueDate: '' });
    load();
  };

  const toggleStatus = async (e: FinanceEntry) => {
    await fetch(`/api/finance/${e.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: e.status === 'pago' ? 'pendente' : 'pago' }) });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/finance/${id}`, { method: 'DELETE' });
    load();
  };

  if (!data) return <div className="h-40 animate-pulse rounded-2xl bg-[#151515]" />;

  const cards = [
    { label: 'Entradas recebidas', value: data.summary.entradas, color: '#10b981' },
    { label: 'Saídas pagas', value: data.summary.saidas, color: '#c90000' },
    { label: 'A receber', value: data.summary.aReceber, color: '#f59e0b' },
    { label: 'A pagar', value: data.summary.aPagar, color: '#a855f7' },
    { label: 'Saldo em caixa', value: data.summary.saldo, color: '#ffffff' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-3xl tracking-wide">FINANCEIRO</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-shimmer ml-auto flex items-center gap-2 rounded-xl bg-[#c90000] px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-[#e00000]"
        >
          <Plus className="h-4 w-4" /> Novo lançamento
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-white/10 bg-[#141414] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{c.label}</p>
            <p className="font-display mt-1.5 text-2xl" style={{ color: c.color }}>{fmtBRL(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="grid gap-4 rounded-2xl border border-[#c90000]/30 bg-[#141414] p-5 md:grid-cols-6">
              <Field label="Tipo">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </Field>
              <Field label="Categoria">
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} placeholder="Vendas, Fornecedores..." />
              </Field>
              <div className="md:col-span-2">
                <Field label="Descrição">
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="Valor (R$)">
                <input type="number" step="0.01" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} className={inputCls} />
              </Field>
              <Field label="Vencimento">
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={inputCls} />
              </Field>
              <div className="md:col-span-6">
                <button onClick={add} className="btn-shimmer rounded-xl bg-[#c90000] px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-[#e00000]">
                  Adicionar lançamento
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
        <div className="max-h-[55vh] overflow-y-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="sticky top-0 bg-[#1a1a1a] text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((e) => (
                <tr key={e.id} className="border-t border-white/6 hover:bg-white/[0.03]">
                  <td className="px-4 py-2.5 font-medium text-white/85">{e.description}</td>
                  <td className="px-4 py-2.5 text-white/55">{e.category}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${e.type === 'entrada' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                      {e.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-white/45">{e.dueDate ? new Date(e.dueDate).toLocaleDateString('pt-BR') : '—'}</td>
                  <td className={`px-4 py-2.5 font-display text-lg ${e.type === 'entrada' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {e.type === 'entrada' ? '+' : '−'}{fmtBRL(e.amount)}
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => toggleStatus(e)}
                      className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${e.status === 'pago' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}
                    >
                      {e.status}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => remove(e.id)} className="text-white/25 hover:text-red-400" aria-label="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============ CLIENTES ============ */
function ClientsAdmin() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', notes: '' });

  const load = useCallback(() => {
    fetch('/api/clients').then((r) => r.json()).then(setClients).catch(() => null);
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.name || !form.phone) { toast.error('Nome e telefone obrigatórios'); return; }
    await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    toast.success('Cliente cadastrado');
    setShowForm(false);
    setForm({ name: '', phone: '', notes: '' });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir cliente?')) return;
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-3xl tracking-wide">CLIENTES</h2>
        <span className="rounded-lg bg-[#c90000]/15 px-3 py-1 text-xs font-bold text-[#ff6b6b]">{clients.length}</span>
        <button onClick={() => setShowForm(!showForm)} className="btn-shimmer ml-auto flex items-center gap-2 rounded-xl bg-[#c90000] px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-[#e00000]">
          <Plus className="h-4 w-4" /> Novo cliente
        </button>
      </div>

      {showForm && (
        <div className="grid gap-4 rounded-2xl border border-[#c90000]/30 bg-[#141414] p-5 md:grid-cols-3">
          <Field label="Nome"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
          <Field label="Telefone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="(62) 9 9999-9999" /></Field>
          <Field label="Observações"><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} /></Field>
          <div className="md:col-span-3">
            <button onClick={add} className="rounded-xl bg-[#c90000] px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#e00000]">Cadastrar</button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="group relative rounded-2xl border border-white/10 bg-[#141414] p-5 transition-colors hover:border-[#c90000]/40">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c90000]/40 bg-[#c90000]/10">
                  <span className="font-display text-xl text-[#ff6b6b]">{c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span>
                </div>
                <div>
                  <p className="font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-white/40">{c.phone}</p>
                </div>
              </div>
              <button onClick={() => remove(c.id)} className="text-white/20 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100" aria-label="Excluir">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/[0.04] px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-white/35">Pedidos</p>
                <p className="font-display text-xl">{c.orders}</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-white/35">Total gasto</p>
                <p className="font-display text-xl text-emerald-400">{fmtBRL(c.spent)}</p>
              </div>
            </div>
            {c.notes && <p className="mt-3 text-xs italic text-white/40">"{c.notes}"</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============ FORNECEDORES ============ */
function SuppliersAdmin() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', products: '', lastOrder: 0 });

  const load = useCallback(() => {
    fetch('/api/suppliers').then((r) => r.json()).then(setSuppliers).catch(() => null);
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.name) { toast.error('Nome obrigatório'); return; }
    await fetch('/api/suppliers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    toast.success('Fornecedor cadastrado');
    setShowForm(false);
    setForm({ name: '', contact: '', products: '', lastOrder: 0 });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir fornecedor?')) return;
    await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-3xl tracking-wide">FORNECEDORES</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-shimmer ml-auto flex items-center gap-2 rounded-xl bg-[#c90000] px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-[#e00000]">
          <Plus className="h-4 w-4" /> Novo fornecedor
        </button>
      </div>

      {showForm && (
        <div className="grid gap-4 rounded-2xl border border-[#c90000]/30 bg-[#141414] p-5 md:grid-cols-4">
          <Field label="Nome"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
          <Field label="Contato"><input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className={inputCls} placeholder="email / telefone" /></Field>
          <Field label="Produtos"><input value={form.products} onChange={(e) => setForm({ ...form, products: e.target.value })} className={inputCls} /></Field>
          <Field label="Último pedido (R$)"><input type="number" value={form.lastOrder || ''} onChange={(e) => setForm({ ...form, lastOrder: parseFloat(e.target.value) || 0 })} className={inputCls} /></Field>
          <div className="md:col-span-4">
            <button onClick={add} className="rounded-xl bg-[#c90000] px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#e00000]">Cadastrar</button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[#1a1a1a] text-[11px] uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-4 py-3">Fornecedor</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Produtos</th>
              <th className="px-4 py-3">Último pedido</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-t border-white/6 hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-semibold text-white/90">{s.name}</td>
                <td className="px-4 py-3 text-white/55">{s.contact}</td>
                <td className="max-w-[220px] truncate px-4 py-3 text-white/55">{s.products}</td>
                <td className="px-4 py-3 font-display text-lg text-white">{fmtBRL(s.lastOrder)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(s.id)} className="text-white/25 hover:text-red-400" aria-label="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ SEO ============ */
/* ============ BLOG ADMIN — CRUD de artigos ============ */
interface AdminArticle {
  id: string; slug: string; title: string; excerpt: string; content: string;
  cover: string; tags: string[]; metaTitle: string; metaDescription: string;
  readTime: number; createdAt: string; updatedAt?: string;
}

const emptyArticle: AdminArticle = {
  id: '', slug: '', title: '', excerpt: '', content: '', cover: '/photos/loja-balcao.webp',
  tags: [], metaTitle: '', metaDescription: '', readTime: 5, createdAt: '',
};

function BlogAdmin() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminArticle | null>(null);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/articles')
      .then((r) => r.json())
      .then((d) => setArticles(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', files[0]);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.urls?.length) {
        setEditing((e) => (e ? { ...e, cover: data.urls[0] } : e));
        toast.success('Capa enviada!');
      } else {
        toast.error(data.error || 'Erro no upload');
      }
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { toast.error('Título obrigatório'); return; }
    setSaving(true);
    const isEdit = Boolean(editing.id);
    const res = await fetch('/api/articles', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(isEdit ? { id: editing.id } : {}),
        title: editing.title,
        excerpt: editing.excerpt,
        content: editing.content,
        cover: editing.cover,
        tags: editing.tags,
        metaTitle: editing.metaTitle,
        metaDescription: editing.metaDescription,
        readTime: editing.readTime,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(isEdit ? 'Artigo atualizado!' : 'Artigo publicado!');
      setEditing(null);
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || 'Erro ao salvar artigo');
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Excluir o artigo "${title}"? Esta ação não pode ser desfeita.`)) return;
    const res = await fetch(`/api/articles?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Artigo excluído'); load(); }
    else toast.error('Erro ao excluir');
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl tracking-wide">ARTIGOS DO BLOG</h2>
          <p className="text-xs text-white/40">{articles.length} artigos publicados — guias estratégicos de SEO</p>
        </div>
        <button
          onClick={() => { setEditing({ ...emptyArticle }); setTagInput(''); }}
          className="btn-shimmer flex items-center gap-2 rounded-xl bg-[#c90000] px-5 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#e00000]"
        >
          <Plus className="h-4 w-4" /> Novo artigo
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#151515]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {articles.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-[#121212] p-3.5">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10">
                <Image src={a.cover || '/photos/loja-balcao.webp'} alt={a.title} fill sizes="96px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{a.title}</p>
                <p className="mt-0.5 truncate text-xs text-white/40">/{a.slug} · {a.readTime} min · {new Date(a.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing({ ...a }); setTagInput(a.tags.join(', ')); }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white/60 transition-colors hover:border-[#c90000]/60 hover:text-white"
                  aria-label={`Editar ${a.title}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(a.id, a.title)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white/60 transition-colors hover:border-red-500/60 hover:text-red-400"
                  aria-label={`Excluir ${a.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário de edição */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm md:items-center">
            <motion.div
              initial={{ scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="my-8 w-full max-w-2xl rounded-3xl border border-white/12 bg-[#121212] p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-2xl tracking-wide">{editing.id ? 'EDITAR ARTIGO' : 'NOVO ARTIGO'}</h3>
                <button onClick={() => setEditing(null)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 text-white/60 hover:text-white" aria-label="Fechar">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
                <Field label="Título">
                  <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputCls} placeholder="Ex: Guia Completo do Narguilé" />
                </Field>

                <Field label="Resumo (aparece no card e no Google)">
                  <textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} className={`${inputCls} resize-none`} placeholder="Resposta direta em 1-2 frases..." />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Tempo de leitura (min)">
                    <input type="number" min={1} max={60} value={editing.readTime} onChange={(e) => setEditing({ ...editing, readTime: Number(e.target.value) || 5 })} className={inputCls} />
                  </Field>
                  <Field label="Tags (separadas por vírgula)">
                    <input
                      value={tagInput}
                      onChange={(e) => {
                        setTagInput(e.target.value);
                        setEditing({ ...editing, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) });
                      }}
                      className={inputCls}
                      placeholder="narguilé, guia, dicas"
                    />
                  </Field>
                </div>

                <Field label="Conteúdo (markdown simples: # / ## / ### títulos, - listas, > destaque, | tabelas) ">
                  <textarea
                    value={editing.content}
                    onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                    rows={10}
                    className={`${inputCls} font-mono text-xs leading-relaxed`}
                    placeholder={'# Título do artigo\n\nParágrafo de resposta direta (BLUF)...\n\n## Seção\n\n- item\n- item'}
                  />
                </Field>

                <Field label="Meta title (SEO)">
                  <input value={editing.metaTitle} onChange={(e) => setEditing({ ...editing, metaTitle: e.target.value })} className={inputCls} placeholder="Deixe vazio para usar o padrão" />
                </Field>
                <Field label="Meta description (SEO)">
                  <textarea value={editing.metaDescription} onChange={(e) => setEditing({ ...editing, metaDescription: e.target.value })} rows={2} className={`${inputCls} resize-none`} placeholder="Deixe vazio para usar o resumo" />
                </Field>

                <Field label="Imagem de capa">
                  <div className="flex items-center gap-3">
                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-white/12">
                      <Image src={editing.cover || '/photos/loja-balcao.webp'} alt="Capa" fill sizes="128px" className="object-cover" />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/60 hover:text-white">
                      {uploading ? 'Enviando...' : 'Enviar imagem'}
                      <Upload className="h-4 w-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
                    </label>
                  </div>
                </Field>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={save}
                  disabled={saving}
                  className="btn-shimmer flex-1 rounded-xl bg-[#c90000] py-3.5 font-display text-xl tracking-wide hover:bg-[#e00000] disabled:opacity-50"
                >
                  {saving ? 'SALVANDO...' : editing.id ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR ARTIGO'}
                </button>
                <button onClick={() => setEditing(null)} className="rounded-xl border border-white/15 px-7 text-sm text-white/60 hover:text-white">
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SeoAdmin() {
  const [seo, setSeo] = useState({ title: '', description: '', keywords: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings?key=seo')
      .then((r) => r.json())
      .then((d) => { if (d.value) setSeo(JSON.parse(d.value)); })
      .catch(() => null);
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seo: JSON.stringify(seo) }),
    });
    toast.success('Configurações SEO salvas!');
    setSaving(false);
  };

  const copySitemap = () => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>/</loc><priority>1.0</priority></url>
  <url><loc>/catalogo</loc><priority>0.9</priority></url>
  <url><loc>/blog</loc><priority>0.8</priority></url>
</urlset>`;
    navigator.clipboard.writeText(sitemap);
    toast.success('Sitemap.xml base copiado!');
  };

  return (
    <div className="max-w-3xl space-y-5">
      <h2 className="font-display text-3xl tracking-wide">CONFIGURAÇÕES SEO</h2>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-[#141414] p-6">
        <Field label="Meta Title">
          <input value={seo.title} onChange={(e) => setSeo({ ...seo, title: e.target.value })} className={inputCls} />
          <p className="mt-1 text-[11px] text-white/30">{seo.title.length} caracteres (ideal: 50–60)</p>
        </Field>
        <Field label="Meta Description">
          <textarea value={seo.description} onChange={(e) => setSeo({ ...seo, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} />
          <p className="mt-1 text-[11px] text-white/30">{seo.description.length} caracteres (ideal: 150–160)</p>
        </Field>
        <Field label="Keywords (separadas por vírgula)">
          <textarea value={seo.keywords} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} rows={2} className={`${inputCls} resize-none`} />
        </Field>
        <button onClick={save} disabled={saving} className="btn-shimmer rounded-xl bg-[#c90000] px-8 py-3.5 font-bold uppercase tracking-wider text-sm hover:bg-[#e00000] disabled:opacity-50">
          {saving ? 'Salvando...' : 'Salvar SEO'}
        </button>
      </div>

      {/* Preview Google */}
      <div className="rounded-2xl border border-white/10 bg-[#141414] p-6">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-white/40">Preview no Google</p>
        <div className="rounded-xl bg-white p-4">
          <p className="text-xs text-[#202124]">cubacafetabacaria.com.br</p>
          <p className="mt-0.5 text-lg leading-snug text-[#1a0dab]">{seo.title || 'Título do site'}</p>
          <p className="mt-1 text-sm leading-snug text-[#4d5156]">{seo.description || 'Descrição do site que aparece no resultado da busca.'}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-6">
          <h3 className="font-display mb-2 text-xl tracking-wide">OPEN GRAPH</h3>
          <p className="text-sm text-white/50">Configurado automaticamente no layout do site: título, descrição, imagem da fachada da loja e locale pt_BR.</p>
        </div>
        <button onClick={copySitemap} className="rounded-2xl border border-white/10 bg-[#141414] p-6 text-left transition-colors hover:border-[#c90000]/40">
          <h3 className="font-display mb-2 text-xl tracking-wide">SITEMAP & ROBOTS</h3>
          <p className="text-sm text-white/50">Clique para copiar o sitemap.xml base. Schema.org LocalBusiness ativo no site. robots.txt liberando indexação.</p>
        </button>
      </div>
    </div>
  );
}
