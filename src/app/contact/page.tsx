
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import ContactClientPage from './contact-client';

export const metadata: Metadata = generatePageMetadata({
  slug: 'contact',
  title: 'Contact Us - Get in Touch with TicketFlow',
  description: 'Have questions about TicketFlow? Need support with your events? Contact our team via email, phone, or visit our offices. We\'re here to help!',
  image: '/og-contact.jpg',
});

export default function ContactPage() {
    return <ContactClientPage />;
}
