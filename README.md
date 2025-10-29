# PDF Summarizer (Minimal)

This is a minimal TypeScript + React scaffold for a PDF Summarizer web app.

Features
- Centered, minimal UI with a file upload (drag & drop or click)
- "Summarize" button that POSTs the uploaded PDF to `/api/summarize`
- Displays the returned summary text

How to run (Windows, cmd.exe)

1. Install dependencies:

```
npm install
```

2. Start dev server:

```
npm run dev
```

The app expects a backend endpoint at `/api/summarize` that accepts a multipart/form-data POST containing the file under the `file` field and returns either JSON `{ "summary": "..." }` or plain text.

Notes
- The UI is intentionally neutral and minimal to make backend integration straightforward.
- No animations or decorative icons are included.