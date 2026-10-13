/**
 * Substitui os artigos atuais pelos 6 estratégicos — via Prisma direto.
 * Uso: bun scripts/push-articles-local.ts
 * Obs.: roda com o client gerado atual; o campo `author` entra no seed (deploy Neon).
 */
import { PrismaClient } from '@prisma/client';
import { BLOG_ARTICLES } from './blog-articles-1';
import { BLOG_ARTICLES_2 } from './blog-articles-2';

const db = new PrismaClient();

async function main() {
  const before = await db.article.count();
  await db.article.deleteMany();
  const all = [...BLOG_ARTICLES, ...BLOG_ARTICLES_2];
  for (let i = 0; i < all.length; i++) {
    const a = all[i];
    await db.article.create({
      data: {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        cover: a.cover,
        tags: JSON.stringify(a.tags),
        metaTitle: a.metaTitle,
        metaDescription: a.metaDescription,
        readTime: a.readTime,
        createdAt: new Date(Date.now() - (i + 1) * 3 * 24 * 3600 * 1000),
      },
    });
  }
  const after = await db.article.count();
  console.log(`Artigos: ${before} → ${after}`);
  for (const a of all) console.log(' ✓', a.slug);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
