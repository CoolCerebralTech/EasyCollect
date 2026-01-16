// =====================================================
// src/hooks/useMediaQuery.ts
// Hook for responsive design breakpoints
// =====================================================

import { useState, useEffect, useCallback } from 'react';

export const useMediaQuery = (query: string): boolean => {
  // ✅ FIXED: Lazy init handles ALL initial sync - NO effect setState needed
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  // Stable event handler
  const handleChange = useCallback((e: MediaQueryListEvent) => {
    setMatches(e.matches);
  }, []);

  // ✅ FIXED: Pure subscription effect - NO synchronous setState
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // ONLY add listener - initial state already correct from lazy init
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query, handleChange]);

  return matches;
};

// Preset breakpoint hooks
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
