---
name: python-code-review
description: Comprehensive Python code review following PEP standards
allowed-tools: Read, Grep, Glob
category: Code Review
tags:
  - python
  - code-review
  - pep8
  - quality
---

# Python Code Review Skill

This skill provides comprehensive code review for Python projects.

## Review Areas

### Code Style (PEP 8)
- **Naming**: snake_case for functions/variables, PascalCase for classes
- **Indentation**: 4 spaces (no tabs)
- **Line Length**: Maximum 79 characters for code, 72 for comments
- **Imports**: Grouped (standard library, third-party, local), absolute imports preferred
- **Whitespace**: Follow PEP 8 guidelines

### Type Hints (PEP 484)
- Use type hints for function parameters and return values
- Leverage `typing` module (List, Dict, Optional, Union, etc.)
- Use `TypedDict` for dictionaries with known keys
- Proper use of generics and protocols

### Best Practices
- **Functions**: Keep functions small and single-purpose
- **Classes**: Follow SOLID principles
- **Error Handling**: Use specific exceptions, avoid bare `except:`
- **Context Managers**: Use `with` for resource management
- **Comprehensions**: Prefer list/dict comprehensions when readable
- **Generators**: Use generators for large datasets

### Common Issues
- Missing docstrings (PEP 257)
- Mutable default arguments
- Improper use of `is` vs `==`
- Missing `__init__.py` files
- Circular imports
- Global state and mutable globals
- Not using `if __name__ == "__main__"`
- String formatting (prefer f-strings)

### Security Concerns
- SQL injection vulnerabilities
- Command injection (subprocess)
- Unsafe deserialization (pickle)
- Path traversal vulnerabilities
- Hardcoded secrets
- Insecure random number generation

### Performance
- Unnecessary list comprehensions
- Inefficient loops
- String concatenation in loops
- Missing caching/memoization

## Review Checklist

- [ ] Code follows PEP 8 style guidelines
- [ ] Type hints are present and accurate
- [ ] Docstrings document public APIs
- [ ] Error handling is appropriate
- [ ] No security vulnerabilities
- [ ] Tests cover new functionality
- [ ] No performance red flags
- [ ] Virtual environment properly configured

## Tools to Suggest

- **Linters**: pylint, flake8, ruff
- **Type Checking**: mypy, pyright
- **Formatters**: black, autopep8
- **Testing**: pytest, unittest
- **Security**: bandit, safety

## Usage

When reviewing Python code:
1. Verify PEP 8 compliance
2. Check type hints and documentation
3. Review error handling and edge cases
4. Identify security vulnerabilities
5. Suggest performance improvements
