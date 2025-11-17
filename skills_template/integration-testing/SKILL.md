---
name: integration-testing
description: Test interactions between components and systems
allowed-tools: Read, Write, Edit, Bash
category: Quality Assurance
tags:
  - testing
  - integration
  - e2e
  - quality
---

# Integration Testing Skill

This skill helps you write integration tests to verify that components work together correctly.

## Capabilities

- **Component Integration**: Test interactions between multiple components
- **API Testing**: Test REST APIs, GraphQL, and other service endpoints
- **Database Integration**: Test database operations and queries
- **External Services**: Test integrations with third-party services
- **E2E Scenarios**: Test complete user workflows
- **Test Environments**: Set up and manage test environments
- **Test Data**: Manage test data and fixtures

## Testing Tools & Frameworks

- **API Testing**: Supertest, Postman, Rest Assured
- **E2E Testing**: Playwright, Cypress, Selenium
- **Database**: Testcontainers, in-memory databases
- **Service Virtualization**: WireMock, MockServer
- **Contract Testing**: Pact, Spring Cloud Contract

## Best Practices

- Use test containers or isolated test databases
- Clean up test data after each test
- Test real integrations when possible
- Use service virtualization for unreliable external services
- Implement proper test isolation
- Use meaningful test data
- Test failure scenarios and error handling
- Keep integration tests independent

## Common Test Scenarios

1. **API Integration**
   - Request/response validation
   - Error handling
   - Authentication/authorization
   - Rate limiting

2. **Database Integration**
   - CRUD operations
   - Transactions
   - Constraints and validations
   - Query performance

3. **Message Queue Integration**
   - Message publishing
   - Message consumption
   - Error handling and retries

## Usage

When writing integration tests:
1. Identify integration points
2. Set up test environment and dependencies
3. Prepare test data and fixtures
4. Write tests for successful and failure paths
5. Ensure proper cleanup
6. Verify end-to-end functionality
