
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import MyPageClient from './my-page-client';

export const metadata: Metadata = generatePageMetadata({
  slug: 'my-page',
  title: 'My Page - TicketFlow',
  description: 'View and manage all your pending tickets and subscriptions in one place.',
  image: '/og-tickets.jpg',
});

export default function MyPage() {
  return <MyPageClient />;
}
