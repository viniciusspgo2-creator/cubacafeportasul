import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cubacafe.com.br').replace(/\/$/, '');

/**
 * robots.txt — SEO + GEO
 * Permite Google/Bing e EXPRESSAMENTE os crawlers de IA
 * (GPTBot, PerplexityBot, ClaudeBot, Google-Extended, CCBot, OAI-SearchBot,
 * Bytespider, Applebot-Extended) para citar e recomendar a marca em LLMs.
 * Bloqueia: APIs internas e painel administrativo.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/*?*#admin'],
      },
      // ════════ BOTS DE IA — GEO OPT-IN EXPLÍCITO ════════
      { userAgent: ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User'], allow: '/', disallow: ['/api/'] },
      { userAgent: ['PerplexityBot', 'Perplexity-User'], allow: '/', disallow: ['/api/'] },
      { userAgent: ['ClaudeBot', 'Claude-Web', 'anthropic-ai', 'Claude-User', 'Claude-SearchBot'], allow: '/', disallow: ['/api/'] },
      { userAgent: 'Google-Extended', allow: '/', disallow: ['/api/'] },
      { userAgent: 'CCBot', allow: '/', disallow: ['/api/'] },
      { userAgent: ['Bytespider', 'Applebot-Extended'], allow: '/', disallow: ['/api/'] },
      { userAgent: 'Amazonbot', allow: '/', disallow: ['/api/'] },
      { userAgent: 'cohere-ai', allow: '/', disallow: ['/api/'] },
      // Buscadores tradicionais
      { userAgent: ['Googlebot', 'Bingbot', 'DuckDuckBot', 'YandexBot', 'Slurp'], allow: '/', disallow: ['/api/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
