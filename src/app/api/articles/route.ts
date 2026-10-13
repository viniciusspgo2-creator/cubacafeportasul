import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';
import { parseModel, slugify } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export interface ArticleType {
  id: string; slug: string; title: string; excerpt: string; content: string;
  cover: string; tags: string[]; metaTitle: string; metaDescription: string;
  readTime: number; author?: string; createdAt: string; updatedAt: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (slug) {
      const article = await db.article.findUnique({ where: { slug } });
      if (!article) return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
      return NextResponse.json(parseModel<ArticleType>(article as unknown as Record<string, unknown>, ['tags']));
    }
    const search = searchParams.get('search');
    const where = search
      ? { OR: [
          { title: { contains: search } },
          { excerpt: { contains: search } },
          { tags: { contains: search } },
        ] }
      : {};
    const articles = await db.article.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(articles.map((a) => parseModel<ArticleType>(a as unknown as Record<string, unknown>, ['tags'])));
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao carregar artigos', detail: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();
  try {
    const body = await req.json();
    if (!body.title) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 });
    const baseSlug = slugify((body.slug || body.title).toString());
    const exists = await db.article.findUnique({ where: { slug: baseSlug } });
    const article = await db.article.create({
      data: {
        slug: exists ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug,
        title: body.title,
        excerpt: body.excerpt || '',
        content: body.content || '',
        cover: body.cover || '/photos/loja-balcao.webp',
        tags: JSON.stringify(body.tags || []),
        metaTitle: body.metaTitle || `${body.title} | Cuba & Café Tabacaria`,
        metaDescription: body.metaDescription || body.excerpt || '',
        readTime: Number(body.readTime) || 5,
        author: body.author || 'Equipe Cuba & Café',
      },
    });
    return NextResponse.json(parseModel<ArticleType>(article as unknown as Record<string, unknown>, ['tags']), { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao criar artigo', detail: String(e) }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'ID obrigatório para atualizar' }, { status: 400 });
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.excerpt !== undefined) data.excerpt = body.excerpt;
    if (body.content !== undefined) data.content = body.content;
    if (body.cover !== undefined) data.cover = body.cover;
    if (body.tags !== undefined) data.tags = JSON.stringify(body.tags);
    if (body.metaTitle !== undefined) data.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) data.metaDescription = body.metaDescription;
    if (body.readTime !== undefined) data.readTime = Number(body.readTime) || 5;
    if (body.author !== undefined) data.author = body.author;
    if (body.slug !== undefined) data.slug = slugify(body.slug.toString());
    const article = await db.article.update({ where: { id: body.id }, data });
    return NextResponse.json(parseModel<ArticleType>(article as unknown as Record<string, unknown>, ['tags']));
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao atualizar artigo', detail: String(e) }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    await db.article.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao excluir artigo', detail: String(e) }, { status: 400 });
  }
}
