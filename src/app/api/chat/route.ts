import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mensagem inválida' }, { status: 400 });
    }

    // Busca produtos relevantes no catálogo (indexação automática do chatbot)
    const terms = message.toLowerCase().split(/\s+/).filter((t: string) => t.length > 2);
    const allProducts = await db.product.findMany({ take: 60, orderBy: { featured: 'desc' } });

    const matched = allProducts.filter((p) => {
      const hay = `${p.name} ${p.category} ${p.description} ${p.tags}`.toLowerCase();
      return terms.some((t: string) => hay.includes(t));
    }).slice(0, 12);

    const catalogContext = matched.length
      ? matched.map((p) => {
          const price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price);
          return `- ${p.name} | Categoria: ${p.category} | ${price} | ${p.stock > 0 ? 'Disponível' : 'Sob consulta'} | slug: ${p.slug}`;
        }).join('\n')
      : 'Nenhum produto encontrado por busca direta.';

    const categoryList = 'Narguiles, Headshop, Cachimbos, Sedas, Tabacos, Essências, Acessórios, Kits, Presentes, Novidades';

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `Você é o "Cuba", assistente virtual da Cuba & Café Tabacaria — uma tabacaria premium localizada no Portal Sul Shopping, Av. dos Ipês, Jardins Lisboa, Goiânia-GO, CEP 74357-000.

Sua personalidade: descontraída, expert no universo smoke (narguilé, headshop, sedas, charutos), direta e prestativa. Fale português brasileiro informal mas profissional. Use no máximo 2-3 emojis por resposta. Nunca seja robótica.

REGRAS:
- Você recomenda produtos do catálogo abaixo quando fizer sentido (cite nome e preço).
- Se o cliente pedir algo que não está no catálogo, diga que pode verificar disponibilidade na loja e sugira chamar no WhatsApp ou visitar.
- Informações úteis: enviamos para todo o Brasil, entregas locais via Uber/99/InDrive, atendimento personalizado na loja física.
- Idade mínima: 18 anos. Produtos destinados a maiores de 18 anos.
- Pedidos são feitos pelo site (sacola → WhatsApp) ou diretamente no WhatsApp: +55 62 8263-3610. Instagram: @cubaportalsul
- Se o usuário pedir para ver um produto, sugira clicar no produto abaixo para abrir a página dele.
- Responda de forma curta e objetiva (máximo 120 palavras), a menos que peçam detalhes.

CATÁLOGO ATUAL DO ESTOQUE (atualizado automaticamente):
${catalogContext}

CATEGORIAS DA LOJA: ${categoryList}`,
        },
        ...(Array.isArray(history) ? history.slice(-6).map((h: { role: string; content: string }) => ({
          role: (h.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: h.content,
        })) : []),
        { role: 'user', content: message },
      ],
      thinking: { type: 'disabled' },
    });

    const reply = completion.choices[0]?.message?.content || 'Não consegui processar sua mensagem. Tente novamente!';

    // Registra busca para métricas
    await db.visit.create({ data: { path: '/chat', action: 'search', term: message.slice(0, 100) } }).catch(() => null);

    return NextResponse.json({
      reply,
      products: matched.slice(0, 4).map((p) => ({
        slug: p.slug, name: p.name, price: p.price, image: (JSON.parse(p.images || '[]')[0]) || '', category: p.category,
      })),
    });
  } catch (e) {
    console.error('Chat error:', e);
    return NextResponse.json({ error: 'Erro no assistente', reply: 'Ops! Tive um problema para responder. Tente novamente em instantes ou chame no WhatsApp (62) 8263-3610.' }, { status: 500 });
  }
}
