import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const OPENAI_KEY = process.env.OPENAI_API_KEY;

let openaiClient: OpenAIApi | null = null;
if (OPENAI_KEY) {
  const config = new Configuration({ apiKey: OPENAI_KEY });
  openaiClient = new OpenAIApi(config);
}

// Very simple extractive fallback summarizer: take the first N sentences up to approx token limit
function fallbackSummarize(text: string, maxChars = 2000): string {
  if (!text || text.length === 0) return '';
  // split into sentences (naive)
  const sentences = text.match(/[^\.\!\?]+[\.\!\?]+/g) || [text];
  let out = '';
  for (const s of sentences) {
    if ((out + s).length > maxChars) break;
    out += s.trim() + ' ';
  }
  out = out.trim();
  // If too short, return the first 500 chars
  if (out.length < 50) return text.slice(0, Math.min(text.length, 500)) + (text.length > 500 ? '...' : '');
  return out;
}

export async function summarizeText(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return '';

  // If OpenAI client is available, send request
  if (openaiClient) {
    try {
      // If text is very long, limit to a chunk to avoid huge tokens. For simplicity, trim to first 20000 chars.
      const chunk = text.length > 20000 ? text.slice(0, 20000) + "\n\n[TRUNCATED]" : text;

      const prompt = `Summarize the following document into a concise summary (~3-6 short paragraphs) highlighting key points, findings, or topics:\n\n${chunk}`;

      const resp = await openaiClient.createCompletion({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 800,
        temperature: 0.2,
      });

      const summary = resp.data.choices?.[0]?.text?.trim();
      if (summary) return summary;
    } catch (err) {
      console.warn('OpenAI summarization failed, falling back to internal summarizer:', err);
      // fallthrough to fallback summarizer
    }
  }

  // fallback
  return fallbackSummarize(text, 2000);
}
