import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: ChatMessage;
  funnelStage?: string;
}

export const chatApi = {
  sendMessage: (messages: ChatMessage[], knowledgeBaseId?: string) =>
    api.post<ChatResponse>('/chat/message', { messages, knowledgeBaseId }),

  getHistory: (conversationId: string) =>
    api.get<ChatMessage[]>(`/chat/history/${conversationId}`),

  getConversations: () =>
    api.get<Array<{ id: string; title: string; createdAt: string; funnelStage: string }>>('/chat/conversations'),
};

export const knowledgeBaseApi = {
  getDocuments: () =>
    api.get<Array<{ id: string; title: string; content: string; createdAt: string }>>('/knowledge-base'),

  addDocument: (title: string, content: string) =>
    api.post('/knowledge-base', { title, content }),

  deleteDocument: (id: string) =>
    api.delete(`/knowledge-base/${id}`),

  updateDocument: (id: string, title: string, content: string) =>
    api.put(`/knowledge-base/${id}`, { title, content }),
};

export const integrationsApi = {
  getStatus: () =>
    api.get<Record<string, { connected: boolean; lastSync?: string }>>('/integrations/status'),

  connectGoogle: () =>
    api.get<{ authUrl: string }>('/integrations/google/auth'),

  disconnectGoogle: () =>
    api.post('/integrations/google/disconnect'),

  connectTrello: () =>
    api.get<{ authUrl: string }>('/integrations/trello/auth'),

  disconnectTrello: () =>
    api.post('/integrations/trello/disconnect'),

  connectHubstaff: (appToken: string) =>
    api.post('/integrations/hubstaff/connect', { appToken }),

  disconnectHubstaff: () =>
    api.post('/integrations/hubstaff/disconnect'),
};

export const dashboardApi = {
  getStats: () =>
    api.get<{
      totalConversations: number;
      activeLeads: number;
      conversionRate: number;
      revenue: number;
    }>('/dashboard/stats'),

  getFunnelData: () =>
    api.get<Array<{ stage: string; count: number }>>('/dashboard/funnel'),
};

export const subscriptionsApi = {
  checkout: (tier: string, billing: 'monthly' | 'yearly' = 'monthly') =>
    api.post<{ url: string }>('/subscriptions/checkout', { tier, billing }),

  portal: () =>
    api.post<{ url: string }>('/subscriptions/portal'),

  current: () =>
    api.get<{ tier: string; status: string; current_period_end?: string }>('/subscriptions/current'),
};

export default api;
