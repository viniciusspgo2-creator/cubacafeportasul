import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cubacafe.com.br').replace(/\/$/, '');

/**
 * sitemap.xml — páginas institucionais + produtos + artigos do blog.
 * Com try/catch e fallback seguro: o build NUNCA quebra se o banco
 * estiver vazio ou inacessível no primeiro deploy (Vercel/Neon).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Páginas públicas fixas (o site usa hash routes — urls canônicas com /#/)
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/#/catalogo`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/#/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/#/glossario`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/#/categoria/narguiles`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/#/categoria/essencias`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/#/categoria/sedas`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/#/categoria/tabacos`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/#/categoria/headshop`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/#/categoria/cachimbos`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/#/categoria/acessorios`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/#/categoria/kits`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];

  try {
    const [products, articles] = await Promise.all([
      db.product.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 500,
      }),
      db.article.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 200,
      }),
    ]);

    const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/#/produto/${p.slug}`,
      lastModified: p.updatedAt ?? now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${SITE_URL}/#/blog/${a.slug}`,
      lastModified: a.updatedAt ?? now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [...staticPages, ...productUrls, ...articleUrls];
  } catch {
    // Banco vazio/inacessível no primeiro deploy — devolve só as páginas fixas
    return staticPages;
  }
}
