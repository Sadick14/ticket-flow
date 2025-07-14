'use client';

import { useEffect, useState } from 'react';
import { shouldShowCountdown } from '@/lib/launch';
import LaunchPage from '@/app/launch/page';

interface LaunchWrapperProps {
  children: React.ReactNode;
}

export default function LaunchWrapper({ children }: LaunchWrapperProps) {
  const [showCountdown, setShowCountdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we should show countdown
    const shouldShow = shouldShowCountdown();
    setShowCountdown(shouldShow);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showCountdown) {
    return <LaunchPage />;
  }

  return <>{children}</>;
}