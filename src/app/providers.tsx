'use client';

import { TRPCProvider } from './_trpc/providers';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <Toaster position="top-center" />
      {children}
    </TRPCProvider>
  );
}
