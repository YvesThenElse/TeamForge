---
name: Secure Coding Practices
description: Security-focused coding guidelines to prevent common vulnerabilities
category: security
tags: [security, owasp, vulnerabilities, best-practices]
---

# Secure Coding Practices

## CRITICAL RULES

### Never Hardcode Secrets
```typescript
// NEVER DO THIS
const API_KEY = "sk-1234567890abcdef";
const DB_PASSWORD = "admin123";

// DO THIS
const API_KEY = process.env.API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;
```

### Validate All Input
- Never trust user input
- Validate on both client AND server
- Use allowlists over denylists
- Sanitize before displaying

## Injection Prevention

### SQL Injection
```typescript
// VULNERABLE
const query = `SELECT * FROM users WHERE id = ${userId}`;

// SAFE - Use parameterized queries
const query = 'SELECT * FROM users WHERE id = $1';
await db.query(query, [userId]);
```

### XSS (Cross-Site Scripting)
```typescript
// VULNERABLE
element.innerHTML = userInput;

// SAFE - Use text content or escape
element.textContent = userInput;

// SAFE - Use framework escaping
<div>{userInput}</div>  // React auto-escapes
```

### Command Injection
```typescript
// VULNERABLE
exec(`ls ${userPath}`);

// SAFE - Use arrays, not string concatenation
execFile('ls', [userPath]);

// BETTER - Avoid shell commands when possible
fs.readdir(userPath);
```

## Authentication & Authorization

### Password Handling
```typescript
// Hash passwords with bcrypt (work factor >= 12)
const hash = await bcrypt.hash(password, 12);

// Compare securely
const valid = await bcrypt.compare(input, hash);
```

### Session Management
- Use secure, httpOnly, sameSite cookies
- Regenerate session ID on login
- Implement proper logout (invalidate server-side)
- Set reasonable session timeouts

### Authorization Checks
```typescript
// Always verify on the server
async function deletePost(postId: string, userId: string) {
  const post = await getPost(postId);

  // Check ownership
  if (post.authorId !== userId) {
    throw new ForbiddenError('Not authorized');
  }

  await db.deletePost(postId);
}
```

## Data Protection

### Sensitive Data
- Never log passwords, tokens, or PII
- Mask sensitive data in error messages
- Use encryption for data at rest
- Use TLS for data in transit

### Error Messages
```typescript
// VULNERABLE - Exposes internal info
throw new Error(`User ${email} not found in database ${dbName}`);

// SAFE - Generic message
throw new Error('Invalid credentials');

// Log details internally
logger.warn('Login failed', { email, reason: 'user_not_found' });
```

## Dependency Security

### Package Management
- Run `npm audit` regularly
- Update dependencies promptly
- Review new dependencies before adding
- Use lockfiles (package-lock.json)
- Consider using Snyk or Dependabot

### Avoid Dangerous Packages
- Check download counts and maintenance
- Review GitHub issues for security concerns
- Prefer well-maintained alternatives

## Security Headers

```typescript
// Essential headers
{
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'",
  'X-XSS-Protection': '1; mode=block'
}
```

## File Uploads

- Validate file types (don't trust extension)
- Scan for malware
- Store outside web root
- Generate random filenames
- Limit file sizes
- Never execute uploaded files

## Rate Limiting

```typescript
// Implement rate limiting for:
- Login attempts (prevent brute force)
- API endpoints (prevent DoS)
- Password reset (prevent enumeration)
- Signup (prevent spam)
```

## Security Checklist

Before deploying:
- [ ] No secrets in code or logs
- [ ] All inputs validated
- [ ] Authentication required where needed
- [ ] Authorization checked on all actions
- [ ] SQL queries parameterized
- [ ] User data escaped in output
- [ ] HTTPS enforced
- [ ] Security headers set
- [ ] Dependencies audited
- [ ] Error messages don't leak info
