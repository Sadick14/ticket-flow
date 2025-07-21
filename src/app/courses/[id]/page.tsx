
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { Course } from '@/lib/types';
import CourseDetailsClient from './course-details-client';
import { generatePageMetadata } from '@/lib/metadata';


// This function fetches the data for a single course
async function getCourseData(id: string): Promise<Course | null> {
    const docRef = doc(db, 'courses', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
            id: docSnap.id, 
            ...data,
            // Firestore timestamps need to be converted
            // For now, assuming they are stored as ISO strings
        } as Course;
    }
    return null;
}

// This function generates dynamic metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const course = await getCourseData(params.id);
    if (!course) {
        return {
            title: 'Course Not Found',
            description: 'The requested course could not be found.',
        };
    }
    return generatePageMetadata({
      slug: `courses/${course.id}`,
      title: `${course.title} | TicketFlow Courses`,
      description: course.description.substring(0, 160),
      image: course.imageUrl,
    });
}

// The main page component
export default async function CourseDetailsPage({ params }: { params: { id: string } }) {
    const course = await getCourseData(params.id);

    if (!course) {
        notFound();
    }

    return <CourseDetailsClient course={course} />;
}
