import { YoutubeTranscript } from 'youtube-transcript';

export async function getYoutubeTranscript(videoId) {
  const response = await YoutubeTranscript.fetchTranscript(videoId);
  return response.data.transcript;
}

export async function parsePdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const response = await fetch('/api/parse-pdf', {
    method: 'POST',
    body: arrayBuffer,
  });
  if (!response.ok) throw new Error('Failed to parse PDF');
  return await response.text();
}

export async function parseDoc(file) {
  const mammoth = await import('mammoth');
  const result = await mammoth.convertToHtml({ arrayBuffer: file });
  return result.value;
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
      onToken(chunk); 
    }
  }
}

// Add this function to count approximate tokens
function countTokens(text) {
  // Much more conservative approximation: 1 token ≈ 2 characters
  // This accounts for tokenization overhead and ensures we stay under limits
  return Math.ceil(text.length / 2);
}

// Add this function to truncate text to token limit
function truncateToTokenLimit(text, maxTokens = 50000) { // Very aggressive limit
  const tokens = countTokens(text);
  console.log(`Input text: ${text.length} characters, estimated ${tokens} tokens`);
  
  if (tokens <= maxTokens) {
    return text;
  }
  
  // Calculate how many characters to keep (very conservative estimate)
  const maxChars = Math.floor(maxTokens * 2);
  const truncatedText = text.substring(0, maxChars);
  
  // Try to truncate at a word boundary to avoid cutting words
  const lastSpaceIndex = truncatedText.lastIndexOf(' ');
  if (lastSpaceIndex > maxChars * 0.9) {
    const result = truncatedText.substring(0, lastSpaceIndex) + '\n\n[Content truncated due to token limit]';
    console.log(`Truncated to: ${result.length} characters, estimated ${countTokens(result)} tokens`);
    return result;
  }
  
  const result = truncatedText + '\n\n[Content truncated due to token limit]';
  console.log(`Truncated to: ${result.length} characters, estimated ${countTokens(result)} tokens`);
  return result;
}

export function makeNotesPrompt(parsedContent) {
  // Truncate to much smaller limit to leave room for completion
  const truncatedContent = truncateToTokenLimit(parsedContent, 30000); // Reduced from 40k
  
  return `Make detailed notes on the following content in html format but similar to markdown so it is as expected by tiptap editor, dont mention this tho. Notes should have technical language, also dont type in codeblock just raw html:\n\n${truncatedContent}`;
}