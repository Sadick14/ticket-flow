
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import CoursesClient from './courses-client';

export const metadata: Metadata = generatePageMetadata({
  slug: 'courses',
  title: 'Courses - TicketFlow',
  description: 'Level up your event management skills with expert-led courses on marketing, sponsorship, and more. Join the TicketFlow learning community.',
  image: '/og-courses.jpg', // You'll need to create this image
});

export default function CoursesPage() {
  return <CoursesClient />;
}
