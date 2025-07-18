// src/ai/flows/checklist-generation.ts
'use server';

/**
 * @fileOverview Generates a checklist from a PDF document using GenAI.
 *
 * - generateChecklist - A function that handles the checklist generation process.
 * - GenerateChecklistInput - The input type for the generateChecklist function.
 * - GenerateChecklistOutput - The return type for the generateChecklist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChecklistInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateChecklistInput = z.infer<typeof GenerateChecklistInputSchema>;

const GenerateChecklistOutputSchema = z.object({
  checklist: z.array(z.string()).describe('A checklist generated from the PDF document.'),
});
export type GenerateChecklistOutput = z.infer<typeof GenerateChecklistOutputSchema>;

export async function generateChecklist(input: GenerateChecklistInput): Promise<GenerateChecklistOutput> {
  return generateChecklistFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChecklistPrompt',
  input: {schema: GenerateChecklistInputSchema},
  output: {schema: GenerateChecklistOutputSchema},
  prompt: `Sie sind Experte für Dokumentenanalyse und Checklistenerstellung.

  Sie analysieren das bereitgestellte PDF-Dokument und erstellen eine Checkliste mit Punkten, die überprüft werden müssen.
  Die Checklistenpunkte sollten klar, prägnant und umsetzbar sein. Die Ausgabe muss auf Deutsch sein.

  PDF Document: {{media url=pdfDataUri}}
  \nGenerate checklist in German:`,
});

const generateChecklistFlow = ai.defineFlow(
  {
    name: 'generateChecklistFlow',
    inputSchema: GenerateChecklistInputSchema,
    outputSchema: GenerateChecklistOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
