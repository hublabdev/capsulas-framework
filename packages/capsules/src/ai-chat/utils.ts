/**
 * AI Chat Capsule - Utils
 */

export function generateChatId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function calculateCost(tokens: number, model: string, costs: any): number {
  const rate = costs[model] || { input: 0, output: 0 };
  return (tokens * rate.input) / 1000;
}
