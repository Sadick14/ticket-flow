'use client';

import { useEffect, useState } from 'react';
import { shouldShowCountdown, getLaunchConfig } from '@/lib/launch';
import CountdownPage from '@/components/countdown-page';

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

    // Set up interval to check launch status
    const interval = setInterval(() => {
      const config = getLaunchConfig();
      
      // If we've launched, switch to main app
      if (config.isLaunched || !config.isCountdownMode) {
        setShowCountdown(false);
      } else {
        setShowCountdown(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show countdown if we're in countdown mode and haven't launched
  if (showCountdown) {
    return <CountdownPage />;
  }

  // Show main app
  return <>{children}</>;
}
