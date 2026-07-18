// =====================================================
// hooks/useScrollReveal.ts
// IntersectionObserver-based scroll-triggered animation.
// Returns a ref to attach to any element + a boolean
// indicating whether it's in view. Animates once.
// =====================================================

import { useRef, useState, useEffect } from 'react';

export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15,
  rootMargin = '0px 0px -50px 0px'
) => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target); // animate once
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView };
};
