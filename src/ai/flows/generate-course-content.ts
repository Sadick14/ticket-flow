
'use server';

/**
 * @fileOverview A flow for generating a complete course structure, including lessons, quizzes, and a project, from a single topic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

const LessonSchema = z.object({
    id: z.string().describe("A unique slug-like ID for the lesson, e.g., 'introduction-to-marketing'."),
    title: z.string().describe('The title of the lesson.'),
    content: z.string().describe('The full lesson content in Markdown format.'),
    duration: z.string().describe('Estimated time to complete the lesson, e.g., "15 mins".'),
    quiz: z.array(QuizQuestionSchema).describe('An array of quiz questions for the lesson.'),
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

const coursePrompt = ai.definePrompt({
  name: 'generateCourseContentPrompt',
  input: { schema: GenerateCourseContentInputSchema },
  output: { schema: GenerateCourseContentOutputSchema },
  system: `You are an expert instructional designer specializing in event management. Your task is to generate a complete, high-quality online course based on the provided title.

The course should be structured logically, starting with fundamentals and progressing to more advanced topics.

For each lesson, you must provide:
- A unique, slug-like ID (e.g., 'introduction', 'sponsorship-basics').
- A clear title.
- Comprehensive content in Markdown format. Use headings, lists, and bold text to structure the information.
- An estimated duration (e.g., "15 mins", "1 hour").
- A short quiz with 2-3 multiple-choice questions to test understanding. Each question must have several options and a clearly indicated correct answer.

The entire course must also include a final project that requires the student to apply what they've learned. The project should have a title and a detailed description of the requirements.

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
    const { output } = await coursePrompt(input);
    if (!output) {
      throw new Error('Failed to get a valid response from the AI model.');
    }
    return output;
  }
);
