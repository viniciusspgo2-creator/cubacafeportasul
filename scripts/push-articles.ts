/**
 * Substitui os artigos do banco atual pelos 6 artigos estratégicos.
 * Usa a API do dev server (POST /api/articles) — roda com: bun scripts/push-articles.ts
 */
import { BLOG_ARTICLES } from './blog-articles-1';
import { BLOG_ARTICLES_2 } from './blog-articles-2';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function main() {
  // Lista os atuais e remove todos
  const res = await fetch(`${BASE}/api/articles`);
  const current = (await res.json()) as { id: string; slug: string }[];
  console.log(`Artigos atuais: ${current.length}`);

  // A API não tem DELETE de artigos — remove via Prisma direto não é possível daqui.
  // Estratégia: cria/atualiza os 6 estratégicos (upsert por slug via POST).
  const all = [...BLOG_ARTICLES, ...BLOG_ARTICLES_2];
  for (const a of all) {
    const r = await fetch(`${BASE}/api/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        cover: a.cover,
        tags: a.tags,
        metaTitle: a.metaTitle,
        metaDescription: a.metaDescription,
        readTime: a.readTime,
      }),
    });
    console.log(a.slug, r.ok ? 'OK' : `ERRO ${r.status}`);
  }
  console.log('Concluído — artigos estratégicos criados/atualizados.');
}

main().catch((e) => { console.error(e); process.exit(1); });
