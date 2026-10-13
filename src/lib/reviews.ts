/**
 * Avaliações de clientes — CONFIG EDITÁVEL
 * Para editar: altere/adicione objetos aqui (nome, nota 1-5, texto, data).
 * No futuro estas avaliações podem vir do painel admin (Setting key="reviews").
 */
export interface Review {
  name: string;
  initials: string;
  rating: number;
  text: string;
  when: string;
}

export const REVIEWS: Review[] = [
  {
    name: 'Rafael M.',
    initials: 'RM',
    rating: 5,
    text: 'Melhor tabacaria de Goiânia, sem exagero. Atendimento insano, o pessoal entende de verdade e ainda te indica o que faz sentido pro seu bolso.',
    when: 'há 2 semanas',
  },
  {
    name: 'Juliana P.',
    initials: 'JP',
    rating: 5,
    text: 'Comprei de outro estado e chegou super bem embalado em 4 dias. A parede de essências da loja é surreal, virei cliente fiel.',
    when: 'há 1 mês',
  },
  {
    name: 'Diego H.',
    initials: 'DH',
    rating: 5,
    text: 'Pedir pelo WhatsApp é muito prático: responderam rápido, mandaram foto do produto e ainda indicaram o rosh certo pro meu vaso.',
    when: 'há 3 semanas',
  },
  {
    name: 'Camila S.',
    initials: 'CS',
    rating: 5,
    text: 'Loja linda no Portal Sul, ambiente premium e organizado. Fui presentear meu irmão e saí com um kit montado com ajuda da equipe.',
    when: 'há 2 meses',
  },
  {
    name: 'Thiago R.',
    initials: 'TR',
    rating: 4,
    text: 'Produtos originais e variedade de narguilé absurda. Só tinha acabado o carvão que eu uso, mas indicaram alternativa melhor na hora.',
    when: 'há 1 semana',
  },
  {
    name: 'Bianca L.',
    initials: 'BL',
    rating: 5,
    text: 'Já é a terceira compra. Sedas, essências e presente — tudo original, com nota e carinho na embalagem. Recomendo de olhos fechados.',
    when: 'há 5 dias',
  },
];

export const GOOGLE_REVIEWS_URL = 'https://share.google/83AE98JuDZwOLCuCh';

/** FAQ — configurável */
export const FAQ_ITEMS = [
  {
    q: 'Como funciona o envio?',
    a: 'Enviamos para todo o Brasil via Correios e transportadoras parceiras. Depois que você finaliza pelo WhatsApp, nossa equipe confirma disponibilidade, embala com proteção e te passa o código de rastreio em até 1 dia útil.',
  },
  {
    q: 'Qual o prazo de entrega?',
    a: 'Goiânia e região: entrega no mesmo dia ou em até 24h (motoboy/apps). Demais capitais: 2 a 5 dias úteis. Interior: 3 a 8 dias úteis, dependendo do CEP. Você acompanha tudo pelo código de rastreio.',
  },
  {
    q: 'Quais as formas de pagamento?',
    a: 'Pix (aprovação na hora), cartão de crédito em até 12x (consulte juros no WhatsApp), dinheiro e débito na loja física. Para envios, aceitamos Pix e link de pagamento com cartão.',
  },
  {
    q: 'Os produtos são originais?',
    a: 'Sim, 100%. Trabalhamos apenas com distribuidores oficiais e marcas reconhecidas — FM, NAY, Zombie, RAW, OCB, Zomo e outras. Se algum item saiu do padrão, trocamos sem discussão.',
  },
  {
    q: 'Posso retirar na loja?',
    a: 'Pode sim! Escolha "retirada na loja" ao finalizar pelo WhatsApp. Estamos no Portal Sul Shopping, em Goiânia — aberto todos os dias, das 10h às 22h, inclusive domingos e feriados. A gente deixa separado com seu nome.',
  },
  {
    q: 'Como faço troca?',
    a: 'Você tem até 7 dias corridos após receber, com produto lacrado e na embalagem original. Chame no WhatsApp com o número do pedido que resolvemos rapidinho — troca, crédito ou devolução conforme o caso.',
  },
];
