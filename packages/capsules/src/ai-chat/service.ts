/**
 * AI Chat Capsule - Service
 */

import type { AIChatConfig, ChatMessage, ChatCompletionResponse, ChatStats } from './types';
import { createAdapter, OpenAIAdapter } from './adapters';
import { INITIAL_STATS, DEFAULT_CONFIG, TOKEN_COSTS } from './constants';
import { calculateCost } from './utils';

export class AIChatService {
  private adapter: OpenAIAdapter | null = null;
  private config: AIChatConfig;
  private stats: ChatStats = { ...INITIAL_STATS };
  private conversation: ChatMessage[] = [];
  private initialized = false;

  constructor(config: AIChatConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.adapter = createAdapter(this.config);

    if (this.config.systemPrompt) {
      this.conversation.push({
        role: 'system',
        content: this.config.systemPrompt,
      });
    }

    this.initialized = true;
  }

  async chat(message: string): Promise<ChatCompletionResponse> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    this.conversation.push(userMessage);

    const response = await this.adapter!.chat({
      messages: this.conversation,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    });

    this.conversation.push({
      role: 'assistant',
      content: response.content,
      timestamp: response.timestamp,
    });

    this.updateStats(response);

    return response;
  }

  private updateStats(response: ChatCompletionResponse): void {
    this.stats.totalRequests++;

    if (response.usage) {
      this.stats.totalTokens += response.usage.totalTokens;
      this.stats.averageTokens = this.stats.totalTokens / this.stats.totalRequests;

      const cost = calculateCost(
        response.usage.totalTokens,
        response.model,
        TOKEN_COSTS
      );
      this.stats.totalCost += cost;
    }

    if (!this.stats.providers[this.config.provider]) {
      this.stats.providers[this.config.provider] = 0;
    }
    this.stats.providers[this.config.provider]++;
  }

  getConversation(): ChatMessage[] {
    return [...this.conversation];
  }

  clearConversation(): void {
    this.conversation = [];
    if (this.config.systemPrompt) {
      this.conversation.push({
        role: 'system',
        content: this.config.systemPrompt,
      });
    }
  }

  getStats(): ChatStats {
    return { ...this.stats };
  }

  getConfig(): Readonly<AIChatConfig> {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    this.conversation = [];
    this.adapter = null;
    this.initialized = false;
  }
}

export async function createAIChatService(config: AIChatConfig): Promise<AIChatService> {
  const service = new AIChatService(config);
  await service.initialize();
  return service;
}
