
import type { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { NewsArticle } from '@/lib/types';
import { NewsDetailsView } from '@/components/news-details-view';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const articleId = params.id;
  const articleRef = doc(db, 'news', articleId);
  const articleSnap = await getDoc(articleRef);

  if (!articleSnap.exists()) {
    return {
      title: 'Article Not Found',
    }
  }

  const article = articleSnap.data() as NewsArticle;

  return {
    title: `${article.title} | TicketFlow`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      images: [
        {
          url: article.imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      url: `/news/${articleId}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [article.imageUrl],
    },
  }
}

async function getArticle(id: string): Promise<NewsArticle | null> {
    const articleRef = doc(db, 'news', id);
    const docSnap = await getDoc(articleRef);
    if (!docSnap.exists()) {
        return null;
    }
    return { id: docSnap.id, ...docSnap.data() } as NewsArticle;
}


export default async function NewsDetailsPage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  return <NewsDetailsView initialArticle={article} />;
}
