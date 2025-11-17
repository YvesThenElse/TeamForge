---
name: performance-optimization
description: Identify and fix performance bottlenecks in code
allowed-tools: Read, Grep, Glob, Bash
category: Performance
tags:
  - performance
  - optimization
  - profiling
  - efficiency
---

# Performance Optimization Skill

This skill helps you identify and fix performance bottlenecks.

## Performance Analysis

### Profiling
- **CPU Profiling**: Identify hot paths and expensive operations
- **Memory Profiling**: Find memory leaks and excessive allocations
- **I/O Profiling**: Analyze disk and network operations
- **Database Profiling**: Query execution time and explain plans

### Metrics to Monitor
- Response time / latency
- Throughput (requests per second)
- Memory usage (heap, stack)
- CPU utilization
- Database query times
- Network I/O
- Cache hit rates

## Common Performance Issues

### Algorithm & Data Structure
- O(n²) loops (nested iterations)
- Linear search instead of hash lookup
- Inefficient sorting algorithms
- Wrong data structure choice
- Recursive algorithms without memoization

### Memory Management
- Memory leaks
- Excessive object creation
- Large object copying
- Inefficient garbage collection
- Cache misses

### Database Performance
- N+1 query problem
- Missing indexes
- Large result sets without pagination
- Inefficient joins
- Lack of query caching
- Connection pool exhaustion

### Network & I/O
- Synchronous blocking operations
- Too many HTTP requests
- Large payload sizes
- No compression
- Missing caching headers
- Slow DNS resolution

### Frontend Performance
- Large bundle sizes
- Render blocking resources
- No code splitting
- Missing lazy loading
- Inefficient re-renders
- Large DOM trees

## Optimization Strategies

### Caching
- Application-level caching (Redis, Memcached)
- HTTP caching (ETag, Cache-Control)
- CDN for static assets
- Query result caching
- Memoization for expensive computations

### Database Optimization
- Add appropriate indexes
- Use prepared statements
- Implement pagination
- Optimize queries (EXPLAIN ANALYZE)
- Use database-specific features (materialized views)
- Connection pooling
- Read replicas for scaling

### Code Optimization
- Use appropriate data structures
- Avoid premature optimization
- Lazy initialization
- Batch operations
- Async/parallel processing
- Stream processing for large data

### Resource Management
- Object pooling
- Lazy loading
- Resource cleanup
- Efficient memory allocation
- Minimize I/O operations

## Profiling Tools

### General
- Chrome DevTools (JavaScript)
- Visual Studio Profiler (.NET)
- JProfiler, YourKit (Java)
- py-spy, cProfile (Python)
- perf, valgrind (C/C++)
- cargo flamegraph (Rust)
- pprof (Go)

### Database
- EXPLAIN/EXPLAIN ANALYZE
- Query logs and slow query logs
- Database-specific tools (pg_stat_statements for PostgreSQL)

### Frontend
- Lighthouse
- WebPageTest
- Chrome DevTools Performance tab
- React DevTools Profiler

## Best Practices

1. **Measure First**: Profile before optimizing
2. **Set Goals**: Define performance targets
3. **Focus on Bottlenecks**: Optimize the slowest parts first
4. **Benchmark**: Measure impact of changes
5. **Real-World Testing**: Test with production-like data and load
6. **Monitor**: Continuous performance monitoring in production

## Review Checklist

- [ ] Performance targets defined
- [ ] Profiling completed
- [ ] Bottlenecks identified
- [ ] Optimization strategy planned
- [ ] Changes benchmarked
- [ ] No premature optimization
- [ ] Monitoring in place

## Usage

When optimizing performance:
1. Profile the application to identify bottlenecks
2. Measure current performance metrics
3. Prioritize optimizations by impact
4. Implement changes incrementally
5. Benchmark each change
6. Monitor production performance
