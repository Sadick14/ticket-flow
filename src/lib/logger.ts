
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LogLevel } from './types';

interface LogDetails {
  message: string;
  level?: LogLevel;
  category?: string;
  userId?: string;
  userEmail?: string;
  details?: Record<string, any>;
}

export async function logEvent({
  message,
  level = 'info',
  category = 'general',
  userId,
  userEmail,
  details = {},
}: LogDetails) {
  try {
    // Avoid logging during server-side builds or in non-browser environments
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
        return;
    }
    
    // In a real app, you might have more sophisticated logging,
    // like batching or using a dedicated logging service.
    await addDoc(collection(db, 'logs'), {
      message,
      level,
      category,
      userId: userId || null,
      userEmail: userEmail || null,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log event to Firestore:', error);
  }
}
