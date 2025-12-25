---
name: General Best Practices
description: Fundamental coding principles and best practices for any project
category: general
tags: [best-practices, clean-code, fundamentals]
---

# General Best Practices

Follow these fundamental principles in all code you write or modify.

## Code Quality Principles

### KISS (Keep It Simple, Stupid)
- Prefer simple, straightforward solutions over clever ones
- If a solution requires extensive comments to explain, simplify it
- Break complex logic into smaller, well-named functions

### DRY (Don't Repeat Yourself)
- Extract repeated code into reusable functions or modules
- Use constants for magic numbers and repeated strings
- BUT: Don't over-abstract. Duplication is better than wrong abstraction

### YAGNI (You Aren't Gonna Need It)
- Only implement what is currently needed
- Don't add features "just in case"
- Remove dead code and unused dependencies

## Naming Conventions

- Use descriptive, meaningful names that reveal intent
- Variables: nouns that describe the data (`userCount`, `isValid`)
- Functions: verbs that describe the action (`calculateTotal`, `validateInput`)
- Booleans: use `is`, `has`, `can`, `should` prefixes
- Avoid abbreviations unless universally understood

## Function Design

- Functions should do one thing and do it well
- Keep functions short (ideally under 20 lines)
- Limit parameters to 3-4 maximum
- Avoid side effects when possible
- Return early for edge cases

## Error Handling

- Handle errors at the appropriate level
- Provide meaningful error messages
- Never silently swallow exceptions
- Log errors with sufficient context for debugging

## Comments

- Code should be self-documenting
- Only add comments to explain WHY, not WHAT
- Keep comments up-to-date with code changes
- Use TODO comments sparingly and with context
