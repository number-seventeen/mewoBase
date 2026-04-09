import express from 'express';
import db from '../db/index.js';
import crypto from 'crypto';

const router = express.Router();

// Get all knowledge bases
router.get('/', (req, res) => {
  try {
    const bases = db.prepare('SELECT * FROM knowledge_bases ORDER BY created_at DESC').all();
    
    // Add document count
    const result = bases.map((base: any) => {
      const docCount = db.prepare('SELECT count(*) as count FROM documents WHERE knowledge_base_id = ?').get(base.id) as { count: number };
      return {
        ...base,
        documentCount: docCount.count
      };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch knowledge bases' });
  }
});

// Create a new knowledge base
router.post('/', (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const id = crypto.randomUUID();
    const stmt = db.prepare('INSERT INTO knowledge_bases (id, name, description) VALUES (?, ?, ?)');
    stmt.run(id, name, description || '');
    
    res.status(201).json({ id, name, description });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create knowledge base' });
  }
});

// Delete a knowledge base
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM knowledge_bases WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete knowledge base' });
  }
});

export default router;
