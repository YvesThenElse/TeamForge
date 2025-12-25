---
name: API Security Guidelines
description: Security best practices for building and consuming APIs
category: security
tags: [api, rest, security, authentication, authorization]
---

# API Security Guidelines

## Authentication

### Token-Based Auth (JWT)
```typescript
// Generate tokens with appropriate claims
const token = jwt.sign(
  {
    sub: user.id,
    roles: user.roles,
    iat: Date.now()
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '15m',      // Short-lived access tokens
    algorithm: 'RS256'      // Use asymmetric if possible
  }
);
```

### Token Storage
- Access tokens: Memory or secure httpOnly cookies
- Refresh tokens: httpOnly, secure, sameSite cookies
- Never store tokens in localStorage (XSS vulnerable)

### Token Refresh Flow
```
1. Access token expires
2. Client sends refresh token
3. Server validates refresh token
4. Server issues new access token
5. Optionally rotate refresh token
```

## Authorization

### Implement at Every Layer
```typescript
// Route level
router.delete('/posts/:id',
  authenticate,           // Is user logged in?
  authorize(['admin']),   // Does user have permission?
  validateParams,         // Is input valid?
  deletePost             // Business logic
);

// Service level
async function deletePost(postId: string, user: User) {
  const post = await getPost(postId);

  // Resource-level check
  if (post.authorId !== user.id && !user.roles.includes('admin')) {
    throw new ForbiddenError();
  }

  await db.delete(postId);
}
```

### RBAC vs ABAC
```typescript
// Role-Based (RBAC) - Simple
if (user.role === 'admin') { allow(); }

// Attribute-Based (ABAC) - Flexible
if (user.department === resource.department &&
    user.clearanceLevel >= resource.classification) {
  allow();
}
```

## Input Validation

### Schema Validation
```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150).optional()
});

// In route handler
const result = CreateUserSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ errors: result.error.issues });
}
```

### Content-Type Validation
```typescript
// Only accept expected content types
if (req.headers['content-type'] !== 'application/json') {
  return res.status(415).json({ error: 'Unsupported Media Type' });
}
```

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// General API limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests'
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many login attempts'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

## Response Security

### Don't Leak Information
```typescript
// BAD - Leaks whether email exists
if (!user) {
  return res.status(404).json({ error: 'User not found' });
}
if (!validPassword) {
  return res.status(401).json({ error: 'Wrong password' });
}

// GOOD - Generic message
if (!user || !validPassword) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

### Consistent Error Format
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// Always return same structure
res.status(400).json({
  code: 'VALIDATION_ERROR',
  message: 'Invalid request body',
  details: validationErrors
});
```

## CORS Configuration

```typescript
const corsOptions = {
  origin: ['https://app.example.com'],  // Specific origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,                     // If using cookies
  maxAge: 86400                          // Cache preflight
};

// Never use origin: '*' with credentials
```

## API Versioning

```
/api/v1/users    # Version in URL (recommended)
Accept: application/vnd.api+json;version=1  # Header-based
```

## Logging & Monitoring

```typescript
// Log security-relevant events
logger.info('auth.login.success', { userId, ip });
logger.warn('auth.login.failed', { email, ip, reason });
logger.error('auth.token.invalid', { token: masked, ip });

// Never log:
// - Passwords
// - Full tokens
// - Credit card numbers
// - SSN or sensitive PII
```

## Checklist

- [ ] All endpoints require authentication (unless public)
- [ ] Authorization checked for every request
- [ ] Input validated with strict schemas
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Errors don't leak sensitive info
- [ ] Security events logged
- [ ] HTTPS enforced
- [ ] Tokens properly managed
