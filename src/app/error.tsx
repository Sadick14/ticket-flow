
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logEvent } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to our new logging system
    console.error(error);
    logEvent({
        level: 'fatal',
        category: 'ui-crash',
        message: `Unhandled UI error: ${error.message}`,
        details: {
            name: error.name,
            stack: error.stack,
            digest: error.digest,
        },
    });
  }, [error]);

  const goHome = () => {
    router.push('/home');
  };

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">Something Went Wrong</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            We're sorry for the inconvenience. An unexpected error occurred, and our team has been notified. We are working to fix the problem.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction onClick={goHome}>
            Go to Homepage
          </AlertDialogAction>
          <AlertDialogCancel onClick={() => reset()}>
            Try Again
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
