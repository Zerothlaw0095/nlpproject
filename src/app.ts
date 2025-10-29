import express from 'express';
import cors from 'cors';
import documentsRouter from './routes/documents';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Static access to uploaded files (careful in production)
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

app.use('/api/documents', documentsRouter);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'nlpproject backend' });
});

export default app;
