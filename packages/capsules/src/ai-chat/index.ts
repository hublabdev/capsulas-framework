/**
 * @capsulas/capsules - AI Chat Capsule
 *
 * AI-powered chatbot with OpenAI, Anthropic, Cohere support
 *
 * @category AI
 * @version 1.0.0
 */

export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { OpenAIAdapter, createAdapter } from './adapters';
export { AIChatService, createAIChatService } from './service';

import { AIChatService } from './service';
export default AIChatService;

export const aiChatCapsule = {
  id: 'ai-chat',
  name: 'AI Chat',
  description: 'AI-powered chatbot with multi-provider support',
  icon: '♞',
  category: 'ai',
  version: '1.0.0',
  tags: ['ai', 'chat', 'openai', 'anthropic', 'llm', 'chatbot'],
};
