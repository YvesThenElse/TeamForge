---
name: sql-optimization
description: Optimize SQL queries and database performance
allowed-tools: Read, Grep, Bash
category: Database
tags:
  - sql
  - database
  - optimization
  - performance
---

# SQL Optimization Skill

This skill helps you optimize SQL queries and improve database performance.

## Query Optimization

### Using EXPLAIN
- Analyze query execution plans
- Identify table scans (bad) vs index scans (good)
- Check join types and order
- Examine row estimates vs actual
- Look for expensive operations

### Indexing Strategies
- Create indexes on columns used in WHERE clauses
- Index foreign keys
- Composite indexes for multiple column searches
- Covering indexes to avoid table lookups
- Avoid over-indexing (impacts writes)
- Use partial indexes when appropriate
- Monitor index usage and remove unused indexes

### Query Patterns

**Avoid:**
- `SELECT *` (select only needed columns)
- Functions on indexed columns in WHERE (`WHERE YEAR(date)` breaks index)
- Subqueries when JOIN is more efficient
- OR conditions on different columns (can't use index)
- LIKE with leading wildcard (`LIKE '%term'`)
- Multiple OR conditions (use IN or temp table)

**Prefer:**
- Parameterized queries (security + performance)
- LIMIT/OFFSET for pagination (or cursor-based)
- EXISTS instead of IN for subqueries
- JOIN instead of correlated subqueries
- Batch operations for multiple inserts/updates
- Appropriate WHERE clauses to filter early

## Common Performance Issues

### N+1 Query Problem
```sql
-- Bad: N+1 queries
SELECT * FROM users;
-- Then for each user:
SELECT * FROM posts WHERE user_id = ?;

-- Good: Single query with JOIN
SELECT users.*, posts.*
FROM users
LEFT JOIN posts ON posts.user_id = users.id;
```

### Missing Indexes
```sql
-- Add index on frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at);
```

### Inefficient Pagination
```sql
-- Bad: OFFSET gets slower with large offsets
SELECT * FROM posts LIMIT 10 OFFSET 10000;

-- Good: Cursor-based pagination
SELECT * FROM posts WHERE id > last_seen_id ORDER BY id LIMIT 10;
```

## Database-Specific Optimizations

### PostgreSQL
- Use partial indexes
- Utilize JSONB for semi-structured data
- Leverage materialized views
- Use pg_stat_statements for query analysis
- Configure shared_buffers appropriately
- Use VACUUM and ANALYZE regularly

### MySQL
- Choose appropriate storage engine (InnoDB vs MyISAM)
- Optimize query cache settings
- Use EXPLAIN FORMAT=JSON
- Configure buffer pool size
- Optimize JOIN buffer size

### SQL Server
- Use Query Store for analysis
- Implement columnstore indexes
- Use filtered indexes
- Configure max degree of parallelism
- Monitor DMVs for performance insights

## Schema Design

### Normalization vs Denormalization
- **Normalize** to reduce redundancy (3NF)
- **Denormalize** strategically for read performance
- Use materialized views for complex aggregations
- Consider CQRS pattern for read-heavy workloads

### Data Types
- Use appropriate data types (INT vs BIGINT)
- VARCHAR vs TEXT vs CHAR
- Use ENUM for small fixed sets
- Consider UUID vs auto-increment trade-offs

### Partitioning
- Range partitioning (by date)
- List partitioning (by category)
- Hash partitioning (for even distribution)
- Benefits for large tables (archiving, query performance)

## Connection Management

- Use connection pooling
- Set appropriate pool size (not too large)
- Configure connection timeouts
- Implement retry logic with backoff
- Close connections properly
- Monitor connection usage

## Monitoring & Maintenance

### Key Metrics
- Query execution time
- Slow query log
- Index usage statistics
- Table/index bloat
- Connection pool utilization
- Cache hit rates
- Lock waits and deadlocks

### Maintenance Tasks
- Regular VACUUM (PostgreSQL)
- UPDATE STATISTICS
- Rebuild fragmented indexes
- Archive old data
- Monitor disk space
- Backup and recovery testing

## Tools

- **Query Analysis**: EXPLAIN, EXPLAIN ANALYZE, Query Planner
- **Monitoring**: pg_stat_statements, MySQL slow query log, SQL Server Profiler
- **GUIs**: pgAdmin, MySQL Workbench, DBeaver, DataGrip
- **Load Testing**: pgbench, sysbench
- **Schema Tools**: Flyway, Liquibase (migrations)

## Review Checklist

- [ ] All queries analyzed with EXPLAIN
- [ ] Appropriate indexes created
- [ ] No N+1 query problems
- [ ] Pagination implemented efficiently
- [ ] Query parameters used (not string concat)
- [ ] Connection pooling configured
- [ ] Slow query logging enabled
- [ ] Regular maintenance scheduled

## Usage

When optimizing SQL:
1. Identify slow queries (slow query log, APM tools)
2. Analyze with EXPLAIN/EXPLAIN ANALYZE
3. Add appropriate indexes
4. Rewrite inefficient queries
5. Test with production-like data
6. Monitor query performance
7. Implement regular maintenance
