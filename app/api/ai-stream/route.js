import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

export async function POST(req) {
  const { modelName, content, prompt } = await req.json();

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const finalPrompt = prompt || `Make detailed notes on the following content in markdown format:\n\n${content}`;

  // Get the textStream from streamText
  const { textStream } = await streamText({
    model: openrouter(modelName),
    prompt: finalPrompt,
  });

  // Return the textStream as a Response for streaming
  return new Response(textStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}