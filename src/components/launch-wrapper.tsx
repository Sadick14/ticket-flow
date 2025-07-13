
'use client';

import { redirect, usePathname } from 'next/navigation';
import { shouldShowCountdown } from '@/lib/launch';

interface LaunchWrapperProps {
  children: React.ReactNode;
}

export default function LaunchWrapper({ children }: LaunchWrapperProps) {
  const pathname = usePathname();
  const isLaunchRoute = pathname === '/launch';
  
  // If countdown should be shown and we are not already on the launch page, redirect.
  if (shouldShowCountdown() && !isLaunchRoute) {
    redirect('/launch');
  }

  // If countdown is over and user is on the launch page, redirect to home.
  if (!shouldShowCountdown() && isLaunchRoute) {
    redirect('/');
  }

  return <>{children}</>;
}
