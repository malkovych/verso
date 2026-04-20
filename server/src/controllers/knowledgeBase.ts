import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import * as kb from '../services/knowledgeBase.js';

export async function list(req: AuthRequest, res: Response) {
  try {
    const docs = await kb.getDocuments(req.user!.id);
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'title and content are required' });
      return;
    }
    const doc = await kb.addDocument(req.user!.id, title, content);
    res.status(201).json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await kb.deleteDocument(req.user!.id, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const { title, content } = req.body;
    const doc = await kb.updateDocument(req.user!.id, req.params.id, title, content);
    res.json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
