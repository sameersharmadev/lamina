# Lamina

Lamina — an AI-powered note-taking app that reads PDFs, webpages, YouTube transcripts, and documents, generates structured notes, and streams them into a WYSIWYG Markdown editor.

## Highlights / Features

- Live AI streaming into the editor (ChatGPT-like typing)
  - Backend streaming: [app/api/ai-stream/route.js](app/api/ai-stream/route.js)
  - Frontend streaming handler: [`streamAiResponse`](lib/prompt.js) ([lib/prompt.js](lib/prompt.js))
- Parse sources:
  - PDF parsing endpoint: [app/api/parse-pdf/route.js](app/api/parse-pdf/route.js)
  - YouTube transcript: [`getYoutubeTranscript`](lib/prompt.js) ([lib/prompt.js](lib/prompt.js))
  - DOC/DOCX parsing: [`parseDoc`](lib/prompt.js) ([lib/prompt.js](lib/prompt.js))
  - Webpage fetch: [`fetchWebpageText`](lib/prompt.js) ([lib/prompt.js](lib/prompt.js))
- Editor:
  - Tiptap-based WYSIWYG Markdown editor with live rendering while AI types: [components/MarkdownEditor.jsx](components/MarkdownEditor.jsx)
- Token safety:
  - Token counting and truncation to fit model context (`countTokens` / `truncateToTokenLimit` in [lib/prompt.js](lib/prompt.js))
- Supabase integration for file storage/auto-save (client created in components using env vars)

## Quick start (dev)

1. Install
```bash
npm install
```

2. Environment (.env.local)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- OPENROUTER_API_KEY

3. Run dev server
```bash
npm run dev
```

## How to generate notes (high level)

1. Provide or upload source in the editor UI (PDF, YouTube, DOC, webpage, or paste long text). The UI calls:
   - [`parsePdf`](lib/prompt.js) -> POST /api/parse-pdf ([app/api/parse-pdf/route.js](app/api/parse-pdf/route.js))
   - or [`getYoutubeTranscript`](lib/prompt.js)
2. The frontend builds a prompt using [`makeNotesPrompt`](lib/prompt.js) and calls [`streamAiResponse`](lib/prompt.js).
3. The streaming endpoint [app/api/ai-stream/route.js](app/api/ai-stream/route.js) forwards the prompt to the model and returns a stream.
4. The editor appends each chunk as it arrives and renders Markdown live using `marked(...)` (see [components/MarkdownEditor.jsx](components/MarkdownEditor.jsx)).

Key symbols:
- [`makeNotesPrompt`](lib/prompt.js) — builds/truncates input to token limits
- [`streamAiResponse`](lib/prompt.js) — reads server stream and calls token callback
- [`app/api/ai-stream/route.js`](app/api/ai-stream/route.js) — server-side streaming implementation

## Token limits and truncation

- Token counting helpers live in [lib/prompt.js](lib/prompt.js): [`countTokens`](lib/prompt.js) and [`truncateToTokenLimit`](lib/prompt.js).
- Default behavior: content is truncated to stay under the model context (configured in `makeNotesPrompt`).
- Adjust `maxTokens`/truncate limits in:
  - [`app/api/ai-stream/route.js`](app/api/ai-stream/route.js) (completion `maxTokens`)
  - [`lib/prompt.js`](lib/prompt.js) (input truncation)

## Troubleshooting

- If PDF parsing fails:
  - Confirm frontend sends a real `File` (ArrayBuffer) to [app/api/parse-pdf/route.js](app/api/parse-pdf/route.js).
  - Add logs in [app/api/parse-pdf/route.js](app/api/parse-pdf/route.js):
    - `console.log('Buffer size:', buffer.length)` and `console.log(buffer.slice(0, 10))` — PDF should start with `%PDF`
- If streaming is blank:
  - Verify server logs in [app/api/ai-stream/route.js](app/api/ai-stream/route.js) show the received prompt.
  - Check frontend logs in token handler in [`streamAiResponse`](lib/prompt.js) for received chunks.
- If you see `[object Promise]` in editor:
  - Make sure you update editor inside the token callback and do not set content to the return value of an async streaming function.

## Files to inspect

- Frontend streaming and prompt utilities: [lib/prompt.js](lib/prompt.js)
- Editor: [components/MarkdownEditor.jsx](components/MarkdownEditor.jsx)
- AI streaming API: [app/api/ai-stream/route.js](app/api/ai-stream/route.js)
- PDF parsing API: [app/api/parse-pdf/route.js](app/api/parse-pdf/route.js)
- Globals & editor styles: [app/globals.css](app/globals.css)

## Advanced

- To change model or token behavior, edit:
  - Model selection in frontend calls to [`streamAiResponse`](lib/prompt.js)
  - Completion token limit in [app/api/ai-stream/route.js](app/api/ai-stream/route.js)
  - Input truncation in [`truncateToTokenLimit`](lib/prompt.js)
- For better Markdown streaming rendering, ensure the editor parses incremental Markdown (current setup uses `marked` in the token callback inside [components/MarkdownEditor.jsx](components/MarkdownEditor.jsx)).

## Contributing

- Keep UI logic in `components/`.
- Keep AI/prompt logic in `lib/prompt.js`.
- Keep API routes in `app/api/`.

---

If you want, I can:
- generate a smaller README variant,
- add CI / testing steps,
- or open a PR-