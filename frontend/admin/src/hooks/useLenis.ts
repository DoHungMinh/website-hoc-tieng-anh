import { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';

export interface LenisOptions {
  duration?: number;
  easing?: (t: number) => number;
  orientation?: 'vertical' | 'horizontal';
  gestureOrientation?: 'vertical' | 'horizontal' | 'both';
  smoothWheel?: boolean;
  syncTouch?: boolean;
  touchMultiplier?: number;
  infinite?: boolean;
}

/**
 * Custom hook for smooth scrolling using Lenis
 * Respects user's prefers-reduced-motion preference
 */
export function useLenis(options?: LenisOptions) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Respect user's motion preferences for accessibility
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return; // Don't initialize smooth scroll if user prefers reduced motion
    }

    // Initialize Lenis with optimized defaults
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 2,
      infinite: false,
      ...options,
    });

    lenisRef.current = lenis;
    // Expose lenis globally for useScrollToTop
    (window as any).lenis = lenis;

    // Animation frame loop
    function raf(time: number) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }

    rafIdRef.current = requestAnimationFrame(raf);

    // Cleanup
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      lenis.destroy();
      lenisRef.current = null;
      (window as any).lenis = null;
    };
  }, []);

  // Memoized scrollTo function
  const scrollTo = useCallback((
    target: string | number | HTMLElement,
    scrollOptions?: { offset?: number; duration?: number }
  ) => {
    lenisRef.current?.scrollTo(target, scrollOptions);
  }, []);

  const stop = useCallback(() => lenisRef.current?.stop(), []);
  const start = useCallback(() => lenisRef.current?.start(), []);

  return {
    lenis: lenisRef.current,
    scrollTo,
    stop,
    start,
  };
}
