
'use server';

/**
 * @fileOverview A flow for generating a complete course structure, including lessons with illustrated pages, quizzes, and a project.
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
    imageUrl: z.string().url().describe('A data URI of a generated image that visually represents the page content.'),
});

const LessonSchema = z.object({
    id: z.string().describe("A unique slug-like ID for the lesson, e.g., 'introduction-to-marketing'."),
    title: z.string().describe('The title of the lesson.'),
    duration: z.string().describe('Estimated time to complete the lesson, e.g., "15 mins".'),
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


// --- GENKIT PROMPT ---
const PageGenerationSchema = z.object({
    content: z.string().describe('The detailed content for this page of the lesson, in Markdown format. Be professional, detailed, and thorough. Aim for approximately 6 paragraphs.'),
    imagePrompt: z.string().describe('A simple, descriptive prompt (3-5 keywords) for an image generator to create a relevant, professional vector illustration for this page.'),
});

const LessonGenerationSchema = z.object({
    id: z.string().describe("A unique slug-like ID for the lesson, e.g., 'introduction-to-marketing'."),
    title: z.string().describe('The title of the lesson.'),
    duration: z.string().describe('Estimated time to complete the lesson, e.g., "15 mins".'),
    quiz: z.array(QuizQuestionSchema).describe('An array of quiz questions for the lesson.'),
    pages: z.array(PageGenerationSchema).describe('An array of pages that make up the lesson content. Each lesson should have 2-4 pages to cover the topic in detail.'),
});

const CourseGenerationSchema = z.object({
    title: z.string(),
    description: z.string().describe('A short, one-paragraph overview of the course.'),
    lessons: z.array(LessonGenerationSchema).describe('An array of lessons that make up the course. It should contain 10 or more lessons.'),
    project: ProjectSchema.describe('A final project for the course.'),
});

const coursePrompt = ai.definePrompt({
  name: 'generateCourseStructurePrompt',
  input: { schema: GenerateCourseContentInputSchema },
  output: { schema: CourseGenerationSchema },
  system: `You are an expert instructional designer specializing in creating professional, detailed courses for event organizers.
Your task is to generate a complete, high-quality online course based on the provided title. The course should be structured for professionals, with in-depth content.

The course must be broken down into a minimum of 10 logical lessons. Each lesson must:
- Have a unique slug-like ID.
- Have a clear title and estimated duration.
- Be further broken down into 2-4 detailed pages to ensure comprehensive coverage of the topic.
- For each page, provide very detailed, expert-level content in Markdown format, aiming for approximately 6 paragraphs per page to ensure depth.
- For each page, also provide a simple, descriptive image prompt (3-5 keywords) that an AI image generator can use to create a relevant, professional vector illustration.
- Conclude with a short quiz (2-3 multiple-choice questions) to test understanding.

The entire course must also include a final project that requires the student to apply what they've learned.

Ensure the final output is a single, valid JSON object that adheres strictly to the output schema.`,
  prompt: `Generate a complete online course for the topic: {{{title}}}`,
});


// --- GENKIT FLOW ---

const generateCourseContentFlow = ai.defineFlow(
  {
    name: 'generateCourseContentFlow',
    inputSchema: GenerateCourseContentInputSchema,
    outputSchema: GenerateCourseContentOutputSchema,
  },
  async (input) => {
    // 1. Generate the course structure and text content
    const { output: courseStructure } = await coursePrompt(input);
    if (!courseStructure) {
      throw new Error('Failed to generate course structure from the AI model.');
    }

    // 2. Generate images for each page of each lesson in parallel
    const illustratedLessons = await Promise.all(
        courseStructure.lessons.map(async (lesson) => {
            const illustratedPages = await Promise.all(
                lesson.pages.map(async (page) => {
                    try {
                        const { media } = await ai.generate({
                            model: 'googleai/gemini-2.0-flash-preview-image-generation',
                            prompt: `A modern, professional vector illustration in a clean, cartoon-like style for a business course, representing: ${page.imagePrompt}`,
                            config: { responseModalities: ['TEXT', 'IMAGE'] },
                        });
                        return {
                            content: page.content,
                            imageUrl: media?.url || 'https://placehold.co/600x400.png',
                        };
                    } catch (e) {
                        console.warn(`Image generation failed for prompt: "${page.imagePrompt}". Using placeholder.`);
                        return {
                            content: page.content,
                            imageUrl: 'https://placehold.co/600x400.png', // Fallback placeholder
                        };
                    }
                })
            );
            return { ...lesson, pages: illustratedPages };
        })
    );

    // 3. Assemble the final course object
    return {
        ...courseStructure,
        lessons: illustratedLessons,
    };
  }
);
