import type { Product } from './types';

/** Marcas conhecidas — usadas para detectar a marca a partir do nome/tags */
const KNOWN_BRANDS = [
  'FM', 'NAY', 'Zombie', 'Zahrah', 'RAW', 'OCB', 'Smoking', 'Zomo', 'Backwoods',
  'Aladin', 'Mr Wood', 'Tigre', 'Squadafum', 'Blunt', 'Black Erva', 'Papelito',
  'Tatu du Bem', 'Bem Bolado', 'ZGY', 'Tabaquito', 'La Revolucion', 'Palheiros',
  'Maestro', 'Ziggy', 'Swag', 'Dark Side', 'Tensor', 'Element', 'Khalil Mamoon',
  'Olla', 'Amazon Hookah', 'Hond', 'Regal', 'Maklaud', 'Coconara', 'Three Kings',
  'Coco Brasil', 'Biran', 'Rosh', 'Head Natural',
];

const GENERIC_TAGS = new Set([
  'narguile', 'narguilé', 'kit completo', 'iniciante', 'essência', 'cerâmica', 'funnell',
  'rsh', 'vaso', 'vidro', 'reposição', 'tabaco', 'seda', 'papel', 'king size', 'slim',
  'carvão', 'coco', 'importado', 'nacional', 'presente', 'kit', 'headshop', 'cachimbo',
  'madeira', 'acessório', 'bong', 'grinder', 'pite', 'isqueiro', 'lanterna', 'moedor',
  'alumínio', 'hmd', 'gestor', 'calor', 'telha', 'boquilha', 'mangueira', 'prato',
  'pinça', 'stem', 'charuto', 'blunt', 'cigarillo', 'erva', 'mentol', 'frutado', 'doce',
  'forte', 'suave', 'promoção', 'lançamento', 'mais vendido', 'double apple', 'manga',
  'tropical', 'americano', 'premium', 'tradicional', 'artesanal',
]);

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Detecta a marca do produto (tags → nome → primeira tag útil). Null se não houver. */
export function getBrand(p: Product): string | null {
  const inTags = p.tags?.find((t) =>
    KNOWN_BRANDS.some((b) => t.toLowerCase() === b.toLowerCase())
  );
  if (inTags) return capitalize(inTags.toLowerCase() === 'fm' ? 'FM' : inTags.toLowerCase() === 'nay' ? 'NAY' : inTags.toLowerCase() === 'zgy' ? 'ZGY BRASIL' : inTags);

  const inName = KNOWN_BRANDS.find((b) =>
    new RegExp(`\\b${b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(p.name)
  );
  if (inName) return inName.toUpperCase() === inName ? inName : capitalize(inName);

  const useful = p.tags?.find((t) => !GENERIC_TAGS.has(t.toLowerCase()) && t.length > 2);
  return useful ? capitalize(useful) : null;
}

export interface Installment {
  n: number;
  value: number;
  interestFree: boolean;
}

/**
 * Parcelamento configurável no admin (specs.parcelas + specs.juros).
 * Padrão: 3x sem juros para produtos a partir de R$ 60.
 */
export function getInstallments(p: Product): Installment | null {
  const configured = parseInt(p.specs?.parcelas || '', 10);
  const juros = (p.specs?.juros || '').toLowerCase().trim();
  const interestFree = juros !== 'com juros' && juros !== 'sim';

  let n = 0;
  if (!isNaN(configured) && configured >= 2) n = Math.min(configured, 12);
  else if (p.price >= 60) n = 3;

  if (n < 2) return null;
  return { n, value: p.price / n, interestFree };
}

/** Promoção "R$ por R$" — texto livre configurado no admin (specs.promocao) */
export function getPromoDeal(p: Product): string | null {
  const promo = (p.specs?.promocao || '').trim();
  return promo || null;
}

/** Linha de parcelamento formatada */
export function installmentLabel(inst: Installment): string {
  const value = inst.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return `${inst.n}x de ${value}${inst.interestFree ? ' sem juros' : ' no cartão'}`;
}
