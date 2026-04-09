import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Define db path in user data folder or current dir
const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Initialize database tables
const initDb = () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS knowledge_bases (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      knowledge_base_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS document_chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      content TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      embedding TEXT,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      knowledge_base_id TEXT,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
      content TEXT NOT NULL,
      images TEXT,
      tools_used TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    );
  `;

  db.exec(schema);

  // Add columns if they don't exist
  try {
    db.exec(`ALTER TABLE chat_messages ADD COLUMN images TEXT;`);
  } catch (e) {
    // Column already exists
  }
  try {
    db.exec(`ALTER TABLE chat_messages ADD COLUMN tools_used TEXT;`);
  } catch (e) {
    // Column already exists
  }

  // SQLite doesn't support ALTER COLUMN to drop NOT NULL constraint easily.
  // Instead of dropping the table (which loses data), we'll catch the error in chat.ts and pass an empty string instead of null if it fails.
};

initDb();

export default db;
