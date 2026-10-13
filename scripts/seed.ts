/**
 * Seed — Cuba & Café Tabacaria
 * Catálogo baseado nas fotos reais da loja (Portal Sul Shopping, Goiânia)
 */
import { PrismaClient } from '@prisma/client';
import { BLOG_ARTICLES } from './blog-articles-1';
import { BLOG_ARTICLES_2 } from './blog-articles-2';

const db = new PrismaClient();

const P = (slug: string, name: string, category: string, price: number, oldPrice: number | null, description: string, longDesc: string, images: string[], tags: string[], featured: boolean, isNew: boolean, stock = 12, specs: Record<string, string> = {}) =>
  ({ slug, name, category, price, oldPrice, description, longDesc, images, tags, featured, isNew, stock, specs });

const products = [
  // ============ NARGUILES ============
  P('narguile-amazon-futura-preto', 'Narguile Amazon Future Preto', 'Narguiles', 449.9, 529.9,
    'Stem em alumínio maciço com difusor ajustável e vaso base larga. O clássico que nunca sai de cena.',
    'O Amazon Future é referência absoluta quando o assunto é custo-benefício premium. Fabricado em alumínio maciço usinado com acabamento anodizado fosco, traz difusor de fluxo ajustável, prato exclusivo e conexão de vedação em O-ring. O vaso em acrílico de base larga garante estabilidade total na mesa. Ideal tanto para quem está começando quanto para quem quer um narguilé de performance sem pagar absurdo.',
    ['/photos/narguiles-vitrine.webp', '/photos/narguiles-2.webp', '/photos/loja-balcao.webp'],
    ['narguile', 'amazon', 'stem alumínio', 'completo'], true, false, 8,
    { 'Altura': '52 cm', 'Material': 'Alumínio anodizado + acrílico', 'Inclui': 'Stem, vaso, prato, mangueira e rosh' }),
  P('narguile-zahrah-hijackers', 'Narguile Zahrah Hijackers Edition', 'Narguiles', 689.9, null,
    'Edição especial Zahrah com coluna alta, acabamento cromado e puxador ergonômico.',
    'A linha Hijackers da Zahrah é sinônimo de status no mundo do narguilé. Coluna alta com recalque interno em aço inox, acabamento cromado espelhado e detalhes torneados à mão. A tração é firme e o fluxo de ar, perfeitamente calibrado para sessões longas. Acompanha prato Zahrah original e conexões de vedação universais.',
    ['/photos/narguiles-2.webp', '/photos/narguiles-vitrine.webp'],
    ['narguile', 'zahrah', 'premium', 'edição'], true, false, 5,
    { 'Altura': '58 cm', 'Material': 'Aço inox + alumínio cromado', 'Origem': 'Importado' }),
  P('narguile-sanso-completo', 'Narguile Sanso Completo', 'Narguiles', 289.9, 349.9,
    'Kit completo Sanso: stem, vaso de vidro, mangueira lavável e pinça. Pronto para fumar.',
    'O Sanso é o narguilé que provou que qualidade não precisa custar caro. Stem em alumínio leve, vaso de vidro resistente com design curvado, mangueira de silicone lavável e pinça para carvão inclusas. Uma das linhas mais vendidas do Brasil, presente em milhares de sessões por todo o país. Perfeito para presentear ou começar com o pé direito.',
    ['/photos/narguiles-vitrine.webp', '/photos/roshs-vasos.webp'],
    ['narguile', 'sanso', 'kit completo', 'iniciante'], false, false, 15,
    { 'Altura': '48 cm', 'Inclui': 'Stem, vaso, mangueira, pinça e prato' }),
  P('vaso-aladin-mvp', 'Vaso Aladin MVP', 'Narguiles', 189.9, null,
    'Vaso de vidro borossilicato na cor âmbar. Compatível com stems padrão.',
    'O vaso Aladin MVP é reconhecido pela espessura de vidro acima da média e pela base estável que evita tombos. Vidro borossilicato premium na cor âmbar translúcida, gargalo universal compatível com a maioria dos stems nacionais e importados. Peça de reposição ou upgrade para dar novo visual ao seu conjunto.',
    ['/photos/roshs-vasos.webp', '/photos/narguiles-vitrine.webp'],
    ['vaso', 'aladin', 'vidro', 'reposição'], false, false, 10,
    { 'Material': 'Vidro borossilicato', 'Cor': 'Âmbar' }),
  P('rosh-tigre-ceramica', 'Rosh Tigre Cerâmica Funnell', 'Narguiles', 79.9, 99.9,
    'Rosh em cerâmica refratária com formato funnell e virabrequim anti-ressecamento.',
    'Rosh de cerâmica refratária de alta densidade com formato funnell, que distribui o calor de forma uniforme e evita queimas irregulares. O esmalte cerâmico de fácil limpeza resiste a choques térmicos e o revestimento antiaderente não transfere sabor. Compatível com folhas de alumínio e telhas HMD.',
    ['/photos/roshs-parede.webp', '/photos/roshs-vasos.webp'],
    ['rosh', 'cerâmica', 'funnell', 'rsh'], false, false, 20,
    { 'Material': 'Cerâmica refratária esmaltada', 'Formato': 'Funnell' }),

  // ============ ESSÊNCIAS ============
  P('essencia-fm-double-apple', 'Essência FM Double Apple 50g', 'Essências', 44.9, null,
    'A apple dupla clássica da FM Importado. Corpo denso, fumaça branca e sabor marcante.',
    'A FM Double Apple é a interpretação da FM Importado para o sabor mais icônico do universo do narguilé: a maçã dupla com anis. Notas frutadas intensas com o toque característico de erva-doce no final. Tabaco Virgínia de corte fino, muito consistente, produz fumaça branca e densa do início ao fim da sessão. Uma das essências mais vendidas da loja.',
    ['/photos/essencias-parede.webp', '/photos/essencias-2.webp'],
    ['essência', 'fm', 'double apple', 'tabaco'], true, false, 25,
    { 'Peso': '50g', 'Origem': 'Importado', 'Corte': 'Fino' }),
  P('essencia-nay-mango-tango', 'Essência NAY Mango Tango 50g', 'Essências', 42.9, null,
    'Manga tropical com fundo cítrico. Suave, doce e extremamente aromática.',
    'NAY é a linha que dominou as prateleiras do Brasil com qualidade e preço justo. O Mango Tango traz manga madura suculenta com um fundo cítrico que refresca a sessão inteira. Excelente sozinha ou como base para mixes frutados. Fumaça densa e sabor constante por até 40 minutos.',
    ['/photos/essencias-parede.webp', '/photos/essencias-2.webp'],
    ['essência', 'nay', 'manga', 'tropical'], false, false, 30,
    { 'Peso': '50g', 'Origem': 'Nacional', 'Perfil': 'Frutado tropical' }),
  P('essencia-zombie-hitman', 'Essência Zombie Hitman 50g', 'Essências', 49.9, null,
    'O lendário Hitman: mentol gelado com frutas vermelhas. Frio na medida certa.',
    'Zombie é marcas registrada quando o assunto é gelo. O Hitman combina frutas vermelhas com um mentol agressivo que gelifica a garganta sem perder o sabor. Para quem gosta de sessão forte e refrescante. Uma das essências mais pedidas por quem entende.',
    ['/photos/essencias-2.webp', '/photos/essencias-parede.webp'],
    ['essência', 'zombie', 'mentol', 'gelado'], true, false, 18,
    { 'Peso': '50g', 'Perfil': 'Mentolado intenso' }),
  P('essencia-pimp-berry', 'Essência Pimp Berry Mix 50g', 'Essências', 47.9, null,
    'Mix de frutas vermelhas com hortelã. Doce, fresco e viciante.',
    'A Pimp Berry Mix entrega o equilíbrio perfeito entre morango, framboesa e mirtilo com um acabamento de hortelã suave. Produz fumaça generosa e mantém o sabor estável na sessão toda. Linha importada com tabaco de alta qualidade e corte médio.',
    ['/photos/essencias-parede.webp'],
    ['essência', 'pimp', 'frutas vermelhas'], false, false, 14,
    { 'Peso': '50g', 'Perfil': 'Frutas vermelhas + hortelã' }),
  P('essencia-zomo-watermelon', 'Essência Zomo Watermelon 50g', 'Essências', 39.9, null,
    'Melancia fresca de verão. A Zomo prova que clássico é clássico.',
    'A Zomo Watermelon é daquelas essências que nunca decepcionam: melancia suculenta, doce na medida e refrescante. Uma opção excelente para o dia a dia, com tabaco de corte uniforme e fumaça branca. Compatível com qualquer sistema de rosh.',
    ['/photos/essencias-2.webp'],
    ['essência', 'zomo', 'melancia'], false, false, 22,
    { 'Peso': '50g', 'Perfil': 'Frutado' }),

  // ============ SEDAS ============
  P('seda-raw-black-kss', 'Seda RAW Black King Size Slim', 'Sedas', 12.9, null,
    'A seda mais icônica do mundo. Papel arroz ultrafino, queima lenta e sabor neutro.',
    'RAW Black é o topo da linha RAW: papel de arroz organicamente processado, ultrafino (slim), com queima extremamente lenta e sabor praticamente neutro. Sem cloro, sem aditivos desnecessários. Cada bloco traz 50 folhas com gum arábico natural. Para quem não aceita nada menos que o padrão ouro das sedas.',
    ['/photos/vitrine-boquinhas.webp', '/photos/headshop-estante.webp'],
    ['seda', 'raw', 'black', 'king size slim'], true, false, 40,
    { 'Folhas': '50', 'Tamanho': 'King Size Slim', 'Material': 'Papel de arroz' }),
  P('seda-ziggy-king-size', 'Seda Ziggy King Size', 'Sedas', 8.9, null,
    'Custo-benefício imbatível. Bloco com 50 folhas, queima uniforme.',
    'A Ziggy é a queridinha nacional: bloco com 50 folhas king size, papel de gramatura equilibrada que queima devagar e uniforme. Embalagem compacta que cabe em qualquer bolso. Ideal para o uso diário sem pesar no bolso.',
    ['/photos/vitrine-boquinhas.webp'],
    ['seda', 'ziggy', 'king size', '50 folhas'], false, false, 50,
    { 'Folhas': '50', 'Tamanho': 'King Size' }),
  P('seda-bambu-slim', 'Seda Bambu Slim', 'Sedas', 9.9, null,
    'Papel 100% natural de bambu. Eco-friendly com queima lenta.',
    'A seda de bambu é a escolha consciente: papel 100% natural de fibra de bambu, sem branqueamento, com coloração natural e queima lenta e limpa. Bloco com 50 folhas slim. Sabor neutro e textura agradável de manusear.',
    ['/photos/vitrine-boquinhas.webp'],
    ['seda', 'bambu', 'natural', 'eco'], false, false, 35,
    { 'Folhas': '50', 'Material': 'Fibra de bambu' }),
  P('seda-smoking-gold', 'Seda Smoking Gold King Size', 'Sedas', 11.9, null,
    'A linha premium da Smoking: papel finíssimo com gum dourado.',
    'Smoking Gold é tradição europeia em formato king size: papel finíssimo de queima uniforme, gum natural e marca dágua que garante qualidade autêntica. Bloco com 50 folhas. Uma das sedas mais respeitadas do mercado mundial.',
    ['/photos/vitrine-boquinhas.webp'],
    ['seda', 'smoking', 'gold'], false, false, 28,
    { 'Folhas': '50', 'Tamanho': 'King Size' }),

  // ============ TABACOS ============
  P('tabaco-backwoods-honey', 'Charuto Backwoods Honey', 'Tabacos', 34.9, null,
    'O clássico americano rústico. Folha de tabaco natural com aroma de mel.',
    'Backwoods é o charuto solto mais famoso dos Estados Unidos. Folha de tabaco 100% natural torcida à mão, formato rústico sem tubo, com aroma adocicado de mel. Unidade individual acondicionada em pouch. Produto importado original.',
    ['/photos/cigarrilhas-case.webp', '/photos/loja-prateleiras.webp'],
    ['charuto', 'backwoods', 'mel', 'importado'], true, false, 16,
    { 'Tipo': 'Charuto solto', 'Origem': 'EUA' }),
  P('tabaco-swisher-blunt', 'Swisher Sweets Blunt', 'Tabacos', 29.9, null,
    'Blunt pronto com folha reidratada. Suave e aromático, tradição americana.',
    'Swisher Sweets é uma das marcas mais tradicionais de blunts do mundo. Folha reidratada macia, sabor suave e levemente adocicado, pronto para uso. Embalagem individual hermética que preserva a umidade. Chegou na Cuba & Café direto dos EUA.',
    ['/photos/cigarrilhas-case.webp'],
    ['blunt', 'swisher', 'importado'], false, false, 20,
    { 'Tipo': 'Blunt', 'Origem': 'EUA' }),
  P('tabaco-acespades-red', 'Ace Spades Red Cigarillos', 'Tabacos', 24.9, null,
    'Cigarillos premium em lata. Corte fino e blend equilibrado.',
    'Ace Spades chegou forte no mercado americano de cigarillos: lata com 15 unidades, tabaco de corte fino e blend equilibrado entre força e aroma. Embalagem metálica que preserva o frescor por muito mais tempo.',
    ['/photos/cigarrilhas-case.webp', '/photos/vitrine-boquinhas.webp'],
    ['cigarillos', 'ace spades', 'lata'], false, true, 12,
    { 'Unidades': '15', 'Origem': 'EUA' }),

  // ============ HEADSHOP ============
  P('bong-acrilico-colorido', 'Bong Acrílico 25cm Colorido', 'Headshop', 89.9, null,
    'Bong de acrílico resistente com bocal removível e difusor. Cores sortidas.',
    'Bong de acrílico de alta resistência, 25cm de altura, com bocal removível para limpeza fácil e difusor embutido que filtra a fumaça. Disponível nas cores verde, laranja, azul e transparente (envie sua preferência na observação do pedido). Leve, durável e ideal para o dia a dia.',
    ['/photos/headshop-estante.webp', '/photos/loja-prateleiras.webp'],
    ['bong', 'acrílico', 'headshop'], false, false, 10,
    { 'Altura': '25 cm', 'Material': 'Acrílico' }),
  P('pite-metal-cromado', 'Pite de Metal Cromado', 'Headshop', 24.9, null,
    'Pite metálico desmontável com peneira inclusa. Compacto e à prova de quedas.',
    'Pite de metal cromado de 3 peças desmontáveis para limpeza total, com peneira metálica inclusa. Compacto, resistente a quedas e cabe no bolso. Uma das peças mais vendidas da nossa vitrine.',
    ['/photos/vitrine-boquinhas.webp', '/photos/acessorios-vitrine.webp'],
    ['pite', 'metal', 'headshop'], false, false, 30,
    { 'Material': 'Metal cromado', 'Peças': '3' }),
  P('moedor-grinder-metal', 'Moedor Grinder 4 Partes', 'Headshop', 54.9, 64.9,
    'Grinder de alumínio com 4 partes, peneira e raspador. Dentes afiados.',
    'Grinder de alumínio usinado com 4 partes: câmara de moagem com dentes afiados, tela de peneiramento, coletor de kief e raspador inclusa. Ímã central forte que mantém as partes alinhadas. Disponível em preto, prata e vermelho.',
    ['/photos/headshop-estante.webp', '/photos/acessorios-vitrine.webp'],
    ['grinder', 'moedor', 'alumínio'], true, false, 18,
    { 'Material': 'Alumínio', 'Partes': '4', 'Diâmetro': '50mm' }),
  P('isqueiro-torcha-lanterna', 'Isqueiro Torcha Lanterna Dupla', 'Headshop', 39.9, null,
    'Isqueiro de butano com chama dupla ajustável e jato potente.',
    'Isqueiro tipo lanterna com chama dupla de jato potente e altura ajustável, ideal para acender carvão, cachimbo e velas. Recarregável com butano comum. Corpo metálico com acabamento emborrachado. Acompanha na cor conforme disponibilidade.',
    ['/photos/acessorios-vitrine.webp'],
    ['isqueiro', 'lanterna', 'butano'], false, false, 25,
    { 'Chama': 'Dupla ajustável', 'Recarregável': 'Sim' }),

  // ============ CACHIMBOS ============
  P('cachimbo-madeira-macaúba', 'Cachimbo Madeira Macaúba', 'Cachimbos', 159.9, null,
    'Cachimbo artesanal em madeira macaúba com fornilho largo e bocal curvo.',
    'Cachimbo esculpido em madeira macaúba, madeira nobre brasileira de grão denso que resiste ao calor sem rachar. Fornilho largo para sessions longas, bocal curvo em acrílico com filtro de 9mm. Cada peça é única — o veio da madeira varia de unidade para unidade. Produção artesanal.',
    ['/photos/vitrine-boquinhas.webp', '/photos/headshop-estante.webp'],
    ['cachimbo', 'madeira', 'artesanal'], false, false, 6,
    { 'Material': 'Madeira macaúba', 'Filtro': '9mm' }),
  P('cachimbo-maestro-classic', 'Cachimbo Maestro Classic', 'Cachimbos', 219.9, null,
    'Linha italiana Maestro com bocal em metacrilato e fornilho entalhado.',
    'O Maestro Classic representa a tradição dos cachimbos europeus: fornilho entalhado em madeira tratada, bocal em metacrilato confortável e balanceamento perfeito entre peso e ergonomia. Acompanha saquinho de proteção. Ideal para colecionadores e apreciadores de tabaco de cachimbo.',
    ['/photos/vitrine-boquinhas.webp'],
    ['cachimbo', 'maestro', 'premium'], true, false, 4,
    { 'Bocal': 'Metacrilato', 'Origem': 'Tradição italiana' }),

  // ============ ACESSÓRIOS ============
  P('carvao-coco-3ks-1kg', 'Carvão de Coco 3K\'s 1kg', 'Acessórios', 64.9, null,
    'Carvão de coco premium 3K\'s. Queima longa, pouco resíduo, sem cheiro.',
    'O carvão 3K\'s é padrão internacional: carvão de casca de coco prensado, cubos de 25mm que queimam por até 2 horas, quase sem cinza e sem transferir cheiro para a sessão. Pacote de 1kg (aprox. 100 cubos). Compatível com qualquer HMD ou alumínio.',
    ['/photos/acessorios-vitrine.webp', '/photos/loja-prateleiras.webp'],
    ['carvão', 'coco', '3ks', 'hmd'], true, false, 22,
    { 'Peso': '1kg', 'Cubo': '25mm', 'Queima': '~2h' }),
  P('hmd-kaloud-lotus-style', 'HMD Gestor de Calor Premium', 'Acessórios', 119.9, null,
    'Gestor de calor estilo Kaloud Lotus em liga de alumínio. Zero alumínio na sessão.',
    'O HMD (Heat Management Device) substitui o papel alumínio: você coloca os cubos dentro do gestor e controla o calor apenas girando a tampa. Liga de alumínio maciço com furos calibrados, retém o calor por muito mais tempo e mantém o rosh limpo. Compatível com roshs funnell e egípcios.',
    ['/photos/roshs-parede.webp', '/photos/acessorios-vitrine.webp'],
    ['hmd', 'kaloud', 'gestor de calor'], false, false, 14,
    { 'Material': 'Liga de alumínio', 'Compatível': 'Funnell e egípcio' }),
  P('mangueira-silicone-led', 'Mangueira Silicone c/ Ponteira LED', 'Acessórios', 59.9, null,
    'Mangueira de silicone lavável com ponteira alumínio e anel de LED colorido.',
    'Mangueira de silicone grau alimentício, 1,8m, totalmente lavável, com ponteira de alumínio e anel de LED colorido que pisca durante a sessão. Conexão universal compatível com a maioria dos narguilés. Higiene garantida com lavagem fácil.',
    ['/photos/narguiles-vitrine.webp', '/photos/acessorios-vitrine.webp'],
    ['mangueira', 'silicone', 'led'], false, true, 16,
    { 'Comprimento': '1,8m', 'Material': 'Silicone + alumínio' }),
  P('alcafolha-aluminio-premium', 'Alumínio Premium Cortado (100un)', 'Acessórios', 19.9, null,
    'Folhas de alumínio pré-cortadas e furadas. Praticidade na sessão.',
    'Pacote com 100 folhas de alumínio pré-cortadas no tamanho ideal para roshs padrão. Praticidade total: é só posicionar e acender o carvão. Espessura reforçada que não rasga fácil.',
    ['/photos/acessorios-vitrine.webp'],
    ['alumínio', 'folhas', 'prático'], false, false, 40,
    { 'Unidades': '100' }),

  // ============ KITS ============
  P('kit-narguile-iniciante', 'Kit Narguilé Iniciante Completo', 'Kits', 399.9, 469.9,
    'Narguilé + rosh + carvão + essência + alumínio. Tudo que você precisa em um kit.',
    'O kit perfeito para começar: narguilé completo (stem, vaso, prato e mangueira), rosh de cerâmica, carvão de coco, essência à sua escolha (indique na observação) e alumínio cortado. Montamos tudo e enviamos pronto para a primeira sessão. Economia de quase R$100 comparado à compra separada.',
    ['/photos/narguiles-vitrine.webp', '/photos/roshs-vasos.webp', '/photos/essencias-parede.webp'],
    ['kit', 'iniciante', 'completo', 'presente'], true, false, 10,
    { 'Inclui': 'Narguilé, rosh, carvão, essência e alumínio' }),
  P('kit-presente-premium', 'Kit Presente Premium Cuba & Café', 'Presentes', 549.9, null,
    'Edição de presente com narguilé Zahrah, essências importadas e embalagem especial.',
    'Kit pensado para presentear quem ama o universo smoke: narguilé Zahrah completo, duas essências importadas (à escolha), carvão de coco premium, gestor de calor e embalagem de presente especial Cuba & Café com cartão personalizado. Experiência completa em uma caixa.',
    ['/photos/narguiles-2.webp', '/photos/essencias-parede.webp'],
    ['kit', 'presente', 'premium', 'zahrah'], true, false, 5,
    { 'Inclui': 'Narguilé, 2 essências, carvão, HMD e embalagem' }),
  P('kit-headshop-starter', 'Kit Headshop Starter', 'Kits', 179.9, null,
    'Pite metal + sedas RAW + grinder + isqueiro lanterna. Combo essencial.',
    'Combo essencial de headshop: pite de metal cromado, seda RAW Black, grinder de alumínio 4 partes e isqueiro lanterna de chama dupla. Tudo o que você precisa em um só pedido, com desconto de combo.',
    ['/photos/headshop-estante.webp', '/photos/vitrine-boquinhas.webp'],
    ['kit', 'headshop', 'combo'], false, false, 8,
    { 'Inclui': 'Pite, sedas, grinder e isqueiro' }),
];

const categories = [
  { slug: 'narguiles', name: 'Narguiles', icon: 'Flame', desc: 'Stems, vasos e conjuntos completos' },
  { slug: 'headshop', name: 'Headshop', icon: 'Sparkles', desc: 'Bongs, pites, grinders e mais' },
  { slug: 'cachimbos', name: 'Cachimbos', icon: 'Pipe', desc: 'Cachimbos artesanais e premium' },
  { slug: 'sedas', name: 'Sedas', icon: 'Scroll', desc: 'RAW, Ziggy, Bambu e importadas' },
  { slug: 'tabacos', name: 'Tabacos', icon: 'Leaf', desc: 'Charutos, blunts e cigarillos' },
  { slug: 'essencias', name: 'Essências', icon: 'Citrus', desc: 'FM, NAY, Zombie, Zomo e mais' },
  { slug: 'acessorios', name: 'Acessórios', icon: 'Wrench', desc: 'Carvão, HMD, mangueiras e alumínio' },
  { slug: 'kits', name: 'Kits', icon: 'Package', desc: 'Combos prontos com desconto' },
  { slug: 'presentes', name: 'Presentes', icon: 'Gift', desc: 'Edições especiais para presentear' },
  { slug: 'novidades', name: 'Novidades', icon: 'Zap', desc: 'As últimas chegadas da loja' },
];

// ============ BLOG (6 artigos estratégicos SEO/GEO) ============
const articles = [...BLOG_ARTICLES, ...BLOG_ARTICLES_2];

async function main() {
  console.log('Limpando banco...');
  await db.visit.deleteMany();
  await db.setting.deleteMany();
  await db.financeEntry.deleteMany();
  await db.supplier.deleteMany();
  await db.client.deleteMany();
  await db.order.deleteMany();
  await db.article.deleteMany();
  await db.product.deleteMany();

  console.log('Inserindo produtos...');
  for (const p of products) {
    await db.product.create({
      data: {
        slug: p.slug, name: p.name, category: p.category,
        description: p.description, longDesc: p.longDesc,
        price: p.price, oldPrice: p.oldPrice,
        images: JSON.stringify(p.images), tags: JSON.stringify(p.tags),
        specs: JSON.stringify(p.specs), stock: p.stock,
        featured: p.featured, isNew: p.isNew,
      },
    });
  }

  console.log('Inserindo categorias (settings)...');
  await db.setting.create({ data: { key: 'categories', value: JSON.stringify(categories) } });
  await db.setting.create({ data: { key: 'seo', value: JSON.stringify({
    title: 'Cuba & Café Tabacaria | Narguiles, Headshop e Produtos Premium — Goiânia',
    description: 'Tabacaria premium no Portal Sul Shopping, Goiânia. Narguiles, essências, sedas, charutos e acessórios. Enviamos para todo o Brasil.',
    keywords: 'tabacaria goiânia, narguile, headshop, essências, sedas, charutos, cuba e café, portal sul',
  }) } });

  console.log('Inserindo artigos...');
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    await db.article.create({
      data: {
        slug: a.slug, title: a.title, excerpt: a.excerpt,
        content: a.content,
        cover: a.cover,
        tags: JSON.stringify(a.tags),
        metaTitle: a.metaTitle,
        metaDescription: a.metaDescription,
        readTime: a.readTime,
        author: 'Equipe Cuba & Café',
        createdAt: new Date(Date.now() - (i + 1) * 3 * 24 * 3600 * 1000),
      },
    });
  }

  console.log('Inserindo pedidos demo...');
  const demoOrders = [
    { code: 'CC-1001', clientName: 'Rafael Mendes', clientPhone: '(62) 99812-3344', items: JSON.stringify([{ name: 'Narguile Amazon Future Preto', qty: 1, price: 449.9 }, { name: "Carvão de Coco 3K's 1kg", qty: 1, price: 64.9 }]), notes: 'Entrega por Uber até Setor Bueno', total: 514.8, status: 'finalizado' },
    { code: 'CC-1002', clientName: 'Camila Duarte', clientPhone: '(62) 99634-1122', items: JSON.stringify([{ name: 'Essência FM Double Apple 50g', qty: 2, price: 44.9 }, { name: 'Essência Zombie Hitman 50g', qty: 1, price: 49.9 }]), notes: '', total: 139.7, status: 'em atendimento' },
    { code: 'CC-1003', clientName: 'Lucas Ferraz', clientPhone: '(62) 98145-7788', items: JSON.stringify([{ name: 'Kit Narguilé Iniciante Completo', qty: 1, price: 399.9 }]), notes: 'Presente — embalar para presente', total: 399.9, status: 'separando' },
    { code: 'CC-1004', clientName: 'Bruno Alcantara', clientPhone: '(62) 98220-4567', items: JSON.stringify([{ name: 'Seda RAW Black King Size Slim', qty: 3, price: 12.9 }, { name: 'Pite de Metal Cromado', qty: 1, price: 24.9 }]), notes: '', total: 63.6, status: 'novo' },
    { code: 'CC-1005', clientName: 'Marina Coelho', clientPhone: '(62) 99777-8800', items: JSON.stringify([{ name: 'Kit Presente Premium Cuba & Café', qty: 1, price: 549.9 }]), notes: 'Enviar para todo Brasil via correios', total: 549.9, status: 'em atendimento' },
  ];
  for (let i = 0; i < demoOrders.length; i++) {
    const o = demoOrders[i];
    await db.order.create({ data: { ...o, createdAt: new Date(Date.now() - i * 2 * 24 * 3600 * 1000) } });
  }

  console.log('Inserindo clientes...');
  const demoClients = [
    { name: 'Rafael Mendes', phone: '(62) 99812-3344', orders: 8, spent: 2847.5, notes: 'Cliente VIP — colecionador de stems' },
    { name: 'Camila Duarte', phone: '(62) 99634-1122', orders: 5, spent: 890.3, notes: 'Prefere essências frutadas' },
    { name: 'Lucas Ferraz', phone: '(62) 98145-7788', orders: 3, spent: 745.6, notes: 'Indicou 4 amigos' },
    { name: 'Bruno Alcantara', phone: '(62) 98220-4567', orders: 12, spent: 1320.0, notes: 'Compra sedas semanalmente' },
    { name: 'Marina Coelho', phone: '(62) 99777-8800', orders: 2, spent: 1099.8, notes: 'Presentes corporativos' },
  ];
  for (const c of demoClients) await db.client.create({ data: c });

  console.log('Inserindo fornecedores...');
  const demoSuppliers = [
    { name: 'FM Importado Distribuidora', contact: 'comercial@fmimportado.com.br / (11) 4002-8922', products: 'Essências FM, NAY, Zomo', lastOrder: 4800 },
    { name: 'Zahrah Brasil', contact: 'vendas@zahrahbrasil.com / (11) 3555-1010', products: 'Narguiles Zahrah, roshs, vasos', lastOrder: 7250 },
    { name: 'Raw Store Distribuição', contact: 'atendimento@rawstore.com.br / (21) 3232-7788', products: 'Sedas RAW, grinders, acessórios', lastOrder: 3120 },
    { name: 'Backwoods Import BR', contact: 'contato@backwoodsimport.com / (11) 99123-4567', products: 'Charutos Backwoods, Swisher, Ace Spades', lastOrder: 2980 },
  ];
  for (const s of demoSuppliers) await db.supplier.create({ data: s });

  console.log('Inserindo financeiro...');
  const fin = [
    { type: 'entrada', category: 'Vendas Balcão', description: 'Vendas semana 01 — loja física', amount: 8640.5, status: 'pago', dueDate: new Date(Date.now() - 10 * 864e5) },
    { type: 'entrada', category: 'Vendas WhatsApp', description: 'Pedidos enviados via WhatsApp', amount: 4210.0, status: 'pago', dueDate: new Date(Date.now() - 7 * 864e5) },
    { type: 'entrada', category: 'Vendas Balcão', description: 'Vendas semana 02 — loja física', amount: 9130.9, status: 'pago', dueDate: new Date(Date.now() - 3 * 864e5) },
    { type: 'entrada', category: 'Vendas WhatsApp', description: 'Pedido kit presente corporativo', amount: 1649.7, status: 'pendente', dueDate: new Date(Date.now() + 5 * 864e5) },
    { type: 'saida', category: 'Fornecedores', description: 'Reposição essências FM/NAY', amount: 4800.0, status: 'pago', dueDate: new Date(Date.now() - 9 * 864e5) },
    { type: 'saida', category: 'Fornecedores', description: 'Lote narguiles Zahrah', amount: 7250.0, status: 'pendente', dueDate: new Date(Date.now() + 8 * 864e5) },
    { type: 'saida', category: 'Aluguel', description: 'Aluguel ponto Portal Sul Shopping', amount: 3800.0, status: 'pago', dueDate: new Date(Date.now() - 5 * 864e5) },
    { type: 'saida', category: 'Despesas', description: 'Energia, água e internet', amount: 940.0, status: 'pago', dueDate: new Date(Date.now() - 4 * 864e5) },
    { type: 'saida', category: 'Marketing', description: 'Impulsionamento Instagram', amount: 600.0, status: 'pendente', dueDate: new Date(Date.now() + 2 * 864e5) },
  ];
  for (const f of fin) await db.financeEntry.create({ data: f });

  console.log('Inserindo métricas de visita demo...');
  const actions = ['visit', 'visit', 'visit', 'product_view', 'product_view', 'order_sent', 'search'];
  for (let d = 29; d >= 0; d--) {
    const count = 40 + Math.floor(Math.random() * 60) + (d < 7 ? 30 : 0);
    for (let i = 0; i < count; i++) {
      await db.visit.create({
        data: {
          path: '/', action: actions[Math.floor(Math.random() * actions.length)],
          term: actions[Math.floor(Math.random() * actions.length)] === 'search' ? ['narguile','seda','fm','carvão','backwoods'][Math.floor(Math.random()*5)] : '',
          createdAt: new Date(Date.now() - d * 864e5 - Math.random() * 864e5),
        },
      });
    }
  }

  const counts = {
    products: await db.product.count(),
    articles: await db.article.count(),
    orders: await db.order.count(),
    clients: await db.client.count(),
    suppliers: await db.supplier.count(),
    finance: await db.financeEntry.count(),
    visits: await db.visit.count(),
  };
  console.log('SEED OK:', counts);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
