'use server';

/**
 * @fileOverview A flow for generating event descriptions using AI.
 *
 * - generateEventDescription - A function that generates an event description based on input.
 * - GenerateEventDescriptionInput - The input type for the generateEventDescription function.
 * - GenerateEventDescriptionOutput - The return type for the generateEventDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEventDescriptionInputSchema = z.object({
  eventName: z.string().describe('The name of the event.'),
  eventCategory: z.string().describe('The category of the event (e.g., Music, Sports, Technology).'),
  eventDate: z.string().describe('The date of the event (e.g., 2024-03-15).'),
  eventTime: z.string().describe('The time of the event (e.g., 19:00).'),
  eventLocation: z.string().describe('The location of the event (e.g., Central Park, New York).'),
  eventDescription: z.string().describe('A brief description of the event.'),
  ticketPrice: z.number().describe('The price of a ticket to the event.'),
  eventCapacity: z.number().describe('The maximum capacity of the event.'),
});
export type GenerateEventDescriptionInput = z.infer<typeof GenerateEventDescriptionInputSchema>;

const GenerateEventDescriptionOutputSchema = z.object({
  generatedDescription: z.string().describe('The AI-generated event description.'),
});
export type GenerateEventDescriptionOutput = z.infer<typeof GenerateEventDescriptionOutputSchema>;

export async function generateEventDescription(input: GenerateEventDescriptionInput): Promise<GenerateEventDescriptionOutput> {
  return generateEventDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEventDescriptionPrompt',
  input: {schema: GenerateEventDescriptionInputSchema},
  output: {schema: GenerateEventDescriptionOutputSchema},
  prompt: `You are an AI assistant helping event organizers create engaging event descriptions.

  Based on the following details, generate an appealing and informative event description that will attract potential attendees. Use a tone that is enthusiastic and highlights the key aspects of the event.

  Event Name: {{{eventName}}}
  Category: {{{eventCategory}}}
  Date: {{{eventDate}}}
  Time: {{{eventTime}}}
  Location: {{{eventLocation}}}
  Brief Description: {{{eventDescription}}}
  Ticket Price: {{{ticketPrice}}}
  Capacity: {{{eventCapacity}}}

  Generated Description:`,
});

const generateEventDescriptionFlow = ai.defineFlow(
  {
    name: 'generateEventDescriptionFlow',
    inputSchema: GenerateEventDescriptionInputSchema,
    outputSchema: GenerateEventDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {generatedDescription: output!.generatedDescription!};
  }
);
