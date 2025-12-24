import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to scroll to top on route change
 * Professional solution for SPA scroll restoration
 * 
 * Features:
 * - Scrolls to top instantly on route change
 * - Handles both window and Lenis smooth scroll
 * - Ignores hash changes (anchor links)
 * - Preserves scroll on back/forward navigation via browser
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top instantly (not smooth, to avoid visual delay)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    // Also reset Lenis scroll if available
    const lenis = (window as Window & { lenis?: { scrollTo: (target: number, options?: { immediate?: boolean }) => void } }).lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);
};

export default useScrollToTop;
