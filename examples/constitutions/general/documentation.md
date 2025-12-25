---
name: Documentation Standards
description: Guidelines for writing clear and useful documentation
category: general
tags: [documentation, readme, comments, api-docs]
---

# Documentation Standards

## README Structure

Every project should have a README.md with:

```markdown
# Project Name

One-line description of what this does.

## Quick Start

\`\`\`bash
# Get running in 3 commands or less
npm install
npm run dev
\`\`\`

## Features

- Key feature 1
- Key feature 2
- Key feature 3

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- etc.

## Installation

Step-by-step setup instructions.

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| PORT     | Server port | 3000    |
| DB_URL   | Database    | -       |

## Usage

Basic usage examples.

## Development

How to work on this project.

## Testing

How to run tests.

## Deployment

How to deploy.

## Contributing

How to contribute.

## License

MIT / Apache / etc.
```

## Code Documentation

### When to Document

**Do document:**
- Public APIs
- Complex algorithms
- Non-obvious business logic
- Workarounds for bugs/limitations
- Configuration options

**Don't document:**
- Obvious code
- What the code does (code should be clear)
- Commented-out code (delete it)

### Function Documentation

```typescript
/**
 * Calculates shipping cost based on distance and weight.
 *
 * Uses zone-based pricing for domestic shipments and
 * flat rate for international.
 *
 * @param weight - Package weight in kg (max 30)
 * @param destination - Destination postal code
 * @param options - Shipping options
 * @returns Calculated shipping cost in cents
 * @throws {ValidationError} If weight exceeds maximum
 *
 * @example
 * calculateShipping(5, "10001", { express: true })
 * // Returns 1599 (cents)
 */
function calculateShipping(
  weight: number,
  destination: string,
  options?: ShippingOptions
): number
```

### Inline Comments

```typescript
// Good: Explains WHY
// Using setTimeout(0) to defer execution until after DOM update
setTimeout(() => updateUI(), 0);

// Bad: Explains WHAT (obvious from code)
// Set user name to the value of name
user.name = name;

// Good: Documents workaround
// HACK: Safari doesn't support replaceAll, using split/join
const result = str.split(search).join(replace);
```

## API Documentation

### OpenAPI/Swagger Example
```yaml
/users/{id}:
  get:
    summary: Get user by ID
    description: |
      Retrieves a user's profile information.
      Requires authentication.
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
    responses:
      200:
        description: User found
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      404:
        description: User not found
```

## Architecture Documentation

### Architecture Decision Records (ADR)

```markdown
# ADR-001: Use PostgreSQL for Primary Database

## Status
Accepted

## Context
We need a primary database for our application.
Requirements: ACID compliance, JSON support, full-text search.

## Decision
We will use PostgreSQL.

## Consequences

### Positive
- Mature, reliable, well-documented
- Strong JSON support (JSONB)
- Excellent full-text search
- Team has experience

### Negative
- More complex than SQLite for development
- Requires separate service to run

## Alternatives Considered
- MySQL: Less flexible JSON support
- MongoDB: Not ACID compliant by default
- SQLite: Doesn't scale for production
```

## Changelog

### Format (Keep a Changelog)
```markdown
# Changelog

## [Unreleased]

### Added
- New user profile page

## [1.2.0] - 2024-01-15

### Added
- Export to CSV feature
- Dark mode support

### Changed
- Improved search performance by 40%

### Fixed
- Fixed login timeout issue (#123)

### Removed
- Deprecated v1 API endpoints
```

## Documentation Quality

### Checklist
- [ ] Up to date with code
- [ ] Tested examples work
- [ ] No broken links
- [ ] Spell-checked
- [ ] Reviewed by non-author
