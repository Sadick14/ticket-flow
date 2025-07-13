
'use client';

import { useEffect, useState } from 'react';
import { shouldShowCountdown } from '@/lib/launch';
import CountdownPage from '@/components/countdown-page';

interface LaunchWrapperProps {
  children: React.ReactNode;
}

export default function LaunchWrapper({ children }: LaunchWrapperProps) {
  const [showCountdown, setShowCountdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setShowCountdown(shouldShowCountdown());
    setIsLoading(false);

    const interval = setInterval(() => {
        setShowCountdown(shouldShowCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (showCountdown) {
    return <CountdownPage />;
  }

  return <>{children}</>;
}
