'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {          queries: {
            staleTime: 1000 * 60 * 60, // Data stays fresh for 1 hour
            cacheTime: 1000 * 60 * 60 * 24, // Keep unused data in cache for 24 hours
            refetchOnWindowFocus: false,
            retry: 3, // Retry failed requests 3 times
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
