
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import type { Organization, Event, NewsArticle } from '@/lib/types';
import OrganizationDetailsClient from './organization-details-client';
import { generatePageMetadata } from '@/lib/metadata';


async function getOrganizationData(id: string): Promise<{ organization: Organization; events: Event[]; news: NewsArticle[] } | null> {
    const orgRef = doc(db, 'organizations', id);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
        return null;
    }

    const organization = { id: orgSnap.id, ...orgSnap.data() } as Organization;

    const eventsQuery = query(
        collection(db, 'events'),
        where('organizationId', '==', id),
        where('status', '==', 'active')
        // orderBy('date', 'desc') // This requires a composite index. Removing it to prevent crash.
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sorting in code instead.

    const newsQuery = query(
        collection(db, 'news'),
        where('organizationId', '==', id),
        where('status', '==', 'published'),
        orderBy('publishedDate', 'desc')
    );
    const newsSnapshot = await getDocs(newsQuery);
    const news = newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle));

    return { organization, events, news };
}


export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const data = await getOrganizationData(params.id);
    if (!data) {
        return {
            title: 'Organization Not Found',
        };
    }
    return generatePageMetadata({
      slug: `organization/${data.organization.id}`,
      title: `${data.organization.name} | TicketFlow`,
      description: data.organization.description || `Events and news from ${data.organization.name}.`,
      image: data.organization.logoUrl,
    });
}


export default async function OrganizationPage({ params }: { params: { id: string } }) {
    const data = await getOrganizationData(params.id);

    if (!data) {
        notFound();
    }

    return <OrganizationDetailsClient initialData={data} />;
}
