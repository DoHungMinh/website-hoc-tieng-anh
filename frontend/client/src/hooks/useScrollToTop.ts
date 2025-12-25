import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    lenis?: Lenis;
  }
}

/**
 * Custom hook to scroll to top on route change
 * Professional solution for SPA scroll restoration
 * 
 * Features:
 * - Scrolls to top instantly on route change
 * - Handles both window and Lenis smooth scroll
 * - Uses useLayoutEffect to run before browser paint
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Reset Lenis scroll if available (must be done first)
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    }

    // Also use native scroll as fallback
    window.scrollTo(0, 0);

    // Force scroll position for stubborn cases
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
};

export default useScrollToTop;
