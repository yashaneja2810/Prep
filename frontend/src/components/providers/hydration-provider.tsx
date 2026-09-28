"use client";

import { useEffect, useState } from 'react';
import { ReactNode } from 'react';

interface HydrationProviderProps {
  children: ReactNode;
}

export function HydrationProvider({ children }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Ensure Zustand stores are hydrated before rendering
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    // Return a loading state or skeleton while hydrating
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return <>{children}</>;
} 