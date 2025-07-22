/**
 * Utility functions for smooth scrolling behavior
 */
import { useEffect } from 'react';

/**
 * Smoothly scroll to the top of the page
 * @param {string} behavior - 'smooth', 'instant', or 'auto' (default: 'smooth')
 */
export const scrollToTop = (behavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: behavior
  });
};

/**
 * Scroll to a specific element by ID
 * @param {string} elementId - The ID of the element to scroll to
 * @param {string} behavior - 'smooth', 'instant', or 'auto' (default: 'smooth')
 * @param {number} offset - Offset from the top in pixels (default: 0)
 */
export const scrollToElement = (elementId, behavior = 'smooth', offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: elementPosition - offset,
      left: 0,
      behavior: behavior
    });
  }
};

/**
 * Hook to automatically scroll to top on route change
 * Use this in components that should scroll to top when navigated to
 */
export const useScrollToTop = () => {
  useEffect(() => {
    scrollToTop('instant');
  }, []);
};