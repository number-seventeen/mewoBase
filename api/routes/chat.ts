import express from 'express';
import db from '../db/index.js';
import ollama from 'ollama';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import chardet from 'chardet';
import iconv from 'iconv-lite';
import { exec } from 'child_process';
import util from 'util';
import crypto from 'crypto';

const execPromise = util.promisify(exec);

const router = express.Router();
const uploadDir = path.join(process.cwd(), 'uploads', 'temp');

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

// Helper to compute cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

router.post('/', upload.array('files'), async (req, res) => {
  try {
    const { knowledgeBaseId, message, model, conversationId } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!message && (!files || files.length === 0)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let tempTextContext = '';
    const images: Uint8Array[] = [];

    // Process temporary uploaded files
    if (files && files.length > 0) {
      for (const file of files) {
        let originalName = file.originalname;
        try {
          originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        } catch (e) {}

        const fileType = path.extname(originalName).toLowerCase();
        
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(fileType)) {
          const buffer = fs.readFileSync(file.path);
          images.push(new Uint8Array(buffer));
        } else {
          try {
            if (fileType === '.pdf') {
              const dataBuffer = fs.readFileSync(file.path);
              const data = await pdfParse(dataBuffer);
              tempTextContext += `\n\n--- Content from ${originalName} ---\n${data.text}`;
            } else if (fileType === '.docx') {
              const result = await mammoth.extractRawText({ path: file.path });
              tempTextContext += `\n\n--- Content from ${originalName} ---\n${result.value}`;
            } else if (fileType === '.txt' || fileType === '.md') {
              const buffer = fs.readFileSync(file.path);
              let encoding = chardet.detect(buffer);
              if (!encoding || encoding === 'ISO-8859-1') encoding = 'utf-8';
              const text = iconv.decode(buffer, encoding);
              
              tempTextContext += `\n\n--- Content from ${originalName} ---\n${text}`;
            }
          } catch (e) {
            console.error(`Failed to parse file ${file.originalname}`, e);
          }
        }
        // Clean up temp file
        try { fs.unlinkSync(file.path); } catch (e) {}
      }
    }

    // 1. Get embedding for the user message
    let queryEmbedding: number[] = [];
    if (message && knowledgeBaseId) {
      try {
        const embedResponse = await ollama.embeddings({
          model: 'qwen2.5:latest',
          prompt: message,
        });
        queryEmbedding = embedResponse.embedding;
      } catch (e: any) {
        console.error('Failed to get query embedding', e);
        if (e.message?.includes('not found') || e.message?.includes('pull')) {
          return res.status(400).json({ error: 'Embedding model qwen2.5:latest not found. Please install it first.' });
        }
      }
    }

    let relevantContext = tempTextContext;

    // 2. Search for relevant context if we have query embedding AND a knowledgeBaseId
    if (knowledgeBaseId && queryEmbedding.length > 0) {
      // Fetch all chunks for this knowledge base
      const chunks = db.prepare(`
        SELECT dc.content, dc.embedding 
        FROM document_chunks dc
        JOIN documents d ON dc.document_id = d.id
        WHERE d.knowledge_base_id = ? AND dc.embedding IS NOT NULL
      `).all(knowledgeBaseId) as { content: string, embedding: string }[];

      // Compute similarity
      const scoredChunks = chunks.map(chunk => {
        const chunkEmbedding = JSON.parse(chunk.embedding);
        const score = cosineSimilarity(queryEmbedding, chunkEmbedding);
        return { content: chunk.content, score };
      });

      // Sort and take top 3
      scoredChunks.sort((a, b) => b.score - a.score);
      const topChunks = scoredChunks.slice(0, 3);
      if (topChunks.length > 0) {
        relevantContext += '\n\n--- Context from Knowledge Base ---\n' + topChunks.map(c => c.content).join('\n\n');
      }
    }

    // 3. Collect images from knowledge base documents
    try {
      if (knowledgeBaseId) {
        const imageDocs = db.prepare(`
          SELECT file_path 
          FROM documents 
          WHERE knowledge_base_id = ? AND file_type IN ('.jpg', '.jpeg', '.png', '.webp')
        `).all(knowledgeBaseId) as { file_path: string }[];
        
        for (const doc of imageDocs) {
          if (fs.existsSync(doc.file_path)) {
            const buffer = fs.readFileSync(doc.file_path);
            images.push(new Uint8Array(buffer));
          }
        }
      }
    } catch (e) {
      console.error('Failed to process images', e);
    }

    // 4. Construct prompt
    const systemPrompt = relevantContext ? `You are a helpful AI assistant. Use the following context to answer the user's question. If you don't know the answer based on the context, just say so.

Context:
${relevantContext}
` : `You are a helpful AI assistant.`;

    // Determine the model. If there are images, we might need a vision model.
    const targetModel = model || 'qwen2.5:latest';

    // 5. Define Tools for Agentic Capabilities
    const tools = [
      {
        type: 'function',
        function: {
          name: 'run_shell_command',
          description: 'Run a shell command on the local macOS machine. Use this to execute automated scripts, check system status, install dependencies, or perform terminal tasks.',
          parameters: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: 'The shell command to execute',
              },
            },
            required: ['command'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_current_time',
          description: 'Get the current system time and date.',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      }
    ];

    // 6. Manage Conversation History
    let currentSessionId = conversationId;
    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID();
      const title = message ? message.substring(0, 30) + '...' : 'New Magic Session';
      
      try {
        db.prepare('INSERT INTO chat_sessions (id, knowledge_base_id, title) VALUES (?, ?, ?)').run(
          currentSessionId,
          knowledgeBaseId && knowledgeBaseId !== 'none' ? knowledgeBaseId : null,
          title
        );
      } catch (e: any) {
        // If the table still has NOT NULL or FOREIGN KEY constraint from before, fallback to null logic or just disable the constraint locally
        if (e.message && (e.message.includes('NOT NULL constraint failed') || e.message.includes('FOREIGN KEY constraint failed'))) {
          try {
            // It's safer to just insert without knowledge_base_id if the foreign key is strict but the KB doesn't exist anymore
            db.prepare('INSERT INTO chat_sessions (id, title) VALUES (?, ?)').run(
              currentSessionId,
              title
            );
          } catch (innerE: any) {
            if (innerE.message && innerE.message.includes('NOT NULL constraint failed')) {
               // The database literally won't let us insert without a knowledge_base_id because of the old schema
               // We will fake a 'default' knowledge base just to satisfy the constraint
               try {
                 db.prepare('INSERT OR IGNORE INTO knowledge_bases (id, name, description) VALUES (?, ?, ?)').run(
                   'default-kb', 'Default Knowledge Base', 'System generated to satisfy schema constraints'
                 );
                 db.prepare('INSERT INTO chat_sessions (id, knowledge_base_id, title) VALUES (?, ?, ?)').run(
                   currentSessionId,
                   'default-kb',
                   title
                 );
               } catch (finalE) {
                 console.error('Completely failed to bypass SQLite constraints:', finalE);
                 throw finalE;
               }
            } else {
              throw innerE;
            }
          }
        } else {
          throw e;
        }
      }
    } else {
      db.prepare('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(currentSessionId);
    }

    // Save user message to DB
    const userMsgId = crypto.randomUUID();
    const base64Images = images.map(img => Buffer.from(img).toString('base64'));
    db.prepare('INSERT INTO chat_messages (id, session_id, role, content, images) VALUES (?, ?, ?, ?, ?)').run(
      userMsgId,
      currentSessionId,
      'user',
      message || 'Attached files/images',
      base64Images.length > 0 ? JSON.stringify(base64Images) : null
    );

    // Fetch previous history for context
    const historyStmt = db.prepare('SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC');
    const historyRows = historyStmt.all(currentSessionId);

    const userMessage: any = { role: 'user', content: message || 'Please analyze these files/images.' };
    if (base64Images.length > 0) {
      userMessage.images = base64Images;
    }

    let messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Rebuild history for Ollama (excluding the very last user message we just inserted, as we add it manually with images)
    for (let i = 0; i < historyRows.length - 1; i++) {
      const row: any = historyRows[i];
      if (row.role === 'user' || row.role === 'assistant') {
        messages.push({ role: row.role, content: row.content });
      }
    }
    messages.push(userMessage);

    let response = await ollama.chat({
      model: targetModel,
      messages: messages,
      tools: tools,
      stream: false
    });

    const executedTools = [];

    // Loop to handle tool calls
    while (response.message.tool_calls && response.message.tool_calls.length > 0) {
      messages.push(response.message);

      for (const tool of response.message.tool_calls) {
        const functionName = tool.function.name;
        const args = tool.function.arguments;
        let toolResult = "";

        executedTools.push({ name: functionName, args });
        console.log(`Executing tool: ${functionName} with args:`, args);

        if (functionName === 'run_shell_command') {
          try {
            const { stdout, stderr } = await execPromise(args.command as string);
            toolResult = stdout || stderr || "Command executed successfully with no output.";
          } catch (err: any) {
            toolResult = `Error executing command: ${err.message}`;
          }
        } else if (functionName === 'get_current_time') {
          toolResult = new Date().toLocaleString();
        } else {
          toolResult = `Unknown tool: ${functionName}`;
        }

        messages.push({
          role: 'tool',
          content: toolResult,
          name: functionName
        });
      }

      // Ask model again with the tool results
      response = await ollama.chat({
        model: targetModel,
        messages: messages,
        tools: tools,
        stream: false
      });
    }

    // Save assistant message to DB
    const assistantMsgId = crypto.randomUUID();
    db.prepare('INSERT INTO chat_messages (id, session_id, role, content, tools_used) VALUES (?, ?, ?, ?, ?)').run(
      assistantMsgId,
      currentSessionId,
      'assistant',
      response.message.content || '',
      executedTools.length > 0 ? JSON.stringify(executedTools) : null
    );

    res.json({
      response: response.message.content,
      conversationId: currentSessionId,
      context: relevantContext ? [relevantContext] : [],
      tokenUsage: response.eval_count || 0,
      toolsUsed: executedTools
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat' });
  }
});

export default router;
