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
  const imageUrl = data.image ? (data.image.startsWith('http') ? data.image : `${baseUrl}${data.image}`) : `${baseUrl}/og-default.jpg`;

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
  image?: string;
  date: string;
  location: string;
  price?: number;
  organizer?: string;
  tags?: string[];
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
    image: event.image,
    url: `/events/${event.id}`,
    type: 'event',
    author: event.organizer,
    tags: event.tags,
    eventDate: event.date,
    eventLocation: event.location,
    price: event.price?.toString(),
  });
}

export function generateNewsMetadata(article: {
  id: string;
  title: string;
  content: string;
  image?: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  tags?: string[];
}): Metadata {
  return generateMetadata({
    title: `${article.title} | TicketFlow News`,
    description: article.content.substring(0, 160).replace(/<[^>]*>/g, '') + '...',
    image: article.image,
    url: `/news/${article.id}`,
    type: 'article',
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    author: article.author,
    tags: article.tags,
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
  title: string;
  description: string;
  image?: string;
  date: string;
  location: string;
  price?: number;
  organizer?: string;
  url?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ticket-flow.up.railway.app';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.date,
    location: {
      '@type': 'Place',
      name: event.location,
      address: event.location,
    },
    image: event.image ? (event.image.startsWith('http') ? event.image : `${baseUrl}${event.image}`) : undefined,
    organizer: event.organizer ? {
      '@type': 'Organization',
      name: event.organizer,
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
  content: string;
  image?: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ticket-flow.up.railway.app';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    articleBody: article.content.replace(/<[^>]*>/g, ''),
    image: article.image ? (article.image.startsWith('http') ? article.image : `${baseUrl}${article.image}`) : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: article.author ? {
      '@type': 'Person',
      name: article.author,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'TicketFlow',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/tf-logo.png`,
      },
    },
    url: `${baseUrl}/news/${article.id}`,
  };
}
