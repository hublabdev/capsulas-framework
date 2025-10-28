# Capsulas Documentation

Welcome to the Capsulas framework documentation. This guide will help you build, deploy, and maintain applications created with Capsulas.

## Quick Navigation

### For Users
- **[Getting Started](./GETTING_STARTED.md)** - ⭐ **START HERE** - Build your first app in 10 minutes
- [FAQ](./FAQ.md) - Frequently asked questions
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Deploy to any platform

### For AI Assistants
- [AI Assistant Guide](./AI_ASSISTANT_GUIDE.md) - **START HERE** if you're an AI helping with Capsulas code
- [Code Generation Template](./CODE_GENERATION_TEMPLATE.md) - Understand generated code structure

### For Developers
- [Creating Capsules](./creating-capsules.md) - Build custom capsules
- [API Reference](./api-reference.md) - Core API documentation
- [Contributing](../CONTRIBUTING.md) - Contribution guidelines

## What is Capsulas?

Capsulas is a visual development framework that generates production-ready TypeScript code. Build applications by connecting pre-built modules ("capsules"), then export clean code you own and can deploy anywhere.

### Key Features

- **Visual Editor** - Drag, drop, and connect capsules
- **Type-Safe** - Connections are validated in real-time
- **Code Generation** - Generates clean TypeScript you own
- **Platform Agnostic** - Deploy to Vercel, Railway, AWS, Docker, anywhere
- **Portable** - Desktop app (like VS Code) or web interface
- **Open Source** - MIT license, free forever

## Getting Started

### Install Desktop App (Recommended)

**macOS:**
```bash
# Download from releases or build from source
cd packages/desktop
npm install
npm run build:mac
```

**Windows:**
```bash
npm run build:win
```

**Linux:**
```bash
npm run build:linux
```

### Install CLI

```bash
npm install -g @capsulas/cli
capsulas create my-app
cd my-app
capsulas dev
```

### Use Web Version

```bash
git clone https://github.com/yourusername/capsulas
cd capsulas/packages/web
npm install
npm start
# Open http://localhost:3050
```

## Your First Flow

1. **Open Capsulas** (desktop app or web)

2. **Drag capsules** onto the canvas:
   - Auth JWT (authentication)
   - Database (data storage)
   - AI Chat (optional, for AI features)

3. **Connect them**:
   - Click output port (right side) of Auth
   - Drag to input port (left side) of Database
   - Ports turn green if compatible

4. **Configure each capsule**:
   - Click on a capsule
   - Right panel opens
   - Set parameters in the "Parameters" tab

5. **Test your flow**:
   - Click "Run Flow" button
   - Check console for results
   - Fix any errors

6. **Export code**:
   - Click "Export Code" button
   - Save TypeScript file
   - Ready to deploy!

## Understanding Generated Code

Capsulas generates code with this structure:

```typescript
// Imports - Capsules used in your flow
import { createAuthService } from '@capsulas/capsules/auth';

// Config - Environment variables
const config = {
  jwtSecret: process.env.JWT_SECRET,
  // ...
};

// Services - Initialized once
const authService = createAuthService(config);

// Main flow - Executes your logic
async function executeFlow() {
  // Step 1: Auth
  const result_node_1 = await authService.login(/*...*/);

  // Step 2: Database (uses result from Step 1)
  const input_node_2 = {
    userId: result_node_1?.user?.id
  };
  const result_node_2 = await databaseService.query(/*...*/);

  return { success: true, data: result_node_2 };
}
```

**Key concepts:**
- **Services**: Reusable, stateless modules
- **Steps**: Execute in dependency order
- **Data Flow**: `result_node_X` → `input_node_Y`
- **Environment**: All config from env vars

See [Code Generation Template](./CODE_GENERATION_TEMPLATE.md) for full details.

## Deployment

### Quick Deploy Options

**Vercel** (best for Next.js):
```bash
vercel --prod
```

**Railway** (best for full-stack):
```bash
railway up
```

**Docker** (works everywhere):
```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
```

See [Deployment Guide](./DEPLOYMENT_GUIDE.md) for all platforms:
- Vercel
- Railway
- AWS Lambda
- Heroku
- Replit
- Docker
- Self-hosted VPS

### Environment Variables

Every app needs environment variables. Capsulas generates `.env.example`:

```bash
# Copy and fill in values
cp .env.example .env

# Required variables depend on capsules used
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-min-32-chars
OPENAI_API_KEY=sk-...
```

## Documentation Structure

```
docs/
├── README.md                      # You are here
├── FAQ.md                         # Common questions
├── DEPLOYMENT_GUIDE.md            # Platform-specific deployment
├── AI_ASSISTANT_GUIDE.md          # For AI assistants helping users
├── CODE_GENERATION_TEMPLATE.md   # Generated code structure
├── creating-capsules.md           # Build custom capsules
├── api-reference.md               # API documentation
└── troubleshooting.md             # Common issues and solutions
```

## Available Capsules

### Authentication (auth)
- `auth-jwt` - Token-based authentication
- `auth-oauth` - Social login (Google, GitHub, Microsoft)
- `auth-session` - Cookie-based authentication

### Data (data)
- `database` - SQL/NoSQL queries (PostgreSQL, MongoDB, MySQL)
- `cache` - Redis/Memory caching
- `storage` - File storage (S3, local)

### AI (ai)
- `ai-chat` - Chat completions (GPT-4, Claude)
- `ai-embeddings` - Text embeddings
- `ai-image` - Image generation (DALL-E, Stable Diffusion)

### Communication (communication)
- `email` - Send emails (SendGrid, SMTP)
- `sms` - Send SMS (Twilio)
- `websocket` - Real-time connections

### Payments (payments)
- `stripe` - Stripe payments and subscriptions
- `paypal` - PayPal integration

### Processing (processing)
- `queue` - Background jobs with retry logic
- `cron` - Scheduled tasks
- `workflow` - Multi-step workflows

### Integration (integration)
- `webhook` - HTTP webhooks
- `rest-api` - REST API calls

## For AI Assistants

If you're an AI assistant helping a user with Capsulas-generated code:

1. **Read [AI Assistant Guide](./AI_ASSISTANT_GUIDE.md) FIRST**
   - It has everything you need to help users
   - Platform-specific patterns
   - Common issues and solutions
   - Quick deployment guides

2. **Identify the platform**
   - Ask: "Where do you want to deploy?"
   - See: AI_ASSISTANT_GUIDE.md → Platform-Specific Guides

3. **Check generated code**
   - Look for `// GENERATED BY CAPSULAS FRAMEWORK` header
   - Read `FLOW_METADATA` object for structure
   - See CODE_GENERATION_TEMPLATE.md for patterns

4. **Help deploy**
   - Uncomment platform wrapper
   - Create platform-specific files
   - Validate environment variables
   - Provide deployment commands

5. **Reference docs**
   - DEPLOYMENT_GUIDE.md for detailed steps
   - FAQ.md for common questions
   - Troubleshooting.md for error solutions

## Common Tasks

### Add a New Capsule to Flow

1. Drag capsule from sidebar
2. Drop on canvas
3. Connect ports (if needed)
4. Configure in right panel
5. Re-export code

### Modify Generated Code

```bash
# Export code first
capsulas export > my-app.ts

# Make changes
vim my-app.ts

# Version control recommended
git add my-app.ts
git commit -m "Add custom validation"
```

**Warning**: Regenerating will overwrite changes. Use version control!

### Test Before Deploying

```bash
# Set environment variables
cp .env.example .env
# Edit .env with your values

# Install dependencies
npm install

# Build
npm run build

# Run locally
node dist/generated-app.js
```

### Debug Issues

1. **Check environment variables**
   ```bash
   cat .env.example  # What's needed
   env | grep -E 'DATABASE|JWT|API'  # What's set
   ```

2. **Check connections**
   - Open flow.json
   - Verify all nodes are connected
   - Check port type compatibility

3. **Check logs**
   - Generated code has console.log at each step
   - Look for "[STEP X]" messages
   - Error messages are descriptive

4. **Check dependencies**
   ```bash
   npm ls  # Verify all installed
   npm audit  # Check for issues
   ```

## Production Checklist

Before going live:

### Security
- [ ] All secrets in environment variables
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured
- [ ] Input validation added
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (use parameterized queries)

### Performance
- [ ] Database indexes created
- [ ] Caching implemented
- [ ] CDN for static assets
- [ ] Connection pooling configured

### Monitoring
- [ ] Error tracking (Sentry, Rollbar)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Log aggregation (Loggly, Papertrail)
- [ ] Alerts configured

### Reliability
- [ ] Health check endpoint
- [ ] Graceful shutdown
- [ ] Auto-restart (PM2, systemd)
- [ ] Database backups
- [ ] Disaster recovery plan

## Support

### Community
- **Discord**: https://discord.gg/capsulas
- **GitHub Discussions**: https://github.com/yourusername/capsulas/discussions
- **Twitter**: @capsulasdev

### Documentation
- **FAQ**: Common questions answered
- **Deployment Guide**: Platform-specific instructions
- **AI Assistant Guide**: For AI-assisted help
- **API Reference**: Technical details

### Issues
- **Bug Reports**: https://github.com/yourusername/capsulas/issues/new?template=bug
- **Feature Requests**: https://github.com/yourusername/capsulas/issues/new?template=feature
- **Security**: security@capsulas.dev

## Contributing

We welcome contributions!

1. Read [Contributing Guide](../CONTRIBUTING.md)
2. Fork the repository
3. Create feature branch
4. Make changes
5. Submit pull request

**Popular contributions:**
- New capsules (see creating-capsules.md)
- Documentation improvements
- Bug fixes
- Example projects
- Platform integrations

## License

MIT License - Use freely, commercially or personally.

See [LICENSE](../LICENSE) for details.

## Next Steps

**New Users:**
1. Install desktop app or CLI
2. Follow "Your First Flow" above
3. Read FAQ for common questions
4. Join Discord for community support

**Deploying:**
1. Export your code
2. Choose platform (see Deployment Guide)
3. Set environment variables
4. Deploy!

**Building Capsules:**
1. Read Creating Capsules guide
2. Use defineCapsule() helper
3. Test thoroughly
4. Submit PR to add to official collection

**Need Help with Code?**
- AI assistants: Read AI_ASSISTANT_GUIDE.md
- Users: Read FAQ.md or ask in Discord
- Bugs: Open GitHub issue

---

**Made with care by the Capsulas community**

Build amazing things visually, deploy anywhere, own your code.
