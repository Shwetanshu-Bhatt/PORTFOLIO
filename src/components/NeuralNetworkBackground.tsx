'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
}

interface Pulse {
  from: number;
  to: number;
  progress: number;
  speed: number;
}

interface TouchPoint {
  x: number;
  y: number;
  id: number;
}

export default function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const touchesRef = useRef<TouchPoint[]>([]);
  const nodesRef = useRef<Node[]>([]);
  const pulsesRef = useRef<Pulse[]>([]);
  const animationRef = useRef<number | null>(null);
  const themeRef = useRef<'dark' | 'light'>('dark');
  const timeRef = useRef(0);
  const isInteractingRef = useRef(false);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gyroRef = useRef({ x: 0.5, y: 0.5 });
  const isVisibleRef = useRef(true);
  const frameSkipRef = useRef(0);

  const resetInteraction = useCallback(() => {
    isInteractingRef.current = false;
  }, []);

  const startInteraction = useCallback(() => {
    isInteractingRef.current = true;
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(resetInteraction, 3000);
  }, [resetInteraction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for performance
    if (!ctx) return;

    let lastWidth = 0;
    let lastHeight = 0;

    const setCanvasSize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      if (Math.abs(newWidth - lastWidth) > 50 || Math.abs(newHeight - lastHeight) > 50) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        lastWidth = newWidth;
        lastHeight = newHeight;
        initNodes();
      }
    };
    
    const initNodes = () => {
      const nodes: Node[] = [];
      // Further reduce node count for better performance (was 15000, now 20000 = fewer nodes)
      const nodeCount = Math.floor((canvas.width * canvas.height) / 20000);
      
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 1.5,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
      
      nodesRef.current = nodes;
      pulsesRef.current = [];
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const updateTheme = () => {
      const isDark = !document.documentElement.hasAttribute('data-theme') ||
                     document.documentElement.getAttribute('data-theme') === 'dark';
      themeRef.current = isDark ? 'dark' : 'light';
    };
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      startInteraction();
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleTouchMove = (e: TouchEvent) => {
      touchesRef.current = Array.from(e.touches).map(touch => ({
        x: touch.clientX,
        y: touch.clientY,
        id: touch.identifier
      }));
      
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      startInteraction();
    };

    const handleTouchStart = (e: TouchEvent) => handleTouchMove(e);
    const handleTouchEnd = (e: TouchEvent) => {
      touchesRef.current = Array.from(e.touches).map(touch => ({
        x: touch.clientX,
        y: touch.clientY,
        id: touch.identifier
      }));
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      startInteraction();
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Visibility check - pause animation when tab is hidden
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma || 0;
      const beta = e.beta || 0;
      
      gyroRef.current = {
        x: Math.max(0, Math.min(1, (gamma + 90) / 180)),
        y: Math.max(0, Math.min(1, (beta + 90) / 180))
      };
      
      if (!isInteractingRef.current) {
        mouseRef.current = {
          x: gyroRef.current.x * canvas.width,
          y: gyroRef.current.y * canvas.height
        };
      }
    };

    if ('DeviceOrientationEvent' in window) {
      const requestOrientationPermission = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          try {
            const permission = await (DeviceOrientationEvent as any).requestPermission();
            if (permission === 'granted') {
              window.addEventListener('deviceorientation', handleDeviceOrientation);
            }
          } catch (err) {
            console.log('Device orientation permission denied');
          }
        } else {
          window.addEventListener('deviceorientation', handleDeviceOrientation);
        }
      };

      const requestOnInteraction = () => {
        requestOrientationPermission();
        window.removeEventListener('click', requestOnInteraction);
        window.removeEventListener('touchstart', requestOnInteraction);
      };
      window.addEventListener('click', requestOnInteraction);
      window.addEventListener('touchstart', requestOnInteraction);
    }

    // Animation loop optimized for performance
    const animate = () => {
      // Skip frames when tab is hidden
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      frameSkipRef.current++;
      
      // Run physics every frame but render at 30fps
      timeRef.current += 0.005;
      const isDark = themeRef.current === 'dark';
      
      if (!isInteractingRef.current) {
        const t = timeRef.current;
        mouseRef.current = {
          x: canvas.width / 2 + Math.sin(t) * (canvas.width * 0.35),
          y: canvas.height / 2 + Math.cos(t * 0.7) * (canvas.height * 0.35)
        };
      }
      
      const nodes = nodesRef.current;
      
      // Update node positions every frame
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -50 || node.x > canvas.width + 50) node.vx *= -1;
        if (node.y < -50 || node.y > canvas.height + 50) node.vy *= -1;
        node.pulsePhase += 0.02;
      });

      // Only render every 2nd frame (30fps)
      if (frameSkipRef.current % 2 === 0) {
        ctx.fillStyle = isDark ? '#0a0a0f' : '#fafafa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const connectionDistance = 120; // Reduced from 150
        const mouseConnectionDistance = 200; // Reduced from 250
        const nodeColor = isDark ? 'rgba(99, 102, 241, 0.16)' : 'rgba(0, 113, 227, 0.4)';
        const pulseColor = isDark ? 'rgba(99, 102, 241, 0.32)' : 'rgba(0, 113, 227, 0.56)';

        // Batch draw operations
        ctx.lineWidth = isDark ? 0.8 : 0.8;
        
        // Draw connections between nearby nodes (every 2nd frame)
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          
          // Process connections every frame but with reduced distance
          for (let j = i + 1; j < nodes.length; j++) {
            const other = nodes[j];
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const distSq = dx * dx + dy * dy; // Use squared distance to avoid sqrt
            
            if (distSq < connectionDistance * connectionDistance) {
              const dist = Math.sqrt(distSq);
              const opacity = (1 - dist / connectionDistance) * 0.3;
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = isDark 
                ? `rgba(99, 102, 241, ${opacity * 0.7})`
                : `rgba(0, 113, 227, ${opacity * 0.24})`;
              ctx.stroke();
            }
          }

          // Draw connections to mouse
          const point = mouseRef.current;
          const mdx = node.x - point.x;
          const mdy = node.y - point.y;
          const mDistSq = mdx * mdx + mdy * mdy;
          
          if (mDistSq < mouseConnectionDistance * mouseConnectionDistance && mDistSq > 25) {
            const mDist = Math.sqrt(mDistSq);
            const opacity = (1 - mDist / mouseConnectionDistance) * 0.8;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(point.x, point.y);
            ctx.strokeStyle = isDark 
              ? `rgba(99, 102, 241, ${opacity})`
              : `rgba(0, 113, 227, ${opacity * 0.4})`;
            ctx.lineWidth = isDark ? 1 : 1.5;
            ctx.stroke();
            ctx.lineWidth = isDark ? 0.8 : 0.8;
          }
        }

        // Draw and update pulses
        pulsesRef.current = pulsesRef.current.filter(pulse => {
          pulse.progress += pulse.speed;
          if (pulse.progress >= 1) return false;
          
          const from = nodes[pulse.from];
          const to = nodes[pulse.to];
          if (!from || !to) return false;
          
          const x = from.x + (to.x - from.x) * pulse.progress;
          const y = from.y + (to.y - from.y) * pulse.progress;
          
          const pulseRadius = isDark ? 6 : 10; // Smaller pulses
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseRadius);
          gradient.addColorStop(0, pulseColor);
          gradient.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
          
          return true;
        });

        // Draw nodes
        nodes.forEach((node) => {
          const pulse = Math.sin(node.pulsePhase) * 0.5 + 0.5;
          const radius = node.radius + pulse * (isDark ? 0.5 : 1);
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = isDark 
            ? `rgba(99, 102, 241, ${(0.4 + pulse * 0.3) * 0.9})`
            : `rgba(0, 113, 227, ${(0.7 + pulse * 0.3) * 0.8})`;
          ctx.fill();
        });

        // Spawn pulses less frequently
        if (frameSkipRef.current % 180 === 0 && Math.random() > 0.6) {
          const randomNode = Math.floor(Math.random() * nodes.length);
          const nearbyNodes = nodes
            .map((n, i) => ({ index: i, dist: Math.hypot(n.x - nodes[randomNode].x, n.y - nodes[randomNode].y) }))
            .filter(n => n.dist < connectionDistance && n.dist > 10)
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 2); // Reduced from 3
          
          nearbyNodes.forEach(target => {
            pulsesRef.current.push({
              from: randomNode,
              to: target.index,
              progress: 0,
              speed: 0.02 + Math.random() * 0.01,
            });
          });
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [startInteraction, resetInteraction]);

  return (
    <canvas
      ref={canvasRef}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        opacity: 1,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
