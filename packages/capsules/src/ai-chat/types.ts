/**
 * AI Chat Capsule - Types
 */

export type AIProvider = 'openai' | 'anthropic' | 'cohere' | 'custom';
export type ChatRole = 'system' | 'user' | 'assistant';

export interface AIChatConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  baseURL?: string;
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
  name?: string;
  timestamp?: number;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  stop?: string[];
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  content: string;
  role: ChatRole;
  finishReason?: string;
  usage?: TokenUsage;
  timestamp: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatStats {
  totalRequests: number;
  totalTokens: number;
  averageTokens: number;
  totalCost: number;
  providers: Record<string, number>;
}
