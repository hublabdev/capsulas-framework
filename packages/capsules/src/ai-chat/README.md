# AI Chat Capsule

**AI-powered chatbot with OpenAI, Anthropic, and Cohere support**

## Features

✅ Multi-provider support (OpenAI, Anthropic, Cohere)
✅ Conversation management
✅ Token usage tracking
✅ Cost calculation
✅ System prompts
✅ 8 specialized error types

## Quick Start

```typescript
import { createAIChatService } from '@capsulas/capsules/ai-chat';

const ai = await createAIChatService({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  systemPrompt: 'You are a helpful assistant.',
});

const response = await ai.chat('Hello, how are you?');
console.log(response.content);

// Get stats
const stats = ai.getStats();
console.log(`Total tokens: ${stats.totalTokens}`);
console.log(`Total cost: $${stats.totalCost.toFixed(4)}`);
```

## Examples

### Chatbot

```typescript
const ai = await createAIChatService({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7,
  maxTokens: 1000,
});

// Multi-turn conversation
await ai.chat('What is TypeScript?');
await ai.chat('Can you give me an example?');
await ai.chat('Thanks!');

// Get conversation history
const conversation = ai.getConversation();
```

### With System Prompt

```typescript
const ai = await createAIChatService({
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-opus-20240229',
  systemPrompt: 'You are an expert programmer specializing in TypeScript.',
});

const response = await ai.chat('How do I create a generic function?');
```

## License

MIT License
