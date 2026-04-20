import { supabase } from '../config/supabase.js';

export interface KBDocument {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

export async function getDocuments(userId: string): Promise<KBDocument[]> {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addDocument(userId: string, title: string, content: string): Promise<KBDocument> {
  const { data, error } = await supabase
    .from('knowledge_base')
    .insert({ user_id: userId, title, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDocument(userId: string, docId: string): Promise<void> {
  const { error } = await supabase
    .from('knowledge_base')
    .delete()
    .eq('id', docId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function updateDocument(
  userId: string, docId: string, title: string, content: string
): Promise<KBDocument> {
  const { data, error } = await supabase
    .from('knowledge_base')
    .update({ title, content })
    .eq('id', docId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getKnowledgeContext(userId: string): Promise<string> {
  const docs = await getDocuments(userId);
  if (docs.length === 0) return '';
  return docs.map((d) => `## ${d.title}\n${d.content}`).join('\n\n');
}
