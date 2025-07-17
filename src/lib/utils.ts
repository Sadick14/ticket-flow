
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isTomorrow, isYesterday, formatRelative } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(date: Date): string {
  if (isToday(date)) {
    return `Today ${format(date, 'p')}`;
  }
  if (isTomorrow(date)) {
    return 'Tomorrow';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  // For dates further away, format them as "Mon, Jun 23"
  return format(date, 'E, MMM d');
}
