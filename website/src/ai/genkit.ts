import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { config } from 'dotenv';
import { resolve } from 'path';

// Manually load environment variables from src/.env
config({ path: resolve(process.cwd(), 'src/.env') });

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
