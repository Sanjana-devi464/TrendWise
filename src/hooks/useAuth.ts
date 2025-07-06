'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isLoading = status === 'loading' || !isHydrated;
  const isAuthenticated = status === 'authenticated' && !!session;
  const isUnauthenticated = status === 'unauthenticated';

  // Force session refresh when needed
  const refreshSession = async () => {
    try {
      await update();
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  return {
    session,
    status,
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    isHydrated,
    refreshSession,
  };
}
