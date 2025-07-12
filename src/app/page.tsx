
<<<<<<< HEAD
import { redirect } from 'next/navigation';
import { shouldShowCountdown } from '@/lib/launch';
=======
'use client';
>>>>>>> 4dca3f0 (I see this error with the app, reported by NextJS, please fix it. The er)
import LaunchPage from './launch/page';

export default function RootPage() {
  if (shouldShowCountdown()) {
    return <LaunchPage />;
  } else {
    redirect('/home');
  }
}
