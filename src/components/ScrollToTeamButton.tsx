'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface ScrollToTeamButtonProps {
  children: ReactNode;
  className?: string;
}

export default function ScrollToTeamButton({ children, className = '' }: ScrollToTeamButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    // If already on about page, just scroll to the section
    if (pathname === '/about') {
      const element = document.getElementById('meet-the-team');
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    } else {
      // Navigate to about page with hash
      router.push('/about#meet-the-team');
      
      // Small delay to ensure navigation completes before scrolling
      setTimeout(() => {
        const element = document.getElementById('meet-the-team');
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      type="button"
      aria-label="Go to Meet the Team section"
    >
      {children}
    </button>
  );
}
