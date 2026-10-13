'use client';

import { useEffect, useRef } from 'react';

/**
 * SmokeCanvas — sistema de partículas de fumaça + brasas.
 * Inspirado em tsParticles / particles.js (github), implementação
 * custom otimizada: canvas 2D, DPR limitado, pausa com aba oculta.
 */
interface SmokeParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; rotation: number; vrotation: number;
  hue: 'gray' | 'red';
}
interface Ember {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
  flicker: number;
}

export default function SmokeCanvas({
  className = '',
  density = 1,
  redGlow = true,
  embers = true,
}: {
  className?: string;
  density?: number;
  redGlow?: boolean;
  embers?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Acessibilidade/performance: sem animação contínua se o usuário prefere menos movimento
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let width = 0;
    let height = 0;
    let running = true;
    let raf = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const smokes: SmokeParticle[] = [];
    const emberList: Ember[] = [];

    const spawnSmoke = (initial = false): SmokeParticle => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 80,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.25 + Math.random() * 0.5),
      life: 0,
      maxLife: 380 + Math.random() * 240,
      size: 60 + Math.random() * 140,
      rotation: Math.random() * Math.PI * 2,
      vrotation: (Math.random() - 0.5) * 0.003,
      hue: redGlow && Math.random() < 0.16 ? 'red' : 'gray',
    });

    const spawnEmber = (initial = false): Ember => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 10,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.5 + Math.random() * 0.9),
      life: 0,
      maxLife: 240 + Math.random() * 200,
      size: 1 + Math.random() * 2.2,
      flicker: Math.random() * Math.PI * 2,
    });

    const smokeCount = Math.round(14 * density);
    const emberCount = embers ? Math.round(26 * density) : 0;

    for (let i = 0; i < smokeCount; i++) smokes.push(spawnSmoke(true));
    for (let i = 0; i < emberCount; i++) emberList.push(spawnEmber(true));

    let t = 0;
    const draw = () => {
      if (!running) return;
      t += 0.005;
      ctx.clearRect(0, 0, width, height);

      // Fumaça
      for (let i = 0; i < smokes.length; i++) {
        const p = smokes[i];
        p.life++;
        p.x += p.vx + Math.sin(t * 2 + i) * 0.18;
        p.y += p.vy;
        p.rotation += p.vrotation;

        const lifeRatio = p.life / p.maxLife;
        const alpha = lifeRatio < 0.12 ? lifeRatio / 0.12 : 1 - (lifeRatio - 0.12) / 0.88;
        const size = p.size * (0.6 + lifeRatio * 0.8);

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        if (p.hue === 'red') {
          grad.addColorStop(0, `rgba(201, 0, 0, ${0.10 * alpha})`);
          grad.addColorStop(0.55, `rgba(140, 0, 0, ${0.05 * alpha})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          grad.addColorStop(0, `rgba(160, 160, 165, ${0.085 * alpha})`);
          grad.addColorStop(0.6, `rgba(90, 90, 95, ${0.04 * alpha})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.translate(-p.x, -p.y);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, size, size * 0.72, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life > p.maxLife || p.y < -p.size) smokes[i] = spawnSmoke();
      }

      // Brasas flutuantes
      for (let i = 0; i < emberList.length; i++) {
        const e = emberList[i];
        e.life++;
        e.flicker += 0.12;
        e.x += e.vx + Math.sin(t * 3 + i * 2) * 0.22;
        e.y += e.vy;

        const lifeRatio = e.life / e.maxLife;
        const alpha = lifeRatio < 0.1 ? lifeRatio / 0.1 : 1 - (lifeRatio - 0.1) / 0.9;
        const flick = 0.55 + Math.abs(Math.sin(e.flicker)) * 0.45;

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${230 + Math.sin(e.flicker) * 25}, 60, 20, ${alpha * flick * 0.85})`;
        ctx.shadowColor = 'rgba(255, 40, 0, 0.8)';
        ctx.shadowBlur = 6 * flick;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (e.life > e.maxLife || e.y < -20) emberList[i] = spawnEmber();
      }

      raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [density, redGlow, embers]);

  return <canvas ref={canvasRef} className={`pointer-events-none ${className}`} aria-hidden="true" />;
}
