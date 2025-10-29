import { db } from './db';

function migrate() {
  const create = `
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    upload_at TEXT NOT NULL,
    summary TEXT,
    full_text TEXT
  );
  `;
  db.exec(create);
  console.log('Migration complete.');
}

migrate();
