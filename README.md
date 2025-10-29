# NLPProject Backend

This backend accepts PDF uploads, extracts the text, summarizes the document (via OpenAI if configured, or using a fallback), stores the PDF file on disk and metadata in a small SQLite database, and provides endpoints to list and fetch documents and summaries.

Features:
- Upload PDF files (POST /api/documents)
- Extract text (pdf-parse)
- Summarize via OpenAI API (if OPENAI_API_KEY is set) or fallback extractive summary
- Store PDF in `uploads/` and metadata in `data/db.sqlite`
- Endpoints to list documents, get details, download file, and get summary

Requirements
- Node 18+ recommended
- (Optional) OpenAI API key for better summaries

Quick start
1. Copy files into your repository.
2. Install dependencies:
   npm install

3. Create a `.env` file from `.env.example` and set:
   - PORT (optional)
   - OPENAI_API_KEY (optional)

4. Run DB migration to create the table:
   npm run migrate

5. Start the development server:
   npm run dev

API Endpoints
- POST /api/documents
  - Form field: `file` (multipart/form-data)
  - Returns: saved document metadata (id, originalName, uploadAt, summary, ...)

- GET /api/documents
  - Returns list of documents

- GET /api/documents/:id
  - Returns document metadata

- GET /api/documents/:id/download
  - Downloads the PDF file

- GET /api/documents/:id/summary
  - Returns only the summary for the document

Notes & Next steps
- For production, add authentication, HTTPS, and cloud storage (S3) for uploaded PDFs.
- Use a job queue (e.g., Bull, RabbitMQ) to perform extraction + summarization asynchronously for large files.
- Break large documents into chunks, summarize each, then combine summaries to avoid token limits.
