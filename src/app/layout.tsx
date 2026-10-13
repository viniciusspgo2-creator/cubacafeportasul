import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cubacafe.com.br').replace(/\/$/, '');
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

const bebas = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const grotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cuba & Café Tabacaria | Narguiles, Headshop e Cultura Smoke — Goiânia",
    template: "%s | Cuba & Café Tabacaria",
  },
  description:
    "Muito mais que uma tabacaria. Uma experiência. Narguiles, essências, sedas, charutos e acessórios premium no Portal Sul Shopping, Goiânia. Aberto todos os dias, 10h às 22h. Enviamos para todo o Brasil.",
  keywords: [
    "tabacaria goiânia", "narguile", "headshop", "essências", "sedas",
    "charutos", "cuba e café", "portal sul shopping", "cachimbos", "carvão de coco",
    "tabacaria perto de mim", "narguile goiânia", "melhor tabacaria de goiânia",
  ],
  authors: [{ name: "Cuba & Café Tabacaria", url: SITE_URL }],
  creator: "Cuba & Café Tabacaria",
  publisher: "Cuba & Café Tabacaria",
  category: "Tabacaria",
  icons: { icon: "/brand/logo.png", apple: "/brand/logo.png" },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Cuba & Café Tabacaria — O Universo Smoke Completo, em um Só Lugar",
    description:
      "Narguiles, sedas, bongs, acessórios e as melhores marcas do mercado. Loja física no Portal Sul Shopping, aberta todos os dias das 10h às 22h, e envio para todo o Brasil.",
    url: "/",
    siteName: "Cuba & Café Tabacaria",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/photos/loja-fachada.webp",
        width: 680,
        height: 1010,
        alt: "Fachada da Cuba & Café Tabacaria no Portal Sul Shopping, Goiânia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cuba & Café Tabacaria — O Universo Smoke Completo",
    description:
      "Narguiles, sedas, essências e acessórios premium. Loja física em Goiânia e envio para todo o Brasil. Aberto todos os dias, 10h às 22h.",
    images: ["/photos/loja-fachada.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: true, address: true },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ════════ JSON-LD GRAPH — Organization + WebSite + Store (GEO/SEO) ════════
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Cuba & Café Tabacaria',
        alternateName: 'Cuba e Café',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/brand/logo.png`,
          width: 512,
          height: 389,
        },
        description:
          'Tabacaria premium em Goiânia-GO. Narguiles, headshop, sedas, charutos, essências e acessórios das melhores marcas, com curadoria e atendimento especializado. Loja física no Portal Sul Shopping e envio para todo o Brasil.',
        foundingDate: '2021',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Portal Sul Shopping — Av. dos Ipês, Jardins Lisboa',
          addressLocality: 'Goiânia',
          addressRegion: 'GO',
          postalCode: '74357-000',
          addressCountry: 'BR',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+55-62-8263-3610',
          contactType: 'customer service',
          availableLanguage: ['Portuguese'],
          areaServed: 'BR',
        },
        sameAs: [
          'https://www.instagram.com/cubaportalsul/',
          'https://share.google/83AE98JuDZwOLCuCh',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Cuba & Café Tabacaria',
        inLanguage: 'pt-BR',
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/#/catalogo?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Store',
        '@id': `${SITE_URL}/#store`,
        name: 'Cuba & Café Tabacaria',
        description:
          'Tabacaria premium em Goiânia. Narguiles, headshop, sedas, charutos e acessórios das melhores marcas. Loja física no Portal Sul Shopping, aberta todos os dias das 10h às 22h, com envio para todo o Brasil.',
        url: SITE_URL,
        image: [`${SITE_URL}/photos/loja-fachada.webp`, `${SITE_URL}/photos/loja-balcao.webp`],
        logo: `${SITE_URL}/brand/logo.png`,
        telephone: '+55 62 8263-3610',
        priceRange: 'R$10 - R$1500',
        currenciesAccepted: 'BRL',
        paymentAccepted: 'Pix, Dinheiro, Cartão de Crédito, Cartão de Débito',
        parentOrganization: { '@id': `${SITE_URL}/#organization` },
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Portal Sul Shopping — Av. dos Ipês, Jardins Lisboa',
          addressLocality: 'Goiânia',
          addressRegion: 'GO',
          postalCode: '74357-000',
          addressCountry: 'BR',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: -16.7184,
          longitude: -49.2954,
        },
        // ABERTO TODOS OS DIAS 10h–22h
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '10:00',
            closes: '22:00',
          },
        ],
        areaServed: [
          { '@type': 'City', name: 'Goiânia' },
          { '@type': 'Country', name: 'Brasil' },
        ],
        sameAs: [
          'https://www.instagram.com/cubaportalsul/',
          'https://share.google/83AE98JuDZwOLCuCh',
        ],
        hasMap: 'https://share.google/83AE98JuDZwOLCuCh',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/#/catalogo?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Geo tags — SEO local */}
        <meta name="geo.region" content="BR-GO" />
        <meta name="geo.placename" content="Goiânia" />
        <meta name="geo.position" content="-16.7184;-49.2954" />
        <meta name="ICBM" content="-16.7184, -49.2954" />
        <link rel="preconnect" href="https://wa.me" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${bebas.variable} ${grotesk.variable} antialiased bg-black text-white`}
      >
        {/* Google Analytics 4 — ativa só se NEXT_PUBLIC_GA_ID estiver definido */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { send_page_view: true });`}
            </Script>
          </>
        )}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
