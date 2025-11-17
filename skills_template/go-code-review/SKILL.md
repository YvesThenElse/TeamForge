---
name: go-code-review
description: Comprehensive Go code review following best practices
allowed-tools: Read, Grep, Glob
category: Code Review
tags:
  - golang
  - go
  - code-review
  - quality
---

# Go Code Review Skill

This skill provides comprehensive code review for Go projects.

## Review Areas

### Code Style
- **Naming**: mixedCaps (camelCase), exported names start with capital
- **Formatting**: Use `gofmt` or `goimports`
- **Package Names**: Short, lowercase, no underscores
- **Comments**: Complete sentences, start with name being described
- **Error Messages**: Lowercase, no punctuation at end

### Error Handling
- Always check errors (`if err != nil`)
- Return errors, don't panic
- Wrap errors with context (`fmt.Errorf`, `errors.Wrap`)
- Use custom error types when appropriate
- Don't ignore errors with `_`

### Concurrency
- Proper use of goroutines and channels
- Avoid goroutine leaks
- Use `sync.WaitGroup` for synchronization
- Prefer channels for communication
- Use `context.Context` for cancellation
- Avoid shared mutable state
- Use mutexes when necessary (`sync.Mutex`)

### Best Practices
- **Interface Design**: Small, focused interfaces (accept interfaces, return structs)
- **Struct Initialization**: Use struct literals or constructors
- **Defer**: Use defer for cleanup (close files, unlock mutexes)
- **Pointers**: Use pointers for large structs and when mutation is needed
- **Embedding**: Prefer composition over inheritance
- **Constants**: Use `const` for unchanging values
- **Zero Values**: Design for useful zero values

### Common Issues
- Not closing resources (files, connections, response bodies)
- Race conditions in concurrent code
- Improper error handling
- Global variables and shared state
- Not using `context.Context` for cancellation
- Inefficient string concatenation
- Missing receiver names on methods
- Exporting unnecessary symbols

### Testing
- Use table-driven tests
- Test file naming: `*_test.go`
- Use `testing.T` and `testing.B` properly
- Leverage `t.Helper()` for test helpers
- Write examples for documentation
- Use `go test -race` for race detection
- Aim for good coverage with `go test -cover`

### Performance
- Avoid premature optimization
- Use `sync.Pool` for frequent allocations
- Efficient slice operations (preallocate capacity)
- String building with `strings.Builder`
- Profile with `pprof` before optimizing
- Benchmark critical paths

### Security
- Input validation
- SQL injection prevention (use parameterized queries)
- Proper use of `crypto` packages
- Avoid hardcoded secrets
- Path traversal prevention
- Rate limiting

## Review Checklist

- [ ] Code is formatted with `gofmt`
- [ ] All errors are checked
- [ ] No goroutine leaks
- [ ] Resources are properly closed
- [ ] Code follows Go idioms
- [ ] Tests are present and pass
- [ ] No race conditions (`go test -race`)
- [ ] Documentation for exported symbols

## Tools to Recommend

- **Formatting**: gofmt, goimports
- **Linting**: golangci-lint (includes golint, staticcheck, etc.)
- **Testing**: go test, testify
- **Coverage**: go test -cover
- **Race Detection**: go test -race
- **Profiling**: pprof
- **Security**: gosec
- **Dependency Management**: go mod

## Usage

When reviewing Go code:
1. Verify formatting and style compliance
2. Check comprehensive error handling
3. Review concurrency patterns and safety
4. Ensure resources are properly managed
5. Identify performance issues
6. Check for security vulnerabilities
