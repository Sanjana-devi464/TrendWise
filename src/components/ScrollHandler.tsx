'use client';

import { useEffect, useState } from 'react';

export default function ScrollHandler() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Handle hash scrolling when component mounts
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }, 100);
        }
      }
    };    // Handle initial hash on page load
    handleHashScroll();

    // Handle hash changes
    const handleHashChange = () => {
      handleHashScroll();
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isClient]);

  return null;
}
