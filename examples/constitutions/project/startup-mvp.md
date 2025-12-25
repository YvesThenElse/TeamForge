---
name: Startup MVP Constitution
description: Guidelines for rapid MVP development with reasonable quality
category: project
tags: [startup, mvp, rapid-development, pragmatic]
---

# Startup MVP Development Guidelines

## Core Philosophy

**Ship fast, but don't ship garbage.**

The goal is to validate ideas quickly while maintaining enough quality to iterate. We optimize for learning speed, not perfection.

## What to Prioritize

### Must Have
- Core functionality works reliably
- No data loss or corruption
- Basic security (auth, no SQL injection, etc.)
- User can complete the main flow
- Errors are handled gracefully

### Nice to Have (Later)
- Perfect code architecture
- 100% test coverage
- Full documentation
- Edge case handling
- Performance optimization

### Explicitly Skip
- Premature abstraction
- Features "we might need"
- Perfect mobile responsiveness
- Supporting legacy browsers
- Internationalization (unless core to product)

## Code Quality Balance

### Quick Wins to Keep
```typescript
// TypeScript - catches bugs early
// Basic error handling
// Meaningful variable names
// Simple file organization
```

### Technical Debt That's OK
```typescript
// TODO: Refactor when we have more users
// Hardcoded values for demo
// Simple state management (useState over Redux)
// Monolith over microservices
```

### Technical Debt That's NOT OK
```typescript
// No error handling at all
// Secrets in code
// No input validation
// Race conditions with data
// Broken authentication
```

## Development Approach

### Build Vertically
Complete one feature end-to-end before starting another:
1. Database schema
2. API endpoint
3. Frontend UI
4. Basic validation
5. Error handling
6. SHIP IT

### The 80/20 Rule
- Build 80% of the value with 20% of the effort
- That last 20% of polish can wait
- Focus on the critical path

### Make it Work, Then Make it Right
```
Day 1: Make it work (prototype)
Day 2: Make it work reliably (production)
Day 30: Make it right (refactor)
Day 90: Make it fast (optimize)
```

## Technology Choices

### Prefer Boring Technology
- Use what the team knows
- Pick popular frameworks with good docs
- Avoid cutting-edge unless necessary
- Managed services over self-hosted

### Suggested Stack
```
Frontend: Next.js or Vite + React
Backend: Node.js or your strongest language
Database: PostgreSQL (or SQLite for prototype)
Auth: Clerk, Auth0, or Firebase Auth
Hosting: Vercel, Railway, or Render
```

## Decision Framework

When in doubt, ask:
1. Does this help us learn if users want this?
2. Can we change this easily later?
3. What's the cost of getting it wrong?
4. What's the fastest path to validation?

### Quick Decisions
- Use the simpler solution
- Copy code instead of abstracting (initially)
- Use third-party services
- Pick defaults over configuration

## Shipping Checklist

Before launching any feature:
- [ ] Core happy path works
- [ ] Obvious errors show friendly messages
- [ ] No console errors in browser
- [ ] Basic input validation
- [ ] Auth protected where needed
- [ ] Can you demo it confidently?

## What Success Looks Like

- Features ship in days, not weeks
- Bugs are fixed same-day
- Tech debt is tracked, not ignored
- Team can move fast and understand code
- Users can accomplish their goals
