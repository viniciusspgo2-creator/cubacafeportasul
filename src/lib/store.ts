'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BagItem {
  slug: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  note?: string;
}

interface BagState {
  items: BagItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: Omit<BagItem, 'qty' | 'note'>, qty?: number) => void;
  removeItem: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  setNote: (slug: string, note: string) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useBag = create<BagState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      setOpen: (open) => set({ open }),
      addItem: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.slug === item.slug);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.slug === item.slug ? { ...i, qty: Math.min(i.qty + qty, 99) } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, qty }] };
        }),
      removeItem: (slug) => set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      setQty: (slug, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.slug === slug ? { ...i, qty: Math.max(0, Math.min(qty, 99)) } : i))
            .filter((i) => i.qty > 0),
        })),
      setNote: (slug, note) =>
        set((state) => ({ items: state.items.map((i) => (i.slug === slug ? { ...i, note } : i)) })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      count: () => get().items.reduce((s, i) => s + i.qty, 0),
    }),
    { name: 'cubacafe-bag' }
  )
);

export const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

/** Estado global de UI (chat assistente, dock flutuante) */
interface UIState {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
}

export const useUI = create<UIState>()((set) => ({
  chatOpen: false,
  setChatOpen: (chatOpen) => set({ chatOpen }),
}));
