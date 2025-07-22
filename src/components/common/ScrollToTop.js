import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop } from '../../utils/scrollUtils';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use smooth scrolling for better UX, but instant for initial page loads
    const isInitialLoad = performance.navigation?.type === performance.navigation?.TYPE_NAVIGATE;
    scrollToTop(isInitialLoad ? 'instant' : 'smooth');
  }, [pathname]);

  return null;
};

export default ScrollToTop;