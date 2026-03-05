'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { personal } from '@/data';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frameCount = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      
      // Only calculate if mouse is near or within the hero section
      const proximityThreshold = 200;
      if (
        e.clientY < rect.top - proximityThreshold ||
        e.clientY > rect.bottom + proximityThreshold
      ) {
        targetRef.current = { x: 0, y: 0 };
        return;
      }
      
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const rawX = (e.clientX - centerX) / (rect.width / 2);
      const rawY = (e.clientY - centerY) / (rect.height / 2);
      
      targetRef.current = {
        x: Math.max(-0.8, Math.min(0.8, rawX)),
        y: Math.max(-0.8, Math.min(0.8, rawY))
      };
    };

    const animate = () => {
      frameCount++;
      
      // Run at 30fps instead of 60fps for smoother performance
      if (frameCount % 2 !== 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      // Smooth interpolation
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.08;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.08;

      const { x, y } = currentRef.current;

      // Apply transforms directly via CSS - NO React state updates!
      if (imageRef.current) {
        imageRef.current.style.transform = `
          translateX(${x * 10}px)
          translateY(${y * 10}px)
          rotateY(${x * 4}deg)
          rotateX(${-y * 4}deg)
          translateZ(30px)
        `;
      }

      if (textRef.current) {
        textRef.current.style.transform = `
          translateX(${x * 6}px)
          translateY(${y * 6}px)
          translateZ(50px)
        `;
      }

      if (titleRef.current) {
        titleRef.current.style.transform = `
          translateX(${x * 3}px)
          translateY(${y * 3}px)
          translateZ(30px)
        `;
      }

      if (orbRef.current) {
        orbRef.current.style.transform = `translateX(-50%) translate(${x * -12}px, ${y * -12}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <section
      id="hero"
      className="py-20 px-6 relative overflow-hidden"
      ref={containerRef}
    >
      {/* Animated background orb */}
      <div
        ref={orbRef}
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-30 bg-[var(--accent-primary)] pointer-events-none will-change-transform"
        style={{
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-8rem)] py-12"
          style={{ perspective: "1000px" }}
        >
          {/* Profile Image */}
          <div
            ref={imageRef}
            className="mb-10 will-change-transform"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <div className="relative">
              <div className="animate-float">
                <div
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full overflow-hidden border-2 border-[var(--border-color)]"
                  style={{
                    boxShadow: `
                      0 0 60px rgba(99, 102, 241, 0.15),
                      0 0 100px rgba(99, 102, 241, 0.08),
                      inset 0 0 30px rgba(99, 102, 241, 0.08)
                    `,
                  }}
                >
                  <Image
                    src="/Shwetanshu.png"
                    alt={personal.name}
                    width={180}
                    height={180}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Name */}
          <h1
            ref={textRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 will-change-transform"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <span className="gradient-text">{personal.name}</span>
          </h1>

          {/* Title */}
          <p
            ref={titleRef}
            className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] mb-6 font-medium flex flex-wrap justify-center items-center gap-2 sm:gap-3 will-change-transform"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {personal.subtitle.split(' | ').map((item, index, arr) => (
              <span key={index} className="contents">
                <span className={index % 2 === 0 ? 'text-[var(--accent-primary)]' : index % 4 === 1 ? 'text-[var(--accent-secondary)]' : 'text-[var(--accent-tertiary)]'}>
                  {item}
                </span>
                {index < arr.length - 1 && (
                  <span className="text-[var(--text-secondary)]">|</span>
                )}
              </span>
            ))}
          </p>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-8 px-4">
            {personal.description}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a href="#projects" className="btn-primary px-6 py-3 text-sm sm:text-base">
              View Projects
            </a>
            <a href="#contact" className="btn-secondary px-6 py-3 text-sm sm:text-base">
              Get In Touch
            </a>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center gap-4 sm:gap-6">
            <a
              href={personal.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-200 hover:scale-110 p-2"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a
              href={personal.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-200 hover:scale-110 p-2"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href={`mailto:${personal.email}`}
              className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all duration-200 hover:scale-110 p-2"
              aria-label="Email"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
