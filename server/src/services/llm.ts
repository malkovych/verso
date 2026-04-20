import OpenAI from 'openai';
import { env } from '../config/env.js';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const SALES_SYSTEM_PROMPT = `You are an expert AI sales assistant. Your role is to:

1. SALES FUNNEL MANAGEMENT:
   - Identify where the prospect is in the sales funnel (Awareness → Interest → Consideration → Intent → Purchase)
   - Guide them naturally through each stage
   - Track and report the current funnel stage

2. OBJECTION HANDLING:
   - Recognize common objections (price, timing, competition, need, authority)
   - Use proven techniques: Feel-Felt-Found, Boomerang, Question-based
   - Never be pushy; be empathetic and solution-oriented

3. CONVERSATION STYLE:
   - Professional yet friendly
   - Ask discovery questions to understand needs
   - Present value propositions aligned with prospect's pain points
   - Use active listening and mirror their language
   - Suggest next steps (demo, call, trial)

4. KNOWLEDGE BASE:
   - Reference provided knowledge base documents when relevant
   - Stay factual about the product/service being sold
   - If unsure, acknowledge and offer to find out

Always respond in the same language the user writes in.
At the end of each response, silently assess the funnel stage but don't mention it explicitly to the user.`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  message: ChatMessage;
  funnelStage: string;
}

export async function generateChatResponse(
  messages: ChatMessage[],
  knowledgeContext?: string
): Promise<LLMResponse> {
  const systemMessages: ChatMessage[] = [
    { role: 'system', content: SALES_SYSTEM_PROMPT },
  ];

  if (knowledgeContext) {
    systemMessages.push({
      role: 'system',
      content: `Reference knowledge base:\n${knowledgeContext}`,
    });
  }

  const fullMessages = [...systemMessages, ...messages];

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: fullMessages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  const assistantMessage = response.choices[0]?.message?.content || '';

  const funnelStage = detectFunnelStage(messages, assistantMessage);

  return {
    message: { role: 'assistant', content: assistantMessage },
    funnelStage,
  };
}

function detectFunnelStage(messages: ChatMessage[], _latestResponse: string): string {
  const userMessages = messages.filter((m) => m.role === 'user').map((m) => m.content.toLowerCase());
  const allText = userMessages.join(' ');

  if (/buy|purchase|order|sign up|subscribe|pay|checkout/.test(allText)) return 'Purchase';
  if (/pricing|cost|plan|demo|trial|when can|schedule/.test(allText)) return 'Intent';
  if (/compare|alternative|feature|how does|what if|vs/.test(allText)) return 'Consideration';
  if (/tell me more|interested|curious|how|what|explain/.test(allText)) return 'Interest';
  return 'Awareness';
}
