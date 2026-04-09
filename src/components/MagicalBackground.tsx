import React, { useEffect, useRef } from 'react';
import { useTheme } from './theme-provider';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

export const MagicalBackground = () => {
  const { theme, effectsEnabled } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, isMoving: false });

  // Mouse Follow Spotlight Element
  const haloRef = useRef<HTMLDivElement>(null);

  // Get theme specific colors in HSL
  const getThemeColors = () => {
    const rootStyles = getComputedStyle(document.documentElement);
    const primary = rootStyles.getPropertyValue('--primary').trim();
    const secondary = rootStyles.getPropertyValue('--secondary').trim();
    return { primary, secondary };
  };

  useEffect(() => {
    if (!effectsEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const isMobile = window.innerWidth < 768;
    const maxParticles = isMobile ? 30 : 60; // Performance tuning based on device

    // Initialize Particles
    const createParticle = (x?: number, y?: number, specificColor?: string): Particle => {
      const { primary, secondary } = getThemeColors();
      return {
        x: x ?? Math.random() * width,
        y: y ?? Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5, // Bias upwards
        size: Math.random() * 2 + 0.5,
        life: 0,
        maxLife: Math.random() * 200 + 100,
        color: specificColor || (Math.random() > 0.5 ? primary : secondary),
      };
    };

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < maxParticles; i++) {
        particlesRef.current.push(createParticle());
      }
    }

    const drawParticles = () => {
      // Gravity & Friction logic for particles
      particlesRef.current.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Slow down the burst velocity over time
        p.vx *= 0.95;
        p.vy *= 0.95;
        
        // Gentle upwards drift
        p.y -= 0.5;
        
        p.life++;

        // Add slight wobble
        p.x += Math.sin(p.life * 0.1) * 0.5;

        // If a particle dies, re-spawn it as an ambient particle randomly across the screen
        if (p.life >= p.maxLife || p.y < -10 || p.x < -10 || p.x > width + 10) {
          particlesRef.current[index] = createParticle();
        }

        const opacity = Math.sin((p.life / p.maxLife) * Math.PI) * 0.6; // Fade in and out
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.color} / ${opacity})`;
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsl(${p.color})`;
      });
      ctx.shadowBlur = 0; // Reset
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      drawParticles();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Interactions
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, isMoving: true };
      if (haloRef.current) {
        haloRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      
      // Sometimes spawn a particle at mouse
      if (Math.random() > 0.8 && particlesRef.current.length < maxParticles + 10) {
        const { primary, secondary } = getThemeColors();
        particlesRef.current.push(createParticle(e.clientX, e.clientY, Math.random() > 0.5 ? primary : secondary));
      }
    };

    const handleClick = (e: MouseEvent) => {
      const { primary, secondary } = getThemeColors();
      // Burst of particles instead of ripples
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 1,
          life: 0,
          maxLife: Math.random() * 50 + 50,
          color: Math.random() > 0.5 ? primary : secondary,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, effectsEnabled]);

  if (!effectsEnabled) {
    return (
      <div className="fixed inset-0 z-[-1] pointer-events-none transition-colors duration-1000 bg-background/80" />
    );
  }

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-background">
      {/* 1. Ambient Background Grid & Static Gradient (Base Layer) */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-screen transition-all duration-1000"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--theme-primary) / 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--theme-primary) / 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 2. Slow Ambient Breathing Halos */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,_hsl(var(--theme-primary)/0.15)_0%,_transparent_60%)] blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle,_hsl(var(--theme-secondary)/0.1)_0%,_transparent_60%)] blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />

      {/* 3. High Performance Canvas for Particles & Ripples */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full mix-blend-screen"
      />

      {/* 4. Mouse Follow Glow (Hardware Accelerated) */}
      <div 
        ref={haloRef}
        className="absolute top-[-300px] left-[-300px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,_hsl(var(--theme-primary)/0.15)_0%,_transparent_50%)] blur-2xl transition-opacity duration-300 mix-blend-screen will-change-transform"
      />
    </div>
  );
};