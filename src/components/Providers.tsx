'use client';

import { SessionProvider } from 'next-auth/react';
import { memo } from 'react';

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Reduce session checks to avoid overwhelming the server
      refetchInterval={5 * 60} // 5 minutes
      refetchOnWindowFocus={true} // Enable refetch on window focus
      refetchWhenOffline={false} // Don't refetch when offline
      // Ensure session is properly initialized
      basePath="/api/auth"
    >
      {children}
    </SessionProvider>
  );
}

export default memo(Providers);
export { Providers };
