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
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const isUnauthenticated = status === 'unauthenticated';

  // Force session refresh when needed
  const refreshSession = async () => {
    try {
      console.log('🔄 Refreshing session...');
      const updatedSession = await update();
      console.log('✅ Session refreshed:', updatedSession);
      return updatedSession;
    } catch (error) {
      console.error('❌ Error refreshing session:', error);
      throw error;
    }
  };

  // Debug logging
  useEffect(() => {
    if (isHydrated) {
      console.log('🔍 Auth state:', {
        status,
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        isAuthenticated,
        isUnauthenticated
      });
    }
  }, [status, session, isAuthenticated, isUnauthenticated, isHydrated]);

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
