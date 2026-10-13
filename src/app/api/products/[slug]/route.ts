import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';
import { parseProduct } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

async function findProduct(slugOrId: string) {
  const bySlug = await db.product.findUnique({ where: { slug: slugOrId } });
  if (bySlug) return bySlug;
  return db.product.findUnique({ where: { id: slugOrId } });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await findProduct(slug);
  if (!product) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
  await db.product.update({ where: { id: product.id }, data: { views: { increment: 1 } } }).catch(() => null);
  return NextResponse.json(parseProduct(product));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!requireAdmin(req)) return unauthorized();
  const { slug } = await params;
  const existing = await findProduct(slug);
  if (!existing) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
  try {
    const body = await req.json();
    const product = await db.product.update({
      where: { id: existing.id },
      data: {
        name: body.name ?? existing.name,
        category: body.category ?? existing.category,
        description: body.description ?? existing.description,
        longDesc: body.longDesc ?? existing.longDesc,
        price: body.price !== undefined ? Number(body.price) : existing.price,
        oldPrice: body.oldPrice !== undefined ? (body.oldPrice ? Number(body.oldPrice) : null) : existing.oldPrice,
        images: body.images !== undefined ? JSON.stringify(body.images) : existing.images,
        tags: body.tags !== undefined ? JSON.stringify(body.tags) : existing.tags,
        specs: body.specs !== undefined ? JSON.stringify(body.specs) : existing.specs,
        stock: body.stock !== undefined ? Number(body.stock) : existing.stock,
        featured: body.featured !== undefined ? !!body.featured : existing.featured,
        isNew: body.isNew !== undefined ? !!body.isNew : existing.isNew,
        active: body.active !== undefined ? !!body.active : existing.active,
      },
    });
    return NextResponse.json(parseProduct(product));
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao atualizar', detail: String(e) }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!requireAdmin(_req)) return unauthorized();
  const { slug } = await params;
  const existing = await findProduct(slug);
  if (!existing) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
  await db.product.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
