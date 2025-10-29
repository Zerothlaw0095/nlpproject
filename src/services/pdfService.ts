import fs from 'fs';
import pdf from 'pdf-parse';

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const result = await pdf(dataBuffer);
  // result.text is the extracted text
  // Trim and return
  return (result.text || '').trim();
}
