
/**
 * Launch Configuration Utility
 * Manages the app's launch state and countdown functionality
 */

export interface LaunchConfig {
  launchDate: Date;
  isLaunched: boolean;
  isCountdownMode: boolean;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  };
}

export function getLaunchConfig(): LaunchConfig {
  // Get launch date from environment or default to Friday
  const launchDateString = process.env.NEXT_PUBLIC_LAUNCH_DATE || '2025-07-18T12:00:00Z';
  const launchDate = new Date(launchDateString);
  const now = new Date();
  
  // Check if launch mode is enabled
  const launchMode = process.env.NEXT_PUBLIC_LAUNCH_MODE || 'live';
  const isCountdownMode = launchMode === 'countdown';
  
  // Calculate if we've launched
  const isLaunched = now >= launchDate;
  
  // Calculate time remaining
  const timeDiff = launchDate.getTime() - now.getTime();
  const timeRemaining = {
    total: Math.max(0, timeDiff),
    days: Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24))),
    hours: Math.max(0, Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
    minutes: Math.max(0, Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))),
    seconds: Math.max(0, Math.floor((timeDiff % (1000 * 60)) / 1000)),
  };

  return {
    launchDate,
    isLaunched,
    isCountdownMode,
    timeRemaining,
  };
}

export function shouldShowCountdown(): boolean {
  const config = getLaunchConfig();
  return config.isCountdownMode && !config.isLaunched;
}

export function formatTimeUnit(value: number): string {
  return value.toString().padStart(2, '0');
}

export function getCountdownMessage(timeRemaining: LaunchConfig['timeRemaining']): string {
  if (timeRemaining.total <= 0) {
    return "We're Live!";
  }
  
  if (timeRemaining.days > 0) {
    return `${timeRemaining.days} day${timeRemaining.days !== 1 ? 's' : ''} to go!`;
  } else if (timeRemaining.hours > 0) {
    return `${timeRemaining.hours} hour${timeRemaining.hours !== 1 ? 's' : ''} to go!`;
  } else if (timeRemaining.minutes > 0) {
    return `${timeRemaining.minutes} minute${timeRemaining.minutes !== 1 ? 's' : ''} to go!`;
  } else {
    return "Launching any moment now!";
  }
}
