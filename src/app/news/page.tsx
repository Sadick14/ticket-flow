
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import NewsPageClient from './news-client';

export const metadata: Metadata = generatePageMetadata({
  slug: 'news',
  title: 'News - TicketFlow',
  description: 'Stay up-to-date with the latest news and announcements from the world of events. Discover featured stories and trends curated by the TicketFlow team.',
  image: '/og-news.jpg',
});

export default function NewsPage() {
  return <NewsPageClient />;
}
