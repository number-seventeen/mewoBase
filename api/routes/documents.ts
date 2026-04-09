import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import db from '../db/index.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import ollama from 'ollama';
import chardet from 'chardet';
import iconv from 'iconv-lite';

const router = express.Router();
const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Helper to chunk text
function chunkText(text: string, chunkSize = 1000): string[] {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { knowledgeBaseId } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!knowledgeBaseId) {
      return res.status(400).json({ error: 'Knowledge base ID is required' });
    }

    const id = crypto.randomUUID();
    const filePath = file.path;
    
    // Fix multer encoding issue for originalname
    let originalName = file.originalname;
    try {
      originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch (e) {
      console.error('Filename decoding error', e);
    }
    
    const fileType = path.extname(originalName).toLowerCase();
    
    // Parse file
    let text = '';
    if (fileType === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (fileType === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (fileType === '.txt' || fileType === '.md') {
      const buffer = fs.readFileSync(filePath);
      let encoding = chardet.detect(buffer);
      // fallback to utf8 if detection fails or returns ISO-8859-1 (often wrong for Chinese texts)
      if (!encoding || encoding === 'ISO-8859-1') {
        encoding = 'utf-8';
      }
      text = iconv.decode(buffer, encoding);
    } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(fileType)) {
      // For images, we just save the document record. No text to chunk or embed.
      const stmt = db.prepare('INSERT INTO documents (id, knowledge_base_id, filename, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run(id, knowledgeBaseId, originalName, filePath, fileType, file.size);
      return res.json({ success: true, documentId: id });
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Save document
    const stmt = db.prepare('INSERT INTO documents (id, knowledge_base_id, filename, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, knowledgeBaseId, originalName, filePath, fileType, file.size);

    // Chunk and embed
    const chunks = chunkText(text);
    const chunkStmt = db.prepare('INSERT INTO document_chunks (id, document_id, content, chunk_index, embedding) VALUES (?, ?, ?, ?, ?)');
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const response = await ollama.embeddings({
          model: 'qwen2.5:latest', // Use installed model instead of nomic-embed-text
          prompt: chunk,
        });
        chunkStmt.run(crypto.randomUUID(), id, chunk, i, JSON.stringify(response.embedding));
      } catch (e) {
        console.error('Embedding failed, saving without embedding', e);
        chunkStmt.run(crypto.randomUUID(), id, chunk, i, null);
      }
    }

    res.json({ success: true, documentId: id });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

router.get('/:knowledgeBaseId', (req, res) => {
  try {
    const { knowledgeBaseId } = req.params;
    const docs = db.prepare('SELECT id, filename, file_type, file_size, uploaded_at FROM documents WHERE knowledge_base_id = ? ORDER BY uploaded_at DESC').all(knowledgeBaseId);
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM documents WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

router.get('/preview/:id', (req, res) => {
  try {
    const { id } = req.params;
    const doc = db.prepare('SELECT file_path, file_type, filename FROM documents WHERE id = ?').get(id) as { file_path: string, file_type: string, filename: string };
    
    if (doc && fs.existsSync(doc.file_path)) {
      let contentType = 'text/plain';
      if (doc.file_type === '.pdf') contentType = 'application/pdf';
      else if (['.jpg', '.jpeg'].includes(doc.file_type)) contentType = 'image/jpeg';
      else if (doc.file_type === '.png') contentType = 'image/png';
      else if (doc.file_type === '.webp') contentType = 'image/webp';
      else if (doc.file_type === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.filename)}"`);
      fs.createReadStream(doc.file_path).pipe(res);
    } else {
      res.status(404).send('Document not found');
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to preview document' });
  }
});

export default router;
