import { Prisma } from '@prisma/client';

export function safeJson<T>(str: string | null | undefined, fallback: T): T {
  try { return (str ? JSON.parse(str) : fallback) as T; } catch { return fallback; }
}

export function parseProduct(p: Record<string, unknown>) {
  return {
    ...p,
    images: safeJson<string[]>(p.images as string, []),
    tags: safeJson<string[]>(p.tags as string, []),
    specs: safeJson<Record<string, string>>(p.specs as string, {}),
  };
}

export function slugify(text: string): string {
  return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

export function parseModel<T>(obj: Record<string, unknown>, jsonFields: string[]): T {
  const out = { ...obj };
  for (const f of jsonFields) out[f] = safeJson(obj[f] as string, f === 'specs' ? {} : []);
  return out as T;
}

export const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export const WHATSAPP_NUMBER = '556282633610';

export function buildWhatsAppMessage(order: {
  clientName: string; clientPhone: string; notes: string;
  items: { name: string; qty: number; price: number }[];
}): string {
  const lines: string[] = [];
  lines.push('Olá, *Cuba & Café Tabacaria*!');
  lines.push('Gostaria de fazer um pedido:');
  lines.push('');
  lines.push('*Produtos:*');
  order.items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.name}`);
    lines.push(`   Quantidade: ${it.qty}x — ${fmtBRL(it.price * it.qty)}`);
  });
  const total = order.items.reduce((s, it) => s + it.price * it.qty, 0);
  lines.push('');
  lines.push(`*Total estimado:* ${fmtBRL(total)}`);
  if (order.notes?.trim()) {
    lines.push('');
    lines.push(`*Observações:* ${order.notes}`);
  }
  if (order.clientName?.trim()) {
    lines.push('');
    lines.push(`*Nome:* ${order.clientName.trim()}`);
  }
  if (order.clientPhone?.trim()) {
    lines.push(`*Telefone:* ${order.clientPhone.trim()}`);
  }
  return lines.join('\n');
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export type OrderStatus = 'novo' | 'em atendimento' | 'separando' | 'finalizado';

export const ORDER_STATUSES: OrderStatus[] = ['novo', 'em atendimento', 'separando', 'finalizado'];

export const storeInfo = {
  name: 'Cuba & Café Tabacaria',
  address: 'Portal Sul Shopping — Av. dos Ipês, Jardins Lisboa',
  city: 'Goiânia — GO',
  cep: '74357-000',
  instagram: 'https://www.instagram.com/cubaportalsul/',
  instagramHandle: '@cubaportalsul',
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=Cuba+%26+Caf%C3%A9+Tabacaria+Portal+Sul+Shopping+Goi%C3%A2nia',
  wazeLink: 'https://waze.com/ul?q=Cuba%20%26%20Caf%C3%A9%20Tabacaria%20Portal%20Sul%20Shopping%20Goi%C3%A2nia&navigate=yes',
  whatsApp: WHATSAPP_NUMBER,
};
