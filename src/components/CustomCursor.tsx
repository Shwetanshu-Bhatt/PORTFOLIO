'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const positionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);
  const rippleIdRef = useRef(0);

  useEffect(() => {
    // Check if touch device
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    // Mouse move handler with smooth animation
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
    };

    // Mouse enter/leave for the window
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Click handlers
    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      
      // Add ripple effect
      const newRipple = {
        id: rippleIdRef.current++,
        x: e.clientX,
        y: e.clientY
      };
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    };

    const handleMouseUp = () => setIsClicking(false);

    // Detect hoverable elements
    const handleElementHover = (e: MouseEvent) => {
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

    // Smooth animation loop
    const animate = () => {
      // Linear interpolation for smooth following
      const ease = 1;
      positionRef.current.x += (targetRef.current.x - positionRef.current.x) * ease;
      positionRef.current.y += (targetRef.current.y - positionRef.current.y) * ease;

      if (cursor && ring) {
        cursor.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px) translate(-50%, -50%)`;
        ring.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px) translate(-50%, -50%)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleElementHover, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Start animation
    animate();

    // Hide default cursor via CSS
    document.body.style.cursor = 'none';
    
    // Add global style to hide cursor on interactive elements
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
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: isHovering ? '24px' : '15px',
          height: isHovering ? '25px' : '16px',
          background: 'radial-gradient(circle, rgb(255, 255, 255) 10%, rgba(99, 102, 241, 0.7) 50%, rgba(255, 255, 255, 0.4) 70%)',
          borderRadius: '50%',
          boxShadow: isClicking 
            ? '0 0 30px rgba(99, 102, 241, 0.9), 0 0 60px rgba(99, 102, 241, 0.6)'
            : '0 0 20px rgba(99, 102, 241, 0.7), 0 0 40px rgba(99, 102, 241, 0.4)',
          transition: 'width 0.2s ease, height 0.2s ease, box-shadow 0.15s ease',
        }}
      />

      {/* Outer pulsing ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: isHovering ? '64px' : '32px',
          height: isHovering ? '64px' : '32px',
          border: '1px solid rgba(99, 102, 241, 0.5)',
          borderRadius: '50%',
          animation: 'cursorPulse 2s ease-in-out infinite',
          transition: 'width 0.2s ease, height 0.2s ease',
        }}
      />

      {/* Click ripples */}
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

      {/* Keyframe animations */}
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
            width: 60px;
            height: 60px;
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
