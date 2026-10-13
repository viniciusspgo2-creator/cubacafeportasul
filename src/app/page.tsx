'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import Header, { MobileMenu, BottomBar } from '@/components/Header';
import AgeGate from '@/components/AgeGate';
import CookieConsent from '@/components/CookieConsent';
import BagDrawer from '@/components/BagDrawer';
import SearchModal from '@/components/SearchModal';
import ChatBot from '@/components/ChatBot';
import FloatingDock from '@/components/FloatingDock';
import { Footer } from '@/components/LocationFooter';
import HomeView from '@/components/views/HomeView';
import CatalogView from '@/components/views/CatalogView';
import ProductView from '@/components/views/ProductView';
import { BlogListView, BlogArticleView } from '@/components/views/BlogView';
import GlossarioView from '@/components/views/GlossarioView';
import AdminView from '@/components/views/AdminView';
import AdminGate from '@/components/AdminGate';
import { useHashRoute } from '@/lib/router';

export default function Home() {
  const route = useHashRoute();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Age gate + cookies
  const [ageOk, setAgeOk] = useState(false);
  useEffect(() => {
    const check = () => setAgeOk(window.localStorage.getItem('cc-age-ok') === 'true');
    check();
    const interval = setInterval(check, 500);
    setTimeout(() => clearInterval(interval), 5000);
    return () => clearInterval(interval);
  }, []);

  // Busca com teclado "/" e ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchOpen && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') { setSearchOpen(false); setMobileOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  // Scroll para âncoras internas (#localizacao)
  useEffect(() => {
    if (route.path === '' && window.location.hash.includes('localizacao')) {
      setTimeout(() => {
        document.getElementById('localizacao')?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    }
  }, [route.path]);

  // Renderiza view pelo hash router
  const view = (() => {
    const [first, second] = route.params;
    switch (first) {
      case undefined:
      case '':
        return <HomeView />;
      case 'catalogo':
        return <CatalogView initialCategory="todos" initialSearch={route.hash} />;
      case 'categoria':
        return <CatalogView initialCategory={second || 'todos'} initialSearch="" />;
      case 'produto':
        return second ? <ProductView slug={second} /> : <CatalogView />;
      case 'blog':
        return second ? <BlogArticleView slug={second} /> : <BlogListView />;
      case 'glossario':
        return <GlossarioView />;
      case 'admin':
        return (
          <AdminGate>
            <AdminView />
          </AdminGate>
        );
      default:
        return <HomeView />;
    }
  })();

  const isAdmin = route.params[0] === 'admin';

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-black">
        <AgeGate />

        {/* Site por baixo do age gate */}
        <div className={ageOk ? '' : 'pointer-events-none select-none'}>
          {!isAdmin && (
            <Header onSearch={() => setSearchOpen(true)} onMobileMenu={() => setMobileOpen(true)} />
          )}

          <main className="min-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={route.params.join('/') || 'home'}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {view}
              </motion.div>
            </AnimatePresence>
          </main>

          {!isAdmin && <Footer />}

          {!isAdmin && (
            <>
              <FloatingDock />
              <ChatBot />
              <BottomBar />
              <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
            </>
          )}
          <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
          <BagDrawer />
          <CookieConsent />
        </div>
      </div>
    </MotionConfig>
  );
}
