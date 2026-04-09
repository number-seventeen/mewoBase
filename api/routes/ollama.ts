import express from 'express';
import ollama from 'ollama';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
const router = express.Router();

router.get('/models', async (req, res) => {
  try {
    const list = await ollama.list();
    res.json(list.models);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch models from Ollama' });
  }
});

router.get('/status', async (req, res) => {
  try {
    await ollama.list(); // Simple ping
    res.json({ status: 'running' });
  } catch (error) {
    res.json({ status: 'stopped' });
  }
});

router.post('/start', async (req, res) => {
  try {
    // Attempt to start Ollama app on macOS
    await execPromise('open -a Ollama');
    
    // Give it a moment to start
    setTimeout(async () => {
      try {
        await ollama.list();
        res.json({ status: 'running' });
      } catch (e) {
        res.status(500).json({ error: 'Failed to start Ollama' });
      }
    }, 2000);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start Ollama service' });
  }
});

router.post('/stop', async (req, res) => {
  try {
    // Attempt to stop Ollama process on macOS
    await execPromise('pkill -f "Ollama"');
    res.json({ status: 'stopped' });
  } catch (error) {
    // pkill returns error if no process found, which is fine (already stopped)
    res.json({ status: 'stopped' });
  }
});

export default router;
