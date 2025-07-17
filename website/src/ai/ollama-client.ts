import { Ollama } from 'ollama';

export const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434',
});

export async function callModel(prompt: string): Promise<string> {
  try {
    const response = await ollama.chat({
      model: 'gemma3:4b',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: false,
    });

    return response.message.content;
  } catch (error) {
    console.error('Error calling Ollama model:', error);
    
    if (error instanceof Error) {
      throw new Error(`Failed to call Ollama model: ${error.message}`);
    }

    throw new Error(`Failed to call Ollama model: ${String(error)}`);
  }
}
