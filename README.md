# Lamina — Feature Overview

Lamina is an AI-powered note-taking app focused on fast capture, structured notes, and a fluid writing experience. Below are the product-grade features and where they live in the codebase.

## Core Features

- Live AI streaming
  - Frontend stream reader: [`streamAiResponse`](lib/prompt.js) ([lib/prompt.js](lib/prompt.js))
  - Backend streaming endpoint: [app/api/ai-stream/route.js](app/api/ai-stream/route.js) (`streamText` integration)
  - Typing UX: incremental chunks are rendered to the editor as they arrive.

- Multi-source parsing (convert sources to text before summarizing)
  - PDF parsing: [`parsePdf`](lib/prompt.js) → [app/api/parse-pdf/route.js](app/api/parse-pdf/route.js)
  - YouTube transcripts: [`getYoutubeTranscript`](lib/prompt.js) ([lib/prompt.js](lib/prompt.js))
  - DOC/DOCX parsing: [`parseDoc`](lib/prompt.js) ([lib/prompt.js](lib/prompt.js))
  - Webpage extraction: [`fetchWebpageText`](lib/prompt.js) ([lib/prompt.js](lib/prompt.js))
  - Paste/long text: [`getLongText`](lib/prompt.js) ([lib/prompt.js](lib/prompt.js))

- Rich WYSIWYG Markdown editor
  - Editor component: [components/MarkdownEditor.jsx](components/MarkdownEditor.jsx)
  - Live-rendering: streamed AI output is processed via `marked` and injected so markdown formatting appears as the AI types.
  - Tiptap extensions included (lists, links, images, highlights, tasks).

- Productivity UX
  - Tabbed editor system: [components/TabSystem.jsx](components/TabSystem.jsx)
  - Sidebar file explorer with folders and breadcrumbs: [components/Sidebar.jsx](components/Sidebar.jsx)
  - Auto-save and Supabase sync (client created in components using env vars)

## Developer Features

- Clear separation:
  - Prompt and streaming logic centralized in [lib/prompt.js](lib/prompt.js) (`makeNotesPrompt`, `streamAiResponse`).
  - API routes in [app/api](app/api).
  - Editor UI in [components/MarkdownEditor.jsx](components/MarkdownEditor.jsx).

- Streaming-first design:
  - Backend returns a streaming response to the client so the frontend can render tokens in real time.
  - The editor receives tokens via [`streamAiResponse`](lib/prompt.js) and appends them using Tiptap commands.

- Safe defaults and debugging:
  - Token truncation to prevent model context errors.
  - Console logging hooks in API routes (add logs in [app/api/parse-pdf/route.js](app/api/parse-pdf/route.js) and [app/api/ai-stream/route.js](app/api/ai-stream/route.js) while debugging).

## Quick Start (dev)

1. Install:
```bash
npm install
```

2. Add environment variables in `.env.local`:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- OPENROUTER_API_KEY

3. Run:
```bash
npm run dev
```

## Recommended Flows

- Generate notes from a PDF:
  1. Upload via the custom dialog in [components/MarkdownEditor.jsx](components/MarkdownEditor.jsx).
  2. Frontend calls [`parsePdf`](lib/prompt.js) → POST `/api/parse-pdf` ([app/api/parse-pdf/route.js](app/api/parse-pdf/route.js)).
  3. Build prompt via [`makeNotesPrompt`](lib/prompt.js) and call [`streamAiResponse`](lib/prompt.js).
  4. AI streams notes into the editor live.

- Convert a webpage or YouTube transcript:
  - Use [`fetchWebpageText`](lib/prompt.js) or [`getYoutubeTranscript`](lib/prompt.js), then stream notes as above.


## Where to look in the code

- Prompt & streaming: [lib/prompt.js](lib/prompt.js) — see [`makeNotesPrompt`](lib/prompt.js) and [`streamAiResponse`](lib/prompt.js).
- Editor: [components/MarkdownEditor.jsx](components/MarkdownEditor.jsx).
- Streaming API: [app/api/ai-stream/route.js](app/api/ai-stream/route.js).
- PDF parser: [app/api/parse-pdf/route.js](app/api/parse-pdf/route.js).
- Tabs and layout: [components/TabSystem.jsx](components/TabSystem.jsx) and [app/Application.jsx](app/Application.jsx).

---