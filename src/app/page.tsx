
import { redirect } from 'next/navigation';
import { shouldShowCountdown } from '@/lib/launch';
import LaunchPage from './launch/page';

export default function RootPage() {
  if (shouldShowCountdown()) {
    return <LaunchPage />;
  } else {
    redirect('/home');
  }
}
