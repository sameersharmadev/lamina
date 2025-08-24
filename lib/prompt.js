import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';

export async function getYoutubeTranscript(videoId) {
  const response = await YoutubeTranscript.fetchTranscript(videoId);
  return response.data.transcript;
}

export async function parsePdf(file) {
  const pdfjsLib = await import('pdfjs-dist/build/pdf');
  const pdf = await pdfjsLib.getDocument({ data: file }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ');
  }
  return text;
}

export async function parseDoc(file) {
  const mammoth = await import('mammoth');
  const result = await mammoth.convertToHtml({ arrayBuffer: file });
  return result.value;
}

export async function fetchWebpageText(url) {
  const response = await axios.get(url);
  return response.data;
}

export function getLongText(text) {
  return text;
}

export async function streamAiResponse(parsedContent, modelName, prompt, onToken) {
  const response = await fetch('/api/ai-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelName, content: parsedContent, prompt })
  });

  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      const chunk = decoder.decode(value);
      onToken(chunk); // Call onToken for each chunk
    }
  }
}

export function makeNotesPrompt(parsedContent) {
  return `Make detailed notes on the following content in markdown format and also line breaks such that it works with the tiptap editor:\n\n${parsedContent}`;
}