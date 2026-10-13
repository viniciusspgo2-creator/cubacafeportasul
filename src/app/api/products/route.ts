import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';
import { parseProduct, slugify } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');
  const limit = parseInt(searchParams.get('limit') || '0');

  const where: Record<string, unknown> = { active: true };
  if (category && category !== 'todos') {
    if (category === 'novidades') {
      where.OR = [{ isNew: true }];
    } else if (category === 'presentes') {
      where.OR = [
        { category: { equals: 'Presentes' } },
        { tags: { contains: 'presente' } },
        { name: { contains: 'presente' } },
      ];
    } else {
      where.category = { equals: category };
    }
  }
  if (search) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: q } },
      { category: { contains: q } },
    ];
  }
  if (featured === 'true') where.featured = true;

  const products = await db.product.findMany({
    where,
    orderBy: [{ featured: 'desc' }, { views: 'desc' }, { createdAt: 'desc' }],
    ...(limit > 0 ? { take: limit } : {}),
  });

  return NextResponse.json(products.map(parseProduct));
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });
    const base = slugify(body.slug || body.name);
    const exists = await db.product.findUnique({ where: { slug: base } });
    const finalSlug = exists ? `${base}-${Date.now().toString(36)}` : base;
    const product = await db.product.create({
      data: {
        slug: finalSlug,
        name: body.name,
        category: body.category || 'Acessórios',
        description: body.description || '',
        longDesc: body.longDesc || '',
        price: Number(body.price) || 0,
        oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
        images: JSON.stringify(body.images || []),
        tags: JSON.stringify(body.tags || []),
        specs: JSON.stringify(body.specs || {}),
        stock: Number(body.stock) || 0,
        featured: !!body.featured,
        isNew: body.isNew !== undefined ? !!body.isNew : true,
      },
    });
    return NextResponse.json(parseProduct(product), { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao criar produto', detail: String(e) }, { status: 400 });
  }
}
