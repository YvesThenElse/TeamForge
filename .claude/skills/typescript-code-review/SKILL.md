---
name: typescript-code-review
description: Comprehensive TypeScript code review and quality analysis
allowed-tools: Read, Grep, Glob
category: Code Review
tags:
  - typescript
  - code-review
  - quality
  - best-practices
---

# TypeScript Code Review Skill

This skill provides comprehensive code review for TypeScript projects.

## Review Areas

### Type Safety
- Proper use of TypeScript types
- Avoid `any` type unless absolutely necessary
- Use strict mode configurations
- Leverage type inference when appropriate
- Use union and intersection types effectively
- Proper generic type usage

### Code Quality
- **Naming Conventions**: Follow camelCase for variables, PascalCase for classes
- **Function Design**: Keep functions small and focused
- **Error Handling**: Proper error handling with typed errors
- **Async/Await**: Prefer async/await over promises
- **Immutability**: Use const and readonly when possible

### Best Practices
- Avoid non-null assertions (`!`) without justification
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Implement proper dependency injection
- Follow SOLID principles
- Use enums or const objects for constants
- Leverage utility types (Partial, Pick, Omit, etc.)

### Common Issues to Check
- Unused imports and variables
- Missing return types on functions
- Improper use of type assertions
- Missing null/undefined checks
- Circular dependencies
- Memory leaks in event listeners
- Improper use of `this` context

### Security Concerns
- XSS vulnerabilities in DOM manipulation
- Unsafe regular expressions
- Prototype pollution
- Insecure data validation

## Review Checklist

- [ ] All functions have proper type annotations
- [ ] No use of `any` without justification
- [ ] Error handling is comprehensive
- [ ] Code follows project style guidelines
- [ ] No console.log in production code
- [ ] Async operations are properly handled
- [ ] No hardcoded secrets or credentials
- [ ] Tests cover the new code

## Usage

When reviewing TypeScript code:
1. Check type safety and proper TypeScript usage
2. Verify code quality and best practices
3. Identify potential bugs and edge cases
4. Suggest improvements and optimizations
5. Ensure security best practices