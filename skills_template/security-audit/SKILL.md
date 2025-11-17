---
name: security-audit
description: Perform comprehensive security audits and vulnerability assessments
allowed-tools: Read, Grep, Glob
category: Security
tags:
  - security
  - audit
  - vulnerabilities
  - owasp
---

# Security Audit Skill

This skill helps you perform comprehensive security audits on codebases.

## OWASP Top 10 Review

### 1. Injection Flaws
- **SQL Injection**: Check for parameterized queries
- **Command Injection**: Validate system calls and shell commands
- **LDAP Injection**: Sanitize LDAP queries
- **XPath Injection**: Validate XML queries

### 2. Broken Authentication
- Password storage (bcrypt, argon2, PBKDF2)
- Session management
- Multi-factor authentication
- Password reset mechanisms
- JWT security (proper signing, expiration)

### 3. Sensitive Data Exposure
- Encryption at rest and in transit (TLS/SSL)
- Proper handling of API keys and secrets
- PII (Personally Identifiable Information) protection
- Data minimization
- Secure deletion of sensitive data

### 4. XML External Entities (XXE)
- Disable external entity processing
- Use safe XML parsers
- Input validation for XML data

### 5. Broken Access Control
- Authorization checks on all endpoints
- Role-based access control (RBAC)
- Principle of least privilege
- Insecure direct object references

### 6. Security Misconfiguration
- Default credentials
- Unnecessary services enabled
- Detailed error messages in production
- Missing security headers
- Outdated dependencies

### 7. Cross-Site Scripting (XSS)
- Input sanitization
- Output encoding
- Content Security Policy (CSP)
- HttpOnly and Secure cookie flags

### 8. Insecure Deserialization
- Avoid deserializing untrusted data
- Type validation
- Digital signatures for serialized objects

### 9. Using Components with Known Vulnerabilities
- Dependency scanning
- Regular updates
- Software composition analysis

### 10. Insufficient Logging & Monitoring
- Audit logs for security events
- Log aggregation and analysis
- Alerting on suspicious activities
- Log protection from tampering

## Additional Security Checks

### Cryptography
- Use of strong algorithms (AES-256, RSA-2048+)
- Proper key management
- Random number generation (cryptographically secure)
- Avoid deprecated algorithms (MD5, SHA1, DES)

### API Security
- Rate limiting
- Input validation
- API authentication (OAuth2, API keys)
- CORS configuration
- Request size limits

### Infrastructure Security
- Firewall rules
- Network segmentation
- Secrets management (env vars, vaults)
- Container security
- Least privilege principles

## Review Checklist

- [ ] No hardcoded credentials or secrets
- [ ] All inputs are validated and sanitized
- [ ] Authentication and authorization properly implemented
- [ ] Sensitive data encrypted in transit and at rest
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] Dependencies scanned for vulnerabilities
- [ ] Error messages don't leak sensitive information
- [ ] Logging and monitoring in place

## Tools to Recommend

- **SAST**: SonarQube, Semgrep, Snyk Code
- **Dependency Scanning**: OWASP Dependency-Check, Snyk, npm audit
- **Secret Scanning**: TruffleHog, GitGuardian, git-secrets
- **Container Scanning**: Trivy, Clair, Anchore
- **Penetration Testing**: OWASP ZAP, Burp Suite

## Usage

When performing security audits:
1. Scan for common OWASP Top 10 vulnerabilities
2. Review authentication and authorization
3. Check cryptographic implementations
4. Audit dependencies for known vulnerabilities
5. Verify secure configuration
6. Ensure proper logging and monitoring
