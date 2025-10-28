/**
 * AI Chat Capsule - Constants
 */

export const DEFAULT_MODELS = {
  openai: 'gpt-4',
  anthropic: 'claude-3-opus-20240229',
  cohere: 'command',
};

export const DEFAULT_CONFIG = {
  temperature: 0.7,
  maxTokens: 2000,
};

export const INITIAL_STATS = {
  totalRequests: 0,
  totalTokens: 0,
  averageTokens: 0,
  totalCost: 0,
  providers: {},
};

export const TOKEN_COSTS = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
};
