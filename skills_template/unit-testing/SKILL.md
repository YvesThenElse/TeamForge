---
name: unit-testing
description: Write and maintain comprehensive unit tests for code
allowed-tools: Read, Write, Edit, Bash
category: Quality Assurance
tags:
  - testing
  - unit-tests
  - quality
  - tdd
---

# Unit Testing Skill

This skill helps you write comprehensive unit tests for your code.

## Capabilities

- **Test Creation**: Write unit tests with proper structure and coverage
- **Test Frameworks**: Support for Jest, PyTest, JUnit, XUnit, and more
- **Mocking & Stubs**: Create mocks, stubs, and test doubles
- **Test Coverage**: Analyze and improve test coverage
- **TDD Support**: Follow Test-Driven Development practices
- **Assertions**: Write clear and meaningful assertions
- **Edge Cases**: Identify and test edge cases and boundary conditions

## Best Practices

- Write tests that are **FIRST**: Fast, Isolated, Repeatable, Self-validating, Timely
- Use descriptive test names that explain what is being tested
- Follow the Arrange-Act-Assert (AAA) pattern
- Keep tests simple and focused on one thing
- Mock external dependencies
- Aim for high code coverage but focus on meaningful tests
- Test both happy paths and error scenarios

## Common Testing Patterns

1. **Arrange-Act-Assert (AAA)**
   ```
   // Arrange: Set up test data and conditions
   // Act: Execute the code being tested
   // Assert: Verify the results
   ```

2. **Given-When-Then (BDD)**
   ```
   Given a specific context
   When an action occurs
   Then verify the outcome
   ```

3. **Test Doubles**
   - Mocks: Verify behavior and interactions
   - Stubs: Provide canned responses
   - Fakes: Simplified working implementations
   - Spies: Record calls for verification

## Usage

When asked to write tests:
1. Analyze the code to understand its behavior
2. Identify testable units and edge cases
3. Choose appropriate test framework and tools
4. Write clear, maintainable tests
5. Ensure good coverage of functionality
6. Run tests and verify they pass
