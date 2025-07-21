
'use server';

/**
 * @fileOverview A flow for generating a complete course structure, including lessons with video recommendations, quizzes, and a project.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- INPUT/OUTPUT SCHEMAS ---

const GenerateCourseContentInputSchema = z.object({
  title: z.string().describe('The title of the course to generate.'),
});
export type GenerateCourseContentInput = z.infer<typeof GenerateCourseContentInputSchema>;

const QuizQuestionSchema = z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string(),
});

const PageSchema = z.object({
    content: z.string().describe('The detailed content for this page of the lesson, in Markdown format.'),
});

const LessonSchema = z.object({
    id: z.string().describe("A unique slug-like ID for the lesson, e.g., 'introduction-to-marketing'."),
    title: z.string().describe('The title of the lesson.'),
    duration: z.string().describe('Estimated time to complete the lesson, e.g., "15 mins".'),
    videoUrl: z.string().url().describe('A recommended YouTube video URL for this lesson.'),
    quiz: z.array(QuizQuestionSchema).describe('An array of quiz questions for the lesson.'),
    pages: z.array(PageSchema).describe('An array of pages that make up the lesson content.'),
});

const ProjectSchema = z.object({
    title: z.string().describe('The title of the final project.'),
    description: z.string().describe('A detailed description of the project requirements in Markdown.'),
});

const GenerateCourseContentOutputSchema = z.object({
    title: z.string(),
    description: z.string().describe('A short, one-paragraph overview of the course.'),
    imageUrl: z.string().url().describe('A URL to a generated cover image for the course.'),
    lessons: z.array(LessonSchema).describe('An array of lessons that make up the course.'),
    project: ProjectSchema.describe('A final project for the course.'),
});
export type GenerateCourseContentOutput = z.infer<typeof GenerateCourseContentOutputSchema>;


// --- PUBLIC-FACING FUNCTION ---

export async function generateCourseContent(
  input: GenerateCourseContentInput
): Promise<GenerateCourseContentOutput> {
  const hasGoogleAIKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!hasGoogleAIKey) {
    throw new Error('AI features are unavailable. Please configure a Google AI API key.');
  }

  try {
    return await generateCourseContentFlow(input);
  } catch (error) {
    console.error('Course generation flow failed:', error);
    throw new Error('Failed to generate course content due to an internal error.');
  }
}


// --- GENKIT PROMPTS ---

// Step 1: Generate the high-level course outline
const CourseOutlineSchema = z.object({
    title: z.string(),
    description: z.string().describe('A short, one-paragraph overview of the course.'),
    imagePrompt: z.string().describe('A simple, descriptive prompt (5-7 keywords) for an image generator to create a relevant, professional cover photo for the entire course.'),
    lessonTitles: z.array(z.string()).describe('An array of 10 or more lesson titles.'),
    project: ProjectSchema.describe('A final project for the course.'),
});

const courseOutlinePrompt = ai.definePrompt({
  name: 'generateCourseOutlinePrompt',
  input: { schema: GenerateCourseContentInputSchema },
  output: { schema: CourseOutlineSchema },
  system: `You are an expert instructional designer. Your task is to generate a high-level course outline based on the provided title.
The course must contain a minimum of 10 lesson titles and a final project. Also create a descriptive prompt for a cover image.`,
  prompt: `Generate a course outline for the topic: {{{title}}}`,
});

// Step 2: Generate content for a single lesson
const LessonContentInputSchema = z.object({
    courseTitle: z.string(),
    lessonTitle: z.string(),
});

const LessonContentSchema = z.object({
    id: z.string().describe("A unique slug-like ID for the lesson, e.g., 'introduction-to-marketing'."),
    title: z.string(),
    duration: z.string().describe('Estimated time to complete the lesson, e.g., "15 mins".'),
    videoUrl: z.string().url().describe('A recommended YouTube video URL that is highly relevant to this lesson topic.'),
    pages: z.array(PageSchema).min(2).describe('An array of 2-4 pages that make up the lesson content.'),
    quiz: z.array(QuizQuestionSchema).min(2).describe('An array of 2-3 quiz questions for the lesson.'),
});

const lessonContentPrompt = ai.definePrompt({
    name: 'generateLessonContentPrompt',
    input: { schema: LessonContentInputSchema },
    output: { schema: LessonContentSchema },
    system: `You are an expert instructional designer creating content for a course titled "{{courseTitle}}".
Your task is to generate the detailed content for a single lesson titled "{{lessonTitle}}".
The lesson must include:
- A slug-like ID.
- A recommended, highly relevant YouTube video URL.
- 2-4 detailed pages of content in Markdown format (each page ~4-6 paragraphs).
- A quiz with 2-3 multiple-choice questions to test understanding.`,
    prompt: 'Generate the lesson content.'
});

// Utility to convert data URI to Blob for upload
function dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}


// --- GENKIT FLOW ---

const generateCourseContentFlow = ai.defineFlow(
  {
    name: 'generateCourseContentFlow',
    inputSchema: GenerateCourseContentInputSchema,
    outputSchema: GenerateCourseContentOutputSchema,
  },
  async (input) => {
    // 1. Generate the high-level course outline
    const { output: courseOutline } = await courseOutlinePrompt(input);
    if (!courseOutline) {
      throw new Error('Failed to generate course outline.');
    }

    // 2. Generate the cover image and upload it
    let imageUrl = 'https://placehold.co/1200x800.png'; // Fallback
    try {
        const { media } = await ai.generate({
            model: 'googleai/gemini-pro-vision',
            prompt: `A high-quality photograph of people engaging with technology in a modern event setting, representing: ${courseOutline.imagePrompt}`,
            config: { responseModalities: ['IMAGE'] },
        });

        if (media?.url) {
            const imageBlob = dataURItoBlob(media.url);
            const formData = new FormData();
            formData.append('file', imageBlob, 'course-cover.png');
            
            const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            });
            const uploadResult = await uploadResponse.json();
            if (uploadResult.success) {
                imageUrl = uploadResult.url;
            }
        }
    } catch (e) {
        console.warn(`Image generation/upload failed. Using placeholder.`, e);
    }
    

    // 3. Generate content for each lesson in parallel
    const lessonPromises = courseOutline.lessonTitles.map(lessonTitle => 
        lessonContentPrompt({ courseTitle: courseOutline.title, lessonTitle })
    );
    const lessonResults = await Promise.all(lessonPromises);
    const lessons = lessonResults.map(res => res.output).filter((l): l is LessonContentSchema => l !== null);


    // 4. Assemble the final course object
    return {
        title: courseOutline.title,
        description: courseOutline.description,
        imageUrl: imageUrl,
        lessons: lessons,
        project: courseOutline.project,
    };
  }
);
