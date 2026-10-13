import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();
  const now = Date.now();
  const days: { date: string; visits: number; views: number; orders: number }[] = [];

  for (let d = 13; d >= 0; d--) {
    const start = new Date(now - d * 864e5);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 864e5);
    const [visits, views, orders] = await Promise.all([
      db.visit.count({ where: { action: 'visit', createdAt: { gte: start, lt: end } } }),
      db.visit.count({ where: { action: 'product_view', createdAt: { gte: start, lt: end } } }),
      db.visit.count({ where: { action: 'order_sent', createdAt: { gte: start, lt: end } } }),
    ]);
    days.push({
      date: start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      visits, views, orders,
    });
  }

  const [totalProducts, totalOrders, totalArticles] = await Promise.all([
    db.product.count(), db.order.count(), db.article.count(),
  ]);

  const [visits, productViews, orderSends, searches] = await Promise.all([
    db.visit.count({ where: { action: 'visit' } }),
    db.visit.count({ where: { action: 'product_view' } }),
    db.visit.count({ where: { action: 'order_sent' } }),
    db.visit.count({ where: { action: 'search' } }),
  ]);

  // Top produtos mais vistos
  const topProducts = await db.product.findMany({
    orderBy: { views: 'desc' }, take: 6,
    select: { name: true, views: true, category: true, price: true },
  });

  // Top buscas
  const recentSearches = await db.visit.findMany({
    where: { action: 'search', term: { not: '' } },
    orderBy: { createdAt: 'desc' }, take: 60,
    select: { term: true },
  });
  const searchCount: Record<string, number> = {};
  for (const s of recentSearches) {
    const t = s.term.toLowerCase().trim();
    if (t) searchCount[t] = (searchCount[t] || 0) + 1;
  }
  const topSearches = Object.entries(searchCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([term, count]) => ({ term, count }));

  // Status dos pedidos
  const ordersByStatus = await db.order.groupBy({ by: ['status'], _count: { status: true } });

  // Receita estimada (pedidos)
  const orders = await db.order.findMany({ select: { total: true, createdAt: true, status: true } });
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const revenueLast30 = orders
    .filter((o) => o.createdAt.getTime() > now - 30 * 864e5)
    .reduce((s, o) => s + o.total, 0);

  // Financeiro resumo
  const entries = await db.financeEntry.findMany();
  const entradas = entries.filter((e) => e.type === 'entrada' && e.status === 'pago').reduce((s, e) => s + e.amount, 0);
  const saidas = entries.filter((e) => e.type === 'saida' && e.status === 'pago').reduce((s, e) => s + e.amount, 0);

  const conversion = visits > 0 ? ((orderSends / visits) * 100) : 0;

  return NextResponse.json({
    metrics: {
      visits, productViews, orderSends, searches,
      totalProducts, totalOrders, totalArticles,
      revenue, revenueLast30, conversion,
      entradas, saidas, saldo: entradas - saidas,
    },
    days,
    topProducts,
    topSearches,
    ordersByStatus: ordersByStatus.map((o) => ({ status: o.status, count: o._count.status })),
  });
}
