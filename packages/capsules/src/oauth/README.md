# OAuth Capsule ♚

OAuth 2.0 social authentication with Google, GitHub, Facebook, Twitter, LinkedIn, and Microsoft.

## Features

- Multiple OAuth providers
- Authorization code flow
- Token management and refresh
- User profile retrieval
- PKCE support
- State verification
- Scope management

## Installation

```bash
npm install @capsulas/capsules
```

## Quick Start

### Google OAuth

```typescript
import { createOAuthService } from '@capsulas/capsules/oauth';

const oauth = await createOAuthService({
  provider: 'google',
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'http://localhost:3000/auth/callback',
  scopes: ['profile', 'email'],
});

// Get authorization URL
const authUrl = oauth.getAuthorizationUrl();

// Exchange code for token (in callback)
const token = await oauth.exchangeCodeForToken(code);

// Get user info
const user = await oauth.getUserInfo(token.accessToken);
console.log(user);
```

### GitHub OAuth

```typescript
const oauth = await createOAuthService({
  provider: 'github',
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'http://localhost:3000/auth/callback',
  scopes: ['user', 'repo'],
});
```

## Supported Providers

- Google
- GitHub
- Facebook
- Twitter
- LinkedIn
- Microsoft

## License

MIT
