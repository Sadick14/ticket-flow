import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import PaymentSettingsClient from './payment-settings-client';

export const metadata: Metadata = generatePageMetadata({
  slug: 'dashboard/payment-settings',
  title: 'Payment Settings - TicketFlow Dashboard',
  description: 'Manage your payment methods, payout preferences, and view your earnings. Configure how you receive payments from ticket sales.',
  image: '/og-dashboard.jpg',
});

export default function PaymentSettingsPage() {
  return <PaymentSettingsClient />;
}
