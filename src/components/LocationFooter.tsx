'use client';

import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Phone, Clock, Car, Instagram, Navigation } from 'lucide-react';
import { storeInfo } from '@/lib/helpers';
import { getOpenStatus } from '@/lib/hours';
import { navigate } from '@/lib/router';
import { useEffect, useState } from 'react';

/** Placeholder do mapa antes do carregamento lazy */
function MapPlaceholder() {
  return (
    <div className="skeleton-shimmer flex aspect-[4/3] w-full items-center justify-center rounded-3xl md:aspect-auto md:h-[440px]">
      <div className="flex flex-col items-center gap-3 text-white/40">
        <MapPin className="h-8 w-8 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-widest">Carregando mapa...</span>
      </div>
    </div>
  );
}

export function LocationSection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInView = useInView(mapRef, { once: true, margin: '200px' });
  const [status, setStatus] = useState<{ open: boolean; label: string; todayLabel: string } | null>(null);

  useEffect(() => {
    const t0 = setTimeout(() => setStatus(getOpenStatus()), 0); // evita mismatch de hidratação
    return () => clearTimeout(t0);
  }, []);

  return (
    <section id="localizacao" className="relative overflow-hidden bg-black py-20 md:py-28">
      <div className="pointer-events-none absolute -left-32 top-1/3 h-[400px] w-[400px] rounded-full bg-[#c90000]/12 blur-[130px]" />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="mb-3 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-[#ff4b4b]">
              <span className="h-px w-8 bg-[#c90000]" /> Onde estamos
            </span>
            <h2 className="font-display text-5xl leading-[0.95] md:text-7xl">
              TE ESPERAMOS
              <br />
              NA <span className="text-glow-red text-[#ff2d2d]">LOJA FÍSICA</span>
            </h2>

            <div className="mt-9 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#c90000]/40 bg-[#c90000]/10">
                  <MapPin className="h-5 w-5 text-[#ff4b4b]" />
                </div>
                <div>
                  <p className="font-semibold text-white">Cuba & Café Tabacaria — Portal Sul Shopping</p>
                  <p className="mt-0.5 text-sm text-white/60">
                    Av. dos Ipês — Jardins Lisboa, Goiânia — GO
                    <br />
                    CEP 74357-000
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Clock className="h-5 w-5 text-white/70" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">Horário de hoje</p>
                    {status && (
                      <span
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          status.open ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-white/60'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.open ? 'bg-emerald-400' : 'bg-white/50'}`} />
                        {status.open ? 'Aberto agora' : 'Fechado'}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-[#ff6b6b]">{status?.todayLabel || 'Hoje: 10h às 22h'}</p>
                  <p className="text-sm text-white/55">Todos os dias · 10h às 22h</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Car className="h-5 w-5 text-white/70" />
                </div>
                <div>
                  <p className="font-semibold text-white">Entregas locais via</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Uber', '99', 'InDrive'].map((app) => (
                      <span key={app} className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/75">
                        {app}
                      </span>
                    ))}
                    <span className="rounded-lg border border-[#c90000]/40 bg-[#c90000]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#ff6b6b]">
                      Envio Brasil
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões grandes e fáceis de tocar (mín. 48px) */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={storeInfo.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#c90000] px-7 py-3.5 text-sm font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:bg-[#e00000] active:translate-y-0"
              >
                <Navigation className="h-4 w-4" /> Google Maps
              </a>
              <a
                href={storeInfo.wazeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:border-white/50"
              >
                <Car className="h-4 w-4" /> Waze
              </a>
              <a
                href={`https://wa.me/${storeInfo.whatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:border-white/50"
              >
                <Phone className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>

          {/* Mapa — só carrega quando entra na tela (lazy) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
            ref={mapRef}
          >
            <div className="overflow-hidden rounded-3xl border border-white/12 shadow-2xl">
              {mapInView ? (
                <iframe
                  title="Mapa — Cuba & Café Tabacaria, Portal Sul Shopping, Goiânia"
                  src="https://www.google.com/maps?q=Portal+Sul+Shopping+Av.+dos+Ip%C3%AAs+Jardins+Lisboa+Goi%C3%A2nia+GO&output=embed"
                  width="100%"
                  height="440"
                  style={{ border: 0, filter: 'grayscale(0.85) invert(0.92) contrast(0.9) hue-rotate(180deg)' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <MapPlaceholder />
              )}
            </div>
            <div className="glass absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl px-5 py-4">
              <Image src="/brand/logo.png" alt="Logo" width={80} height={61} className="h-10 w-auto" />
              <div>
                <p className="text-sm font-bold">Portal Sul Shopping</p>
                <p className="text-xs text-white/55">Goiânia — GO · CEP 74357-000</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const cats = ['Narguiles', 'Essências', 'Sedas', 'Tabacos', 'Headshop', 'Cachimbos', 'Acessórios', 'Kits'];
  return (
    <footer className="noise relative mt-auto border-t border-white/10 bg-[#0a0a0a] pb-32 pt-16 md:pb-10">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            {/* Logo original — maior, sem anel giratório */}
            <div className="flex items-center">
              <Image
                src="/brand/logo.png"
                alt="Cuba & Café Tabacaria — logo"
                width={240}
                height={182}
                className="h-20 w-auto md:h-24"
                loading="lazy"
              />
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/55">
              Muito mais que uma tabacaria — uma experiência. Cultura smoke, headshop e
              produtos premium com curadoria e atendimento especializado, no Portal Sul
              Shopping e para todo o Brasil.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={storeInfo.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/12 text-white/70 transition-all hover:border-[#c90000] hover:bg-[#c90000] hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={`https://wa.me/${storeInfo.whatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/12 text-white/70 transition-all hover:border-[#25D366] hover:bg-[#25D366] hover:text-white"
                aria-label="WhatsApp"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z"/></svg>
              </a>
              <a
                href={storeInfo.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/12 text-white/70 transition-all hover:border-[#c90000] hover:bg-[#c90000] hover:text-white"
                aria-label="Google Maps"
              >
                <MapPin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-white/45">Categorias</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {cats.map((c) => (
                <li key={c}>
                  <button
                    onClick={() => navigate(`/categoria/${c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`)}
                    className="text-sm text-white/60 transition-colors hover:text-[#ff4b4b]"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-white/45">Institucional</p>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><button onClick={() => navigate('/blog')} className="transition-colors hover:text-[#ff4b4b]">Universo Cuba & Café</button></li>
              <li><button onClick={() => navigate('/catalogo')} className="transition-colors hover:text-[#ff4b4b]">Catálogo completo</button></li>
              <li><button onClick={() => navigate('/glossario')} className="transition-colors hover:text-[#ff4b4b]">Glossário smoke</button></li>
              <li><button onClick={() => navigate('/#localizacao')} className="transition-colors hover:text-[#ff4b4b]">Onde estamos</button></li>
              <li className="pt-2 text-white/45">
                Portal Sul Shopping — Av. dos Ipês, Jardins Lisboa<br />Goiânia — GO · CEP 74357-000
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 md:flex-row">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} Cuba & Café Tabacaria — Todos os direitos reservados.
          </p>
          <p className="max-w-md text-center text-xs font-medium text-white/50 md:text-right">
            Venda proibida para menores de 18 anos.
          </p>
        </div>
      </div>
    </footer>
  );
}
