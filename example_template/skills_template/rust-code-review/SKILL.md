---
name: rust-code-review
description: Comprehensive Rust code review following idiomatic patterns
allowed-tools: Read, Grep, Glob
category: Code Review
tags:
  - rust
  - code-review
  - safety
  - performance
---

# Rust Code Review Skill

This skill provides comprehensive code review for Rust projects.

## Review Areas

### Ownership & Borrowing
- Proper use of ownership rules
- Efficient use of references (&) and mutable references (&mut)
- Avoid unnecessary cloning
- Use move semantics appropriately
- Lifetime annotations are clear and necessary

### Error Handling
- Use `Result<T, E>` for recoverable errors
- Use `panic!` only for truly unrecoverable errors
- Leverage `?` operator for error propagation
- Proper use of `unwrap()`, `expect()`, and pattern matching
- Custom error types when appropriate
- Use `anyhow` or `thiserror` for better error handling

### Safety & Correctness
- Minimize `unsafe` code
- Document all `unsafe` blocks with safety invariants
- Avoid `unwrap()` and `expect()` in production code
- Use pattern matching exhaustively
- Handle `Option<T>` properly
- No data races or race conditions

### Idiomatic Rust
- **Naming**: snake_case for variables/functions, PascalCase for types
- Use traits for shared behavior
- Implement `Debug`, `Clone`, `PartialEq` when appropriate
- Use iterators over manual loops
- Leverage zero-cost abstractions
- Use `std::fmt::Display` for user-facing output

### Best Practices
- Prefer composition over inheritance
- Use `const` and `static` appropriately
- Leverage type system for compile-time guarantees
- Use `cargo fmt` and `cargo clippy`
- Write documentation with `///` comments
- Use `#[derive]` for common traits
- Implement `Default` when sensible

### Common Issues
- Unnecessary mutable variables
- String allocations (`to_string()` vs `to_owned()`)
- Inefficient collection usage
- Missing error handling
- Overly complex lifetime parameters
- Not using `impl Trait` when appropriate
- Ignoring Clippy warnings

### Performance
- Avoid unnecessary allocations
- Use `&str` over `String` when possible
- Leverage zero-copy operations
- Use `Cow<'a, str>` for conditional ownership
- Efficient use of collections
- Profile before optimizing

### Concurrency
- Proper use of `Send` and `Sync` traits
- Use channels for message passing
- Leverage `Arc` and `Mutex` correctly
- Avoid deadlocks
- Consider using async/await with Tokio or async-std

## Review Checklist

- [ ] Code follows Rust naming conventions
- [ ] No unnecessary `clone()` or allocations
- [ ] Error handling is comprehensive
- [ ] `unsafe` code is justified and documented
- [ ] Code passes `cargo clippy` without warnings
- [ ] Documentation is present for public APIs
- [ ] Tests cover the functionality
- [ ] Dependencies are up to date

## Tools to Recommend

- **Linting**: cargo clippy
- **Formatting**: cargo fmt (rustfmt)
- **Testing**: cargo test
- **Documentation**: cargo doc
- **Security Audit**: cargo audit
- **Coverage**: cargo tarpaulin, cargo llvm-cov
- **Benchmarking**: criterion

## Usage

When reviewing Rust code:
1. Verify ownership and borrowing patterns
2. Check error handling comprehensiveness
3. Review safety of any `unsafe` code
4. Ensure idiomatic Rust patterns
5. Identify performance bottlenecks
6. Verify concurrency safety
