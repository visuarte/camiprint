'use client';

import { useEffect } from 'react';

const ViewportAnimator = () => {
  useEffect(() => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      root.setAttribute('data-motion', 'reduced');
      return;
    }

    root.setAttribute('data-motion', 'enabled');
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );

    revealElements.forEach((element) => {
      const delay = element.dataset.revealDelay;
      if (delay) {
        element.style.transitionDelay = `${delay}ms`;
      }
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return null;
};

export default ViewportAnimator;
