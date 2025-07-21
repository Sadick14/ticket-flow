
'use server';

/**
 * @fileOverview A flow for generating a complete course structure, including lessons with video recommendations, quizzes, a project, and a unique illustration for each page.
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
    imageUrl: z.string().url().optional().describe('A URL to a generated vector illustration for this specific page.'),
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
    throw new Error(`Failed to generate course content. Details: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
  }
}


// --- GENKIT PROMPTS ---

const PageTextSchema = z.object({
    content: z.string().describe('The detailed content for this page of the lesson, in Markdown format.'),
    imagePrompt: z.string().describe('A simple, descriptive prompt (2-4 keywords) for an image generator to create a relevant, minimalist vector illustration for this specific page.'),
});

const LessonTextSchema = z.object({
    id: z.string().describe("A unique slug-like ID for the lesson, e.g., 'introduction-to-marketing'."),
    title: z.string().describe('The title of the lesson.'),
    duration: z.string().describe('Estimated time to complete the lesson, e.g., "15 mins".'),
    videoUrl: z.string().url().describe('A recommended YouTube video URL for this lesson.'),
    quiz: z.array(QuizQuestionSchema).describe('An array of quiz questions for the lesson.'),
    pages: z.array(PageTextSchema).describe('An array of pages that make up the lesson content.'),
});


const CourseTextOnlySchema = z.object({
    title: z.string(),
    description: z.string().describe('A short, one-paragraph overview of the course.'),
    lessons: z.array(LessonTextSchema).describe('An array of 10 or more lessons that make up the course.'),
    project: ProjectSchema.describe('A final project for the course.'),
    courseImagePrompt: z.string().describe('A simple, descriptive prompt (5-7 keywords) for an image generator to create a relevant, professional cover photo for the entire course.'),
});

const courseContentPrompt = ai.definePrompt({
  name: 'generateCourseTextContentPrompt',
  input: { schema: GenerateCourseContentInputSchema },
  output: { schema: CourseTextOnlySchema },
  system: `You are an expert instructional designer. Your task is to generate a comprehensive and detailed course based on the provided title.
The course must contain:
- A course title and a short, one-paragraph overview.
- A minimum of 5 lesson titles.
- For each lesson, you must provide:
    - A unique slug-like ID.
    - A recommended, highly relevant YouTube video URL.
    - 2-4 detailed pages of content in Markdown format (each page ~4-6 paragraphs).
    - A simple, descriptive image prompt (2-4 keywords) for a vector illustration for *each page*.
    - A quiz with 2-3 multiple-choice questions to test understanding.
- A final project with a title and detailed description.
- A simple, descriptive prompt for a main course cover image.`,
  prompt: `Generate a full course for the topic: {{{title}}}`,
});

// --- GENKIT FLOW ---

const generateCourseContentFlow = ai.defineFlow(
  {
    name: 'generateCourseContentFlow',
    inputSchema: GenerateCourseContentInputSchema,
    outputSchema: GenerateCourseContentOutputSchema,
  },
  async (input) => {
    // 1. Generate the course text content and all image prompts
    const { output: courseTextData } = await courseContentPrompt(input);
    if (!courseTextData || !courseTextData.lessons || courseTextData.lessons.length === 0) {
      throw new Error('AI failed to generate the initial course text content or structure.');
    }
    const { courseImagePrompt, lessons, ...courseContent } = courseTextData;

    // Helper to generate an image with a fallback
    const generateImage = async (prompt: string, fallback: string) => {
        try {
            const { media } = await ai.generate({
                model: 'googleai/gemini-2.0-flash-preview-image-generation',
                prompt: `A vibrant, minimalist vector illustration, cartoon style, representing: ${prompt}`,
                config: { responseModalities: ['TEXT', 'IMAGE'] },
            });
            return media?.url || fallback;
        } catch (e) {
            console.warn(`Image generation failed for prompt: "${prompt}". Using placeholder. Error:`, e);
            return fallback;
        }
    };
    
    // 2. Generate the main course cover image
    const courseImageUrl = await generateImage(courseImagePrompt, 'https://placehold.co/1200x800.png');

    // 3. Generate images for each page in parallel
    const lessonsWithImages: Lesson[] = await Promise.all(
        lessons.map(async (lesson) => {
            const pagesWithImages = await Promise.all(
                lesson.pages.map(async (page) => {
                    const pageImageUrl = await generateImage(page.imagePrompt, 'https://placehold.co/600x400.png');
                    return {
                        content: page.content,
                        imageUrl: pageImageUrl,
                    };
                })
            );
            // Re-structure the lesson to match the output schema, which does not include imagePrompt
            return {
                id: lesson.id,
                title: lesson.title,
                duration: lesson.duration,
                videoUrl: lesson.videoUrl,
                quiz: lesson.quiz,
                pages: pagesWithImages,
            };
        })
    );
    
    // 4. Assemble the final course object
    return {
        ...courseContent,
        imageUrl: courseImageUrl,
        lessons: lessonsWithImages,
        project: courseContent.project
    };
  }
);
