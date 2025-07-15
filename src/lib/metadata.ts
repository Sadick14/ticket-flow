
import { Metadata } from 'next';

export interface PageMetadata {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'event';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  eventDate?: string;
  eventLocation?: string;
  price?: string;
}

export function generateMetadata(data: PageMetadata): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ticket-flow.up.railway.app';
  const fullUrl = data.url ? `${baseUrl}${data.url}` : baseUrl;
  const imageUrl = data.image ? (data.image.startsWith('http') ? data.image : `${baseUrl}${data.image}`) : `${baseUrl}/tf-logo.png`;

  return {
    title: data.title,
    description: data.description,
    keywords: data.tags?.join(', '),
    authors: data.author ? [{ name: data.author }] : undefined,
    openGraph: {
      title: data.title,
      description: data.description,
      url: fullUrl,
      siteName: 'TicketFlow',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
      locale: 'en_US',
      type: data.type === 'article' ? 'article' : 'website',
      publishedTime: data.publishedTime,
      modifiedTime: data.modifiedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      images: [imageUrl],
      creator: '@TicketFlow',
      site: '@TicketFlow',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

export function generateEventMetadata(event: {
  id: string;
  title: string;
  description: string;
  imageUrl?: string; // Corrected to match Event type
  date: string;
  location: string;
  price?: number;
  organizationName?: string;
  category?: string;
}): Metadata {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const priceText = event.price ? `Starting from $${event.price}` : 'Free Event';
  
  return generateMetadata({
    title: `${event.title} | TicketFlow Events`,
    description: `Join us for ${event.title} on ${formattedDate} at ${event.location}. ${event.description.substring(0, 120)}... ${priceText}`,
    image: event.imageUrl,
    url: `/events/${event.id}`,
    type: 'event',
    author: event.organizationName,
    tags: event.category ? [event.category] : [],
    eventDate: event.date,
    eventLocation: event.location,
    price: event.price?.toString(),
  });
}

export function generateNewsMetadata(article: {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  publishedDate: string;
  source?: string;
}): Metadata {
  return generateMetadata({
    title: `${article.title} | TicketFlow News`,
    description: article.description.substring(0, 160).replace(/<[^>]*>/g, '') + '...',
    image: article.imageUrl,
    url: `/news/${article.id}`,
    type: 'article',
    publishedTime: article.publishedDate,
    author: article.source || 'TicketFlow',
    tags: ['news', 'events', article.source || ''],
  });
}

export function generatePageMetadata(page: {
  slug: string;
  title: string;
  description: string;
  image?: string;
  updatedAt?: string;
}): Metadata {
  return generateMetadata({
    title: `${page.title} | TicketFlow`,
    description: page.description,
    image: page.image,
    url: `/${page.slug}`,
    type: 'website',
    modifiedTime: page.updatedAt,
  });
}

// Schema.org structured data generators
export function generateEventStructuredData(event: {
  id: string;
  name: string; // Corrected to 'name' for consistency with Event type
  description: string;
  imageUrl?: string;
  date: string;
  location: string;
  price?: number;
  organizationName?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ticket-flow.up.railway.app';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.date,
    location: {
      '@type': 'Place',
      name: event.location,
      address: event.location,
    },
    image: event.imageUrl ? (event.imageUrl.startsWith('http') ? event.imageUrl : `${baseUrl}${event.imageUrl}`) : undefined,
    organizer: event.organizationName ? {
      '@type': 'Organization',
      name: event.organizationName,
    } : undefined,
    offers: event.price ? {
      '@type': 'Offer',
      price: event.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/events/${event.id}`,
    } : undefined,
    url: `${baseUrl}/events/${event.id}`,
  };
}

export function generateArticleStructuredData(article: {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  publishedDate: string;
  source?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ticket-flow.up.railway.app';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    articleBody: article.description.replace(/<[^>]*>/g, ''),
    image: article.imageUrl ? (article.imageUrl.startsWith('http') ? article.imageUrl : `${baseUrl}${article.imageUrl}`) : undefined,
    datePublished: article.publishedDate,
    author: article.source ? {
      '@type': 'Organization',
      name: article.source,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'TicketFlow',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/tf-logo.png`,
      },
    },
    mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/news/${article.id}`
    }
  };
}
