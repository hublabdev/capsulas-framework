/**
 * Capsulas Integration Demo Server
 *
 * A complete social media application demonstrating integration of:
 * - JWT Auth: User authentication and authorization
 * - Encryption: Secure sensitive data
 * - Validator: Input validation
 * - File Upload: Profile pictures and posts
 * - Storage: Cloud file storage
 * - Email: Welcome emails and notifications
 * - Logger: Application logging
 * - Cache: Session and data caching
 * - HTTP: External API integrations
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  logger,
  cache,
  encryption,
  auth,
  validator,
  fileUpload,
  storage,
  email,
  http,
  users,
  sessions,
  posts,
  cleanupCapsulas,
} from './capsulas-mock.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================================================
// AUTHENTICATION MIDDLEWARE (uses JWT Auth + Cache capsules)
// ============================================================================
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT token
    const result = await auth.verifyFromHeader(authHeader);
    if (!result.valid) {
      logger.warn('Invalid token attempt', { ip: req.ip });
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check cache for user session
    const cachedUser = await cache.get(`user:${result.payload.sub}`);
    if (cachedUser) {
      req.user = JSON.parse(cachedUser);
      logger.debug('User loaded from cache', { userId: req.user.id });
    } else {
      req.user = users.get(result.payload.sub);
      if (req.user) {
        // Cache user for 5 minutes
        await cache.set(`user:${req.user.id}`, JSON.stringify(req.user), 300);
      }
    }

    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }

    next();
  } catch (error) {
    logger.error('Auth middleware error', { error: error.message });
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// ============================================================================
// API ROUTE 1: User Registration
// Integration: Validator + Encryption + JWT Auth + Email + Logger
// ============================================================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    logger.info('Registration attempt', { email });

    // STEP 1: Validate input using Validator capsule
    const emailValidation = await validator.validateField('email', email, {
      rules: { required: true, email: true },
    });

    if (emailValidation.length > 0) {
      return res.status(400).json({
        error: 'Invalid email',
        details: emailValidation,
      });
    }

    const passwordValidation = await validator.validateField('password', password, {
      rules: { required: true, minLength: 8 },
    });

    if (passwordValidation.length > 0) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
        details: passwordValidation,
      });
    }

    // Check if user exists
    const existingUser = Array.from(users.values()).find((u) => u.email === email);
    if (existingUser) {
      logger.warn('Registration failed: email already exists', { email });
      return res.status(400).json({ error: 'Email already registered' });
    }

    // STEP 2: Hash password using JWT Auth capsule
    const { hash, salt } = auth.hashPassword(password);

    // STEP 3: Encrypt sensitive data using Encryption capsule
    const encryptedEmail = encryption.encrypt(email);

    // STEP 4: Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      id: userId,
      email,
      encryptedEmail: encryptedEmail.encrypted,
      emailIV: encryptedEmail.iv,
      emailAuthTag: encryptedEmail.authTag,
      passwordHash: hash,
      passwordSalt: salt,
      name,
      createdAt: Date.now(),
      posts: [],
    };

    users.set(userId, user);

    // STEP 5: Create JWT tokens
    const tokens = await auth.createTokenPair({
      sub: userId,
      email,
      name,
    });

    // STEP 6: Cache session
    await cache.set(`session:${tokens.accessToken}`, userId, 900); // 15 minutes

    // STEP 7: Send welcome email using Email capsule
    try {
      await email.send({
        to: { email, name },
        subject: 'Welcome to Capsulas Demo!',
        text: `Hi ${name},\n\nWelcome to our platform! Your account has been created successfully.\n\nBest regards,\nCapsulas Team`,
        html: `<h1>Welcome ${name}!</h1><p>Your account has been created successfully.</p>`,
      });

      logger.info('Welcome email sent', { userId, email });
    } catch (emailError) {
      // Don't fail registration if email fails
      logger.error('Failed to send welcome email', {
        userId,
        error: emailError.message,
      });
    }

    logger.info('User registered successfully', { userId, email });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 900, // 15 minutes
      },
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ============================================================================
// API ROUTE 2: User Login
// Integration: Validator + JWT Auth + Cache + Logger
// ============================================================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info('Login attempt', { email });

    // Validate input
    const emailValidation = await validator.validateField('email', email, {
      rules: { required: true, email: true },
    });

    if (emailValidation.length > 0) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Find user
    const user = Array.from(users.values()).find((u) => u.email === email);
    if (!user) {
      logger.warn('Login failed: user not found', { email });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = auth.verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      logger.warn('Login failed: invalid password', { email });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create tokens
    const tokens = await auth.createTokenPair({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    // Cache session
    await cache.set(`session:${tokens.accessToken}`, user.id, 900);
    await cache.set(`user:${user.id}`, JSON.stringify(user), 300);

    logger.info('User logged in successfully', { userId: user.id });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 900,
      },
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================================================
// API ROUTE 3: Upload Profile Picture
// Integration: File Upload + Storage + Cache + Logger
// ============================================================================
app.post('/api/user/profile-picture', authMiddleware, upload.single('picture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    logger.info('Profile picture upload', { userId: req.user.id, size: req.file.size });

    // Upload file using File Upload capsule
    const uploadedFile = await fileUpload.upload(req.file.buffer, req.file.originalname, {
      metadata: {
        userId: req.user.id,
        mimeType: req.file.mimetype,
        uploadedBy: req.user.name,
      },
      onProgress: (progress) => {
        logger.debug('Upload progress', {
          userId: req.user.id,
          percentage: progress.percentage,
        });
      },
    });

    // Also store in Storage capsule for cloud backup
    const storageResult = await storage.upload(
      req.file.buffer,
      `profiles/${req.user.id}/${uploadedFile.filename}`
    );

    // Update user profile
    req.user.profilePicture = {
      fileId: uploadedFile.id,
      filename: uploadedFile.filename,
      url: `/uploads/${uploadedFile.filename}`,
      cloudUrl: storageResult.url,
      thumbnails: uploadedFile.thumbnails?.map((t) => ({
        name: t.name,
        url: `/uploads/thumbnails/${path.basename(t.path)}`,
      })),
    };

    users.set(req.user.id, req.user);

    // Invalidate user cache
    await cache.delete(`user:${req.user.id}`);

    logger.info('Profile picture uploaded successfully', {
      userId: req.user.id,
      fileId: uploadedFile.id,
    });

    res.json({
      success: true,
      profilePicture: req.user.profilePicture,
    });
  } catch (error) {
    logger.error('Profile picture upload error', {
      userId: req.user.id,
      error: error.message,
    });
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ============================================================================
// API ROUTE 4: Create Post
// Integration: Validator + File Upload + Storage + Cache + Logger
// ============================================================================
app.post('/api/posts', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;

    logger.info('Creating post', { userId: req.user.id });

    // Validate post data
    const titleValidation = await validator.validateField('title', title, {
      rules: { required: true, minLength: 3, maxLength: 100 },
    });

    if (titleValidation.length > 0) {
      return res.status(400).json({ error: 'Invalid title', details: titleValidation });
    }

    // Create post
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const post = {
      id: postId,
      userId: req.user.id,
      author: req.user.name,
      title,
      content,
      createdAt: Date.now(),
      likes: 0,
    };

    // Handle image upload if provided
    if (req.file) {
      const uploadedFile = await fileUpload.upload(req.file.buffer, req.file.originalname, {
        metadata: {
          postId,
          userId: req.user.id,
          mimeType: req.file.mimetype,
        },
      });

      post.image = {
        fileId: uploadedFile.id,
        url: `/uploads/${uploadedFile.filename}`,
        thumbnails: uploadedFile.thumbnails,
      };
    }

    posts.set(postId, post);
    req.user.posts.push(postId);
    users.set(req.user.id, req.user);

    // Invalidate posts cache
    await cache.delete('posts:all');

    logger.info('Post created successfully', { postId, userId: req.user.id });

    res.status(201).json({
      success: true,
      post,
    });
  } catch (error) {
    logger.error('Create post error', { userId: req.user.id, error: error.message });
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ============================================================================
// API ROUTE 5: Get All Posts (with caching)
// Integration: Cache + Logger
// ============================================================================
app.get('/api/posts', async (req, res) => {
  try {
    // Try to get from cache first
    const cachedPosts = await cache.get('posts:all');
    if (cachedPosts) {
      logger.debug('Posts loaded from cache');
      return res.json({
        success: true,
        posts: JSON.parse(cachedPosts),
        source: 'cache',
      });
    }

    // Get from database
    const allPosts = Array.from(posts.values()).sort((a, b) => b.createdAt - a.createdAt);

    // Cache for 1 minute
    await cache.set('posts:all', JSON.stringify(allPosts), 60);

    logger.debug('Posts loaded from database');

    res.json({
      success: true,
      posts: allPosts,
      source: 'database',
    });
  } catch (error) {
    logger.error('Get posts error', { error: error.message });
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// ============================================================================
// API ROUTE 6: Get Statistics (demonstrates all capsules working together)
// Integration: All Capsulas
// ============================================================================
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const stats = {
      app: {
        totalUsers: users.size,
        totalPosts: posts.size,
        uptime: process.uptime(),
      },
      capsulas: {
        logger: logger.getStats(),
        cache: cache.getStats(),
        auth: auth.getStats(),
        fileUpload: fileUpload.getStats(),
        storage: storage.getStats(),
        email: email.getStats(),
        http: http.getStats(),
        validator: validator.getStats(),
      },
    };

    logger.info('Stats retrieved', { userId: req.user.id });

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error('Get stats error', { error: error.message });
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ============================================================================
// API ROUTE 7: Logout
// Integration: JWT Auth + Cache + Logger
// ============================================================================
app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.replace('Bearer ', '');

    // Revoke token
    await auth.revokeToken(token);

    // Clear cache
    await cache.delete(`session:${token}`);
    await cache.delete(`user:${req.user.id}`);

    logger.info('User logged out', { userId: req.user.id });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    capsulas: 'operational',
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║              🚀 CAPSULAS INTEGRATION DEMO                      ║
║                                                                ║
║  Server running at: http://localhost:${PORT}                     ║
║                                                                ║
║  Integrated Capsulas:                                          ║
║  ✓ JWT Auth ♔       - Authentication & Authorization          ║
║  ✓ Encryption ♜     - Data Encryption                         ║
║  ✓ File Upload ⭡    - File Uploads                            ║
║  ✓ Storage ╩        - Cloud Storage                           ║
║  ✓ Email ⌘          - Email Notifications                     ║
║  ✓ Validator ✓      - Input Validation                        ║
║  ✓ Logger ▤         - Application Logging                     ║
║  ✓ Cache ◰          - Data Caching                            ║
║  ✓ HTTP ≋           - HTTP Client                             ║
║                                                                ║
║  Endpoints:                                                    ║
║  POST   /api/auth/register      - Register new user           ║
║  POST   /api/auth/login         - Login                       ║
║  POST   /api/auth/logout        - Logout                      ║
║  POST   /api/user/profile-picture - Upload profile pic        ║
║  POST   /api/posts              - Create post                 ║
║  GET    /api/posts              - Get all posts               ║
║  GET    /api/stats              - Get statistics              ║
║  GET    /health                 - Health check                ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);

  logger.info('Server started', { port: PORT });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await cleanupCapsulas();
  process.exit(0);
});
