---
name: java-code-review
description: Comprehensive Java code review following best practices
allowed-tools: Read, Grep, Glob
category: Code Review
tags:
  - java
  - code-review
  - quality
  - best-practices
---

# Java Code Review Skill

This skill provides comprehensive code review for Java projects.

## Review Areas

### Code Style
- **Naming**: camelCase for variables/methods, PascalCase for classes
- **Braces**: Opening brace on same line (K&R style or Allman)
- **Indentation**: 4 spaces or tabs (consistent)
- **Package Names**: All lowercase, reverse domain name
- **Constants**: ALL_CAPS_WITH_UNDERSCORES

### Object-Oriented Design
- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Design Patterns**: Proper use of patterns (Factory, Builder, Strategy, etc.)
- **Encapsulation**: Proper use of access modifiers
- **Inheritance**: Favor composition over inheritance when appropriate
- **Interfaces**: Program to interfaces, not implementations

### Best Practices
- Use `@Override` annotation
- Implement `equals()`, `hashCode()`, and `toString()` consistently
- Prefer `StringBuilder` for string concatenation in loops
- Use try-with-resources for AutoCloseable resources
- Avoid null, use Optional where appropriate
- Use enums instead of int constants
- Prefer immutable objects

### Common Issues
- Missing or improper exception handling
- Resource leaks (unclosed streams, connections)
- Thread safety issues
- Improper use of collections
- Missing `final` keyword where appropriate
- Overly complex methods
- Code duplication
- Missing JavaDoc for public APIs

### Java-Specific Concerns
- **Generics**: Proper use of type parameters, avoid raw types
- **Streams API**: Effective use of Java Streams
- **Lambdas**: Proper use of functional interfaces
- **Null Safety**: Use Optional, Objects.requireNonNull()
- **Collections**: Choose appropriate collection types
- **Concurrency**: Thread-safe code, proper use of synchronized

### Security
- Input validation and sanitization
- SQL injection prevention
- XXE (XML External Entity) attacks
- Insecure deserialization
- Proper use of cryptography APIs
- Access control and authorization

### Performance
- Avoid premature optimization
- Proper use of collections
- String operations efficiency
- Lazy initialization when beneficial
- Caching strategies

## Review Checklist

- [ ] Code follows Java naming conventions
- [ ] Proper exception handling
- [ ] No resource leaks
- [ ] Thread safety considered
- [ ] JavaDoc for public APIs
- [ ] Unit tests present
- [ ] No security vulnerabilities
- [ ] Follows SOLID principles

## Tools to Suggest

- **Static Analysis**: SonarQube, SpotBugs, PMD, Checkstyle
- **Code Coverage**: JaCoCo, Cobertura
- **Dependency Check**: OWASP Dependency-Check
- **Build Tools**: Maven, Gradle
- **Testing**: JUnit 5, Mockito, TestNG

## Usage

When reviewing Java code:
1. Check adherence to Java conventions
2. Verify OOP design principles
3. Review exception handling and resource management
4. Identify security vulnerabilities
5. Suggest performance improvements
6. Ensure proper testing
