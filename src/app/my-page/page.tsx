
import { redirect } from 'next/navigation';

// This page is deprecated and now redirects to /tickets
export default function MyPage() {
    redirect('/tickets');
}
