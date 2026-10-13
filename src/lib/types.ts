export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  longDesc: string;
  price: number;
  oldPrice?: number | null;
  images: string[];
  tags: string[];
  specs: Record<string, string>;
  stock: number;
  featured: boolean;
  isNew: boolean;
  views: number;
  active: boolean;
  createdAt?: string;
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  desc: string;
}

export interface Order {
  id: string;
  code: string;
  clientName: string;
  clientPhone: string;
  items: { name: string; qty: number; price: number }[];
  notes: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  readTime: number;
  author?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  notes: string;
  orders: number;
  spent: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  products: string;
  lastOrder: number;
  createdAt: string;
}

export interface FinanceEntry {
  id: string;
  type: 'entrada' | 'saida';
  category: string;
  description: string;
  amount: number;
  status: string;
  dueDate?: string | null;
  createdAt: string;
}
