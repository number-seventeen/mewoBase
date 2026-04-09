import express from 'express';
import db from '../db/index.js';

const router = express.Router();

// Get all chat sessions
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM chat_sessions ORDER BY updated_at DESC');
    const sessions = stmt.all();
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a specific session
router.get('/:id/messages', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC');
    const messages = stmt.all(req.params.id).map((msg: any) => ({
      ...msg,
      images: msg.images ? JSON.parse(msg.images) : undefined,
      toolsUsed: msg.tools_used ? JSON.parse(msg.tools_used) : undefined,
    }));
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a session
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM chat_sessions WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
