import { OpenAI } from 'openai';

let openaiClient: OpenAI;

const getOpenAIClient = (): OpenAI => {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return openaiClient;
};

const OPEN_AI_COMPLETION_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export const getCompletionFromOpenAI = async (
  prompt: string | ChatMessage[]
): Promise<string> => {
  const openai = getOpenAIClient();

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
    typeof prompt === 'string'
      ? [{ role: 'user', content: prompt }]
      : (prompt as OpenAI.Chat.Completions.ChatCompletionMessageParam[]);

  const completion = await openai.chat.completions.create({
    model: OPEN_AI_COMPLETION_MODEL,
    max_tokens: 1000,
    messages,
    temperature: 0.2,
  });

  return completion.choices[0]?.message?.content || '';
};

export default { getCompletionFromOpenAI };
