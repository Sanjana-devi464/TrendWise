'use client';

import { SessionProvider } from 'next-auth/react';
import { memo } from 'react';

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // More frequent session checks for better sync
      refetchInterval={60} // 1 minute
      refetchOnWindowFocus={true} // Enable refetch on window focus
      refetchWhenOffline={false} // Don't refetch when offline
    >
      {children}
    </SessionProvider>
  );
}

export default memo(Providers);
export { Providers };
