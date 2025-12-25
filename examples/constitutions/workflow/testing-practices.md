---
name: Testing Best Practices
description: Guidelines for writing effective and maintainable tests
category: workflow
tags: [testing, unit-tests, integration, tdd, quality]
---

# Testing Best Practices

## Test Structure

### Arrange-Act-Assert (AAA)
```typescript
describe('calculateDiscount', () => {
  it('should apply percentage discount correctly', () => {
    // Arrange
    const originalPrice = 100;
    const discountPercent = 20;

    // Act
    const result = calculateDiscount(originalPrice, discountPercent);

    // Assert
    expect(result).toBe(80);
  });
});
```

### Given-When-Then (BDD style)
```typescript
describe('User authentication', () => {
  describe('given valid credentials', () => {
    describe('when user attempts login', () => {
      it('then should return auth token', async () => {
        // ...
      });
    });
  });
});
```

## Naming Conventions

### Test File Names
```
component.test.ts       // Unit tests
component.spec.ts       // Same as .test.ts
component.e2e.ts        // End-to-end tests
component.integration.ts // Integration tests
```

### Test Descriptions
```typescript
// Format: should [expected behavior] when [condition]
it('should return empty array when input is null')
it('should throw ValidationError when email is invalid')
it('should retry 3 times when API returns 503')
```

## What to Test

### Unit Tests
- Pure functions (given input, expect output)
- Edge cases (null, empty, boundary values)
- Error conditions
- Business logic

### Integration Tests
- API endpoints
- Database operations
- External service interactions
- Component interactions

### E2E Tests
- Critical user flows
- Happy paths
- Core business scenarios

## Test Quality

### Good Tests Are:
- **Fast** - Run in milliseconds
- **Isolated** - No dependencies on other tests
- **Repeatable** - Same result every time
- **Self-validating** - Clear pass/fail
- **Timely** - Written with or before the code

### Avoid:
- Testing implementation details
- Testing framework/library code
- Brittle tests tied to UI structure
- Tests that require specific order

## Mocking Guidelines

### When to Mock
- External APIs
- Database calls in unit tests
- Time-dependent code
- Random number generation

### When NOT to Mock
- The thing you're testing
- Simple data structures
- Value objects

### Example
```typescript
// Mock external dependency
jest.mock('./emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true })
}));

// Don't mock the function you're testing!
// Bad: jest.mock('./userService') in userService.test.ts
```

## Test Data

### Use Factories
```typescript
const createUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides
});

it('should greet user by name', () => {
  const user = createUser({ name: 'Alice' });
  expect(greet(user)).toBe('Hello, Alice!');
});
```

### Avoid Magic Values
```typescript
// Bad
expect(result.length).toBe(5);

// Good
const EXPECTED_ITEMS = 5;
expect(result.length).toBe(EXPECTED_ITEMS);

// Better - derive from test data
const items = [1, 2, 3, 4, 5];
const result = processItems(items);
expect(result.length).toBe(items.length);
```

## Coverage Guidelines

- Aim for 80% coverage as baseline
- 100% coverage doesn't mean bug-free
- Cover edge cases over trivial getters
- Prioritize critical path coverage

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific file
npm test -- user.test.ts

# Run in watch mode
npm test -- --watch

# Run only failed tests
npm test -- --onlyFailures
```
