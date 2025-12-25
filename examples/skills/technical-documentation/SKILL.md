---
name: technical-documentation
description: Write comprehensive technical documentation for software projects
allowed-tools: Read, Write, Edit, Grep, Glob
category: Documentation
tags:
  - documentation
  - technical-writing
  - readme
  - api-docs
---

# Technical Documentation Skill

This skill helps you create comprehensive technical documentation.

## Documentation Types

### README.md
```markdown
# Project Name

Brief description of what the project does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install package-name
\`\`\`

## Quick Start

\`\`\`javascript
const package = require('package-name');
package.doSomething();
\`\`\`

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| apiKey | string | - | Your API key |
| timeout | number | 5000 | Request timeout in ms |

## Examples

### Basic Usage
\`\`\`javascript
// Code example
\`\`\`

### Advanced Usage
\`\`\`javascript
// More complex example
\`\`\`

## API Reference

See [API.md](./API.md) for complete API documentation.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT
```

### API Documentation
```markdown
# API Reference

## Authentication

All API requests require an API key:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Endpoints

### GET /api/users

Retrieves all users.

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |

**Response**

\`\`\`json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "total": 100,
  "page": 1
}
\`\`\`

**Status Codes**

- `200 OK` - Success
- `401 Unauthorized` - Invalid API key
- `500 Internal Server Error` - Server error

### POST /api/users

Creates a new user.

**Request Body**

\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password"
}
\`\`\`

**Validation Rules**

- `name`: Required, 2-100 characters
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters
```

### Architecture Decision Records (ADR)
```markdown
# ADR-001: Use PostgreSQL for Database

## Status

Accepted

## Context

We need to choose a database for our application. We need:
- ACID compliance
- Complex queries support
- Good performance
- Strong ecosystem

## Decision

We will use PostgreSQL as our primary database.

## Consequences

**Positive:**
- Strong ACID compliance
- Rich feature set (JSON support, full-text search)
- Excellent performance
- Large community and ecosystem
- Good tooling

**Negative:**
- Requires more setup than SQLite
- Vertical scaling limits
- Learning curve for advanced features

## Alternatives Considered

- **MySQL**: Good but PostgreSQL has better feature set
- **MongoDB**: NoSQL not needed for our use case
- **SQLite**: Too limited for production use
```

## Code Documentation

### Function/Method Documentation

**JavaScript (JSDoc)**
```javascript
/**
 * Calculates the sum of two numbers
 *
 * @param {number} a - The first number
 * @param {number} b - The second number
 * @returns {number} The sum of a and b
 * @throws {TypeError} If parameters are not numbers
 *
 * @example
 * add(2, 3); // returns 5
 */
function add(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new TypeError('Parameters must be numbers');
    }
    return a + b;
}
```

**Python (Docstrings)**
```python
def calculate_average(numbers):
    """
    Calculate the average of a list of numbers.

    Args:
        numbers (list[float]): List of numbers to average

    Returns:
        float: The arithmetic mean of the numbers

    Raises:
        ValueError: If the list is empty
        TypeError: If list contains non-numeric values

    Examples:
        >>> calculate_average([1, 2, 3, 4, 5])
        3.0

        >>> calculate_average([10.5, 20.5, 30.0])
        20.333333333333332
    """
    if not numbers:
        raise ValueError("Cannot calculate average of empty list")
    return sum(numbers) / len(numbers)
```

**Java (Javadoc)**
```java
/**
 * Represents a user in the system.
 *
 * <p>This class encapsulates user information including
 * authentication details and personal information.</p>
 *
 * @author John Doe
 * @version 1.0
 * @since 2024-01-01
 */
public class User {

    /**
     * Gets the user by their unique identifier.
     *
     * @param id the unique identifier of the user
     * @return the User object if found
     * @throws UserNotFoundException if no user exists with given ID
     * @see UserRepository#findById(Long)
     */
    public User getUserById(Long id) throws UserNotFoundException {
        // Implementation
    }
}
```

**C# (XML Documentation)**
```csharp
/// <summary>
/// Processes an order and updates inventory.
/// </summary>
/// <param name="order">The order to process</param>
/// <returns>A task representing the async operation</returns>
/// <exception cref="ArgumentNullException">
/// Thrown when order is null
/// </exception>
/// <exception cref="InsufficientInventoryException">
/// Thrown when inventory is insufficient
/// </exception>
/// <example>
/// <code>
/// var order = new Order { ProductId = 1, Quantity = 5 };
/// await ProcessOrderAsync(order);
/// </code>
/// </example>
public async Task ProcessOrderAsync(Order order)
{
    // Implementation
}
```

## Best Practices

### Documentation Guidelines

1. **Keep It Updated**: Documentation should evolve with code
2. **Be Concise**: Clear and brief is better than verbose
3. **Use Examples**: Show, don't just tell
4. **Structure Logically**: Organize by user journey
5. **Link Between Docs**: Cross-reference related documentation
6. **Version Documentation**: Track changes over time

### What to Document

**Always Document:**
- Public APIs and interfaces
- Configuration options
- Installation and setup
- Architecture decisions
- Security considerations
- Error codes and troubleshooting

**Don't Over-Document:**
- Self-explanatory code
- Implementation details (use comments instead)
- Obvious functionality

### Documentation Structure

```
docs/
├── README.md                 # Project overview
├── GETTING_STARTED.md       # Quick start guide
├── INSTALLATION.md          # Installation guide
├── CONFIGURATION.md         # Configuration reference
├── API.md                   # API documentation
├── ARCHITECTURE.md          # System architecture
├── CONTRIBUTING.md          # Contribution guidelines
├── CHANGELOG.md             # Version history
├── TROUBLESHOOTING.md       # Common issues
├── adr/                     # Architecture decisions
│   ├── 001-database-choice.md
│   └── 002-authentication.md
└── guides/                  # How-to guides
    ├── deployment.md
    └── monitoring.md
```

## Tools & Generators

### API Documentation
- **Swagger/OpenAPI**: REST API documentation
- **GraphQL Playground**: GraphQL API exploration
- **Postman**: API documentation and testing
- **Redoc**: OpenAPI documentation renderer

### Code Documentation
- **JSDoc**: JavaScript documentation
- **Sphinx**: Python documentation
- **Javadoc**: Java documentation
- **Doxygen**: Multi-language documentation
- **DocFX**: .NET documentation

### Static Site Generators
- **MkDocs**: Markdown to static site
- **Docusaurus**: React-based documentation
- **VitePress**: Vite-powered static site
- **GitBook**: Online documentation platform

## Documentation Checklist

- [ ] README with clear project description
- [ ] Installation instructions
- [ ] Configuration guide
- [ ] API reference (if applicable)
- [ ] Code examples
- [ ] Architecture documentation
- [ ] Contributing guidelines
- [ ] Troubleshooting guide
- [ ] Changelog
- [ ] License information

## Usage

When creating documentation:
1. Start with a clear project overview
2. Provide step-by-step setup instructions
3. Include practical examples
4. Document all public APIs
5. Keep documentation in sync with code
6. Use diagrams for complex concepts
7. Make it searchable and navigable
