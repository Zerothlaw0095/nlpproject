import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { extractTextFromPDF } from '../services/pdfService';
import { summarizeText } from '../services/summarizer';
import { db } from '../db/db';

// POST /api/documents
export async function uploadDocument(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded (field name must be "file")' });

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const uploadAt = new Date().toISOString();

    // extract text
    const extractedText = await extractTextFromPDF(filePath);

    // Summarize (will use OpenAI if configured, otherwise fallback)
    const summary = await summarizeText(extractedText);

    // Save metadata to DB
    const stmt = db.prepare(`INSERT INTO documents (original_name, storage_path, upload_at, summary, full_text) VALUES (?, ?, ?, ?, ?)`);
    const info = stmt.run(originalName, filePath, uploadAt, summary, extractedText);

    const doc = {
      id: Number(info.lastInsertRowid),
      originalName,
      storagePath: filePath,
      uploadAt,
      summary
    };

    return res.status(201).json({ document: doc });
  } catch (err: any) {
    console.error('uploadDocument error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}

export function listDocuments(_req: Request, res: Response) {
  const rows = db.prepare('SELECT id, original_name as originalName, storage_path as storagePath, upload_at as uploadAt, summary FROM documents ORDER BY id DESC').all();
  res.json({ documents: rows });
}

export function getDocument(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  const row = db.prepare('SELECT id, original_name as originalName, storage_path as storagePath, upload_at as uploadAt, summary, full_text as fullText FROM documents WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json({ document: row });
}

export function downloadDocument(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  const row = db.prepare('SELECT storage_path as storagePath, original_name as originalName FROM documents WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'not found' });

  const filePath = row.storagePath;
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'file missing on disk' });

  res.download(filePath, row.originalName);
}

export function getSummary(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  const row = db.prepare('SELECT summary FROM documents WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json({ summary: row.summary });
}
