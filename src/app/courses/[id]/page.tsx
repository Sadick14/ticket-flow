
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { collection, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { Course, Lesson } from '@/lib/types';
import CourseDetailsClient from './course-details-client';
import { generatePageMetadata } from '@/lib/metadata';


// This function fetches the data for a single course and its lessons
async function getCourseData(id: string): Promise<{ course: Course; lessons: Lesson[] } | null> {
    const courseRef = doc(db, 'courses', id);
    const lessonsRef = collection(db, 'courses', id, 'lessons');

    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) {
        return null;
    }
    const course = { id: courseSnap.id, ...courseSnap.data() } as Course;
    
    const lessonsQuery = query(lessonsRef, orderBy('title')); // Assuming you want them ordered
    const lessonsSnap = await getDocs(lessonsQuery);
    const lessons = lessonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));

    return { course, lessons };
}

// This function generates dynamic metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const data = await getCourseData(params.id);
    if (!data) {
        return {
            title: 'Course Not Found',
            description: 'The requested course could not be found.',
        };
    }
    return generatePageMetadata({
      slug: `courses/${data.course.id}`,
      title: `${data.course.title} | TicketFlow Courses`,
      description: data.course.description.substring(0, 160),
      image: data.course.imageUrl,
    });
}

// The main page component
export default async function CourseDetailsPage({ params }: { params: { id:string } }) {
    const data = await getCourseData(params.id);

    if (!data) {
        notFound();
    }

    return <CourseDetailsClient course={data.course} lessons={data.lessons} />;
}
