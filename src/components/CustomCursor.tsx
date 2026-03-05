'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  
  const positionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);
  const rippleIdRef = useRef(0);
  const isVisibleRef = useRef(false);
  const lastMoveTimeRef = useRef(Date.now());

  const checkVisibility = useCallback(() => {
    const now = Date.now();
    const timeSinceMove = now - lastMoveTimeRef.current;
    const shouldBeVisible = timeSinceMove < 100;
    
    if (shouldBeVisible !== isVisibleRef.current) {
      isVisibleRef.current = shouldBeVisible;
      if (cursorRef.current) {
        cursorRef.current.style.opacity = shouldBeVisible ? '1' : '0';
      }
      if (ringRef.current) {
        ringRef.current.style.opacity = shouldBeVisible ? '1' : '0';
      }
    }
  }, []);

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    let frameCount = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      lastMoveTimeRef.current = Date.now();
      checkVisibility();
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      cursor.style.opacity = '1';
      ring.style.opacity = '1';
    };
    
    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      cursor.style.opacity = '0';
      ring.style.opacity = '0';
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      
      const newRipple = {
        id: rippleIdRef.current++,
        x: e.clientX,
        y: e.clientY
      };
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    };

    const handleMouseUp = () => setIsClicking(false);

    let lastHoverCheck = 0;
    const handleElementHover = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastHoverCheck < 50) return;
      lastHoverCheck = now;
      
      const target = e.target as HTMLElement;
      const isHoverable = 
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        !!target.closest('a') ||
        !!target.closest('button') ||
        target.classList.contains('cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      setIsHovering(isHoverable);
    };

    const animate = () => {
      frameCount++;
      
      if (frameCount % 2 !== 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const ease = 0.15;
      positionRef.current.x += (targetRef.current.x - positionRef.current.x) * ease;
      positionRef.current.y += (targetRef.current.y - positionRef.current.y) * ease;

      const { x, y } = positionRef.current;
      
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;

      checkVisibility();

      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleElementHover, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    animate();

    document.body.style.cursor = 'none';
    
    const style = document.createElement('style');
    style.textContent = `
      a, button, [role="button"], input, textarea, select, [onclick] {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleElementHover);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      document.body.style.cursor = '';
      document.head.removeChild(style);
    };
  }, [checkVisibility]);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  const cursorSize = isHovering ? '24px' : '15px';
  const cursorHeight = isHovering ? '25px' : '16px';
  const ringSize = isHovering ? '64px' : '32px';
  
  const clickShadow = '0 0 30px rgba(99, 102, 241, 0.9), 0 0 60px rgba(99, 102, 241, 0.6)';
  const normalShadow = '0 0 20px rgba(99, 102, 241, 0.7), 0 0 40px rgba(99, 102, 241, 0.4)';

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] opacity-0 will-change-transform"
        style={{
          width: cursorSize,
          height: cursorHeight,
          background: 'radial-gradient(circle, rgb(255, 255, 255) 10%, rgba(99, 102, 241, 0.7) 50%, rgba(255, 255, 255, 0.4) 70%)',
          borderRadius: '50%',
          boxShadow: isClicking ? clickShadow : normalShadow,
          transition: 'width 0.2s ease, height 0.2s ease, box-shadow 0.15s ease, opacity 0.2s ease',
        }}
      />

      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] opacity-0 will-change-transform"
        style={{
          width: ringSize,
          height: ringSize,
          border: '1px solid rgba(99, 102, 241, 0.5)',
          borderRadius: '50%',
          animation: 'cursorPulse 2s ease-in-out infinite',
          transition: 'width 0.2s ease, height 0.2s ease, opacity 0.2s ease',
        }}
      />

      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none z-[9997]"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '12px',
            height: '12px',
            transform: 'translate(-50%, -50%)',
            border: '2px solid rgba(99, 102, 241, 0.8)',
            borderRadius: '50%',
            animation: 'cursorRipple 0.6s ease-out forwards',
          }}
        />
      ))}

      <style jsx global>{`
        @keyframes cursorPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
          }
        }

        @keyframes cursorRipple {
          0% {
            width: 12px;
            height: 12px;
            opacity: 1;
          }
          100% {
            width: 40px;
            height: 40px;
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
