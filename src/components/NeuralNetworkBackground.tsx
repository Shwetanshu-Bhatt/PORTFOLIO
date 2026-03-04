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
  const gyroRef = useRef({ x: 0.5, y: 0.5 }); // Normalized 0-1

  // Reset interaction state after inactivity
  const resetInteraction = useCallback(() => {
    isInteractingRef.current = false;
  }, []);

  // Handle interaction start
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastWidth = 0;
    let lastHeight = 0;

    // Set canvas size to cover viewport only (not full scrollable page)
    const setCanvasSize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      // Only update if size changed significantly (more than 50px)
      if (Math.abs(newWidth - lastWidth) > 50 || Math.abs(newHeight - lastHeight) > 50) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        lastWidth = newWidth;
        lastHeight = newHeight;
        
        // Re-initialize nodes when canvas size changes
        initNodes();
      }
    };
    
    // Initialize nodes - random positions (20% fewer)
    const initNodes = () => {
      const nodes: Node[] = [];
      const nodeCount = Math.floor((canvas.width * canvas.height) / 15000); // 20% fewer nodes (was 12000)
      
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
      // Clear pulses when nodes are re-initialized to prevent invalid references
      pulsesRef.current = [];
    };
    
    // Initial setup
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Check current theme
    const updateTheme = () => {
      const isDark = !document.documentElement.hasAttribute('data-theme') ||
                     document.documentElement.getAttribute('data-theme') === 'dark';
      themeRef.current = isDark ? 'dark' : 'light';
    };
    updateTheme();

    // Watch for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Track mouse - viewport coordinates only (fixed canvas)
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { 
        x: e.clientX, 
        y: e.clientY 
      };
      startInteraction();
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Track touch events for multi-touch support
    const handleTouchMove = (e: TouchEvent) => {
      touchesRef.current = Array.from(e.touches).map(touch => ({
        x: touch.clientX,
        y: touch.clientY,
        id: touch.identifier
      }));
      
      // Also update mouseRef with first touch for backward compatibility
      if (e.touches.length > 0) {
        mouseRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
      startInteraction();
    };

    const handleTouchStart = (e: TouchEvent) => {
      handleTouchMove(e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchesRef.current = Array.from(e.touches).map(touch => ({
        x: touch.clientX,
        y: touch.clientY,
        id: touch.identifier
      }));
      
      if (e.touches.length > 0) {
        mouseRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
      startInteraction();
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Gyroscope / Device Orientation support
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      // gamma: left-to-right tilt (-90 to 90)
      // beta: front-to-back tilt (-180 to 180)
      const gamma = e.gamma || 0;
      const beta = e.beta || 0;
      
      // Normalize to 0-1 range and clamp
      gyroRef.current = {
        x: Math.max(0, Math.min(1, (gamma + 90) / 180)),
        y: Math.max(0, Math.min(1, (beta + 90) / 180))
      };
      
      // Only use gyro if no touch/mouse interaction
      if (!isInteractingRef.current) {
        mouseRef.current = {
          x: gyroRef.current.x * canvas.width,
          y: gyroRef.current.y * canvas.height
        };
      }
    };

    // Check for device orientation support
    if ('DeviceOrientationEvent' in window) {
      // Request permission on iOS 13+
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
          // Non-iOS devices
          window.addEventListener('deviceorientation', handleDeviceOrientation);
        }
      };

      // Request on first user interaction
      const requestOnInteraction = () => {
        requestOrientationPermission();
        window.removeEventListener('click', requestOnInteraction);
        window.removeEventListener('touchstart', requestOnInteraction);
      };
      window.addEventListener('click', requestOnInteraction);
      window.addEventListener('touchstart', requestOnInteraction);
    }

    // Animation loop
    let frameCount = 0;
    const animate = () => {
      frameCount++;
      timeRef.current += 0.005;
      
      const isDark = themeRef.current === 'dark';
      
      // Auto-animation: Lissajous curve when idle
      if (!isInteractingRef.current) {
        const t = timeRef.current;
        mouseRef.current = {
          x: canvas.width / 2 + Math.sin(t) * (canvas.width * 0.35),
          y: canvas.height / 2 + Math.cos(t * 0.7) * (canvas.height * 0.35)
        };
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      
      // Update node positions with subtle drift
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        
        // Subtle boundary bounce
        if (node.x < -50 || node.x > canvas.width + 50) node.vx *= -1;
        if (node.y < -50 || node.y > canvas.height + 50) node.vy *= -1;
        
        node.pulsePhase += 0.02;
      });

      // Theme-based colors - 20% lighter (80% of previous opacity)
      const nodeColor = isDark 
        ? 'rgba(99, 102, 241, 0.16)'  // was 0.2
        : 'rgba(0, 113, 227, 0.4)';   // was 0.5
      const lineColor = isDark 
        ? 'rgba(99, 102, 241, 0.8)'  // was 0.1
        : 'rgba(0, 113, 227, 0.2)';   // was 0.25
      const mouseLineColor = isDark 
        ? 'rgba(99, 102, 241, 0.28)'  // was 0.35
        : 'rgba(0, 113, 227, 0.48)';  // was 0.6
      const pulseColor = isDark 
        ? 'rgba(99, 102, 241, 0.32)'  // was 0.4
        : 'rgba(0, 113, 227, 0.56)';  // was 0.7

      // Draw connections between nearby nodes
      const connectionDistance = 150;
      const mouseConnectionDistance = 250;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // Draw connections to nearby nodes (only process every 2nd frame for performance)
        if (frameCount % 2 === 0) {
          for (let j = i + 1; j < nodes.length; j++) {
            const other = nodes[j];
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < connectionDistance) {
              const opacity = (1 - dist / connectionDistance) * 0.3; // 20% lighter
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = isDark 
                ? `rgba(99, 102, 241, ${opacity * 0.7})`
                : `rgba(0, 113, 227, ${opacity * 0.24})`;
              ctx.lineWidth = isDark ? 0.9 : 0.8;
              ctx.stroke();
            }
          }
        }

        // Multi-touch: Draw connections to ALL touch points
        const interactionPoints = touchesRef.current.length > 0 
          ? touchesRef.current 
          : [mouseRef.current];
        
        interactionPoints.forEach(point => {
          const mdx = node.x - point.x;
          const mdy = node.y - point.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          
          if (mDist < mouseConnectionDistance && mDist > 5) {
            const opacity = (1 - mDist / mouseConnectionDistance) * 0.8; // 20% lighter
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(point.x, point.y);
            ctx.strokeStyle = isDark 
              ? `rgba(99, 102, 241, ${opacity * 1})`
              : `rgba(0, 113, 227, ${opacity * 0.4})`;
            ctx.lineWidth = isDark ? 1 : 1.5;
            ctx.stroke();
          }
        });
      }

      // Spawn random pulses
      if (frameCount % 120 === 0 && Math.random() > 0.5) {
        const randomNode = Math.floor(Math.random() * nodes.length);
        const nearbyNodes = nodes
          .map((n, i) => ({ index: i, dist: Math.hypot(n.x - nodes[randomNode].x, n.y - nodes[randomNode].y) }))
          .filter(n => n.dist < connectionDistance && n.dist > 10)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 3);
        
        nearbyNodes.forEach(target => {
          pulsesRef.current.push({
            from: randomNode,
            to: target.index,
            progress: 0,
            speed: 0.015 + Math.random() * 0.01,
          });
        });
      }

      // Draw and update pulses
      pulsesRef.current = pulsesRef.current.filter(pulse => {
        pulse.progress += pulse.speed;
        
        if (pulse.progress >= 1) return false;
        
        const from = nodes[pulse.from];
        const to = nodes[pulse.to];
        
        // Safety check - skip if nodes don't exist
        if (!from || !to) return false;
        
        const x = from.x + (to.x - from.x) * pulse.progress;
        const y = from.y + (to.y - from.y) * pulse.progress;
        
        // Draw pulse glow
        const pulseRadius = isDark ? 8 : 12;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseRadius);
        gradient.addColorStop(0, pulseColor);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        return true;
      });

      // Draw touch points (glowing orbs for fingers)
      if (touchesRef.current.length > 0) {
        touchesRef.current.forEach(touch => {
          const touchGradient = ctx.createRadialGradient(touch.x, touch.y, 0, touch.x, touch.y, 20);
          touchGradient.addColorStop(0, isDark ? 'rgba(99, 102, 241, 0.6)' : 'rgba(0, 113, 227, 0.6)');
          touchGradient.addColorStop(0.5, isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0, 113, 227, 0.2)');
          touchGradient.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.arc(touch.x, touch.y, 20, 0, Math.PI * 2);
          ctx.fillStyle = touchGradient;
          ctx.fill();
          
          // Inner dot
          ctx.beginPath();
          ctx.arc(touch.x, touch.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 1)' : 'rgba(0, 113, 227, 1)';
          ctx.fill();
        });
      }

      // Draw nodes - core dots only (no glow)
      nodes.forEach((node) => {
        const pulse = Math.sin(node.pulsePhase) * 0.5 + 0.5;
        const radius = node.radius + pulse * (isDark ? 0.5 : 1);
        
        // Core node only
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark 
          ? `rgba(99, 102, 241, ${(0.4 + pulse * 0.3) * 0.9})` // 20% lighter
          : `rgba(0, 113, 227, ${(0.7 + pulse * 0.3) * 0.8})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
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
