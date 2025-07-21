import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { collection, doc, getDoc, getDocs, query, limit } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { generateNewsMetadata } from '@/lib/metadata';
import type { NewsArticle } from '@/lib/types';
import NewsDetailsClient from './news-details-client';

// Force dynamic rendering to ensure fresh data on every request
export const dynamic = 'force-dynamic';

async function getArticleData(id: string): Promise<NewsArticle | null> {
    const docRef = doc(db, 'news', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: docSnap.id, ...data } as NewsArticle;
    }
    return null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const article = await getArticleData(params.id);
    if (!article) {
        return {
            title: 'Article Not Found',
            description: 'The requested news article could not be found.',
        };
    }
    return generateNewsMetadata(article);
}

export default async function NewsArticlePage({ params }: { params: { id: string } }) {
    const article = await getArticleData(params.id);

    if (!article) {
        notFound();
    }

    return <NewsDetailsClient article={article} />;
}
