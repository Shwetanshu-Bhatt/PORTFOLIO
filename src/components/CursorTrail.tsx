'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -100, y: -100, lastX: -100, lastY: -100 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.lastX = mouseRef.current.x;
      mouseRef.current.lastY = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      // Create particles based on mouse movement
      const dx = mouseRef.current.x - mouseRef.current.lastX;
      const dy = mouseRef.current.y - mouseRef.current.lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      if (speed > 2 && particlesRef.current.length < 30) {
        const particleCount = Math.min(2, Math.floor(speed / 10));
        
        for (let i = 0; i < particleCount; i++) {
          const t = i / particleCount;
          const px = mouseRef.current.lastX + dx * t + (Math.random() - 0.5) * 5;
          const py = mouseRef.current.lastY + dy * t + (Math.random() - 0.5) * 5;
          
          particlesRef.current.push({
            x: px,
            y: py,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5 - 0.3,
            life: 1,
            maxLife: 20 + Math.random() * 15,
            size: Math.random() * 2 + 1,
          });
        }
      }
    };

    // Hide on mouse leave
    const handleMouseLeave = () => {
      mouseRef.current.x = -100;
      mouseRef.current.y = -100;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    const animate = () => {
      frameCountRef.current++;
      
      // Only run every 2nd frame for subtlety
      if (frameCountRef.current % 2 !== 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check theme
      const isDark = !document.documentElement.hasAttribute('data-theme') || 
                     document.documentElement.getAttribute('data-theme') === 'dark';
      
      // Don't show in light mode
      if (!isDark) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const particles = particlesRef.current;
      
      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Update
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // Gravity
        p.life -= 1 / p.maxLife;
        
        // Remove dead particles
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        
        // Draw particle
        const opacity = p.life * 0.5;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `rgba(99, 102, 241, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${opacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9998]"
      style={{ 
        opacity: 0.6,
        mixBlendMode: 'screen'
      }}
    />
  );
}