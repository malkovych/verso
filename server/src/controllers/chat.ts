import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { generateChatResponse } from '../services/llm.js';
import { getKnowledgeContext } from '../services/knowledgeBase.js';
import { supabase } from '../config/supabase.js';

export async function sendMessage(req: AuthRequest, res: Response) {
  try {
    const { messages, conversationId } = req.body;
    const userId = req.user!.id;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    const knowledgeContext = await getKnowledgeContext(userId);
    const result = await generateChatResponse(messages, knowledgeContext);

    if (conversationId) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: messages[messages.length - 1].content,
      });
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: result.message.content,
      });
      await supabase.from('conversations')
        .update({ funnel_stage: result.funnelStage, updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate response' });
  }
}

export async function getConversations(req: AuthRequest, res: Response) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, funnel_stage, created_at, updated_at')
      .eq('user_id', req.user!.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getHistory(req: AuthRequest, res: Response) {
  try {
    const { conversationId } = req.params;

    const { data, error } = await supabase
      .from('messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
