---
name: dotnet-performance
description: Optimize .NET application performance and memory usage
allowed-tools: Read, Grep, Bash
category: Performance
tags:
  - dotnet
  - csharp
  - performance
  - optimization
---

# .NET Performance Optimization Skill

This skill helps you optimize .NET application performance.

## Profiling Tools

### Visual Studio Profiler
- CPU Usage
- Memory Usage
- Database
- .NET Object Allocation

### dotnet-trace
```bash
dotnet tool install -g dotnet-trace
dotnet trace collect --process-id <PID>
```

### dotnet-counters
```bash
dotnet tool install -g dotnet-counters
dotnet counters monitor --process-id <PID>
```

### PerfView
- CPU sampling
- Memory allocation
- GC analysis
- Event tracing

## Memory Optimization

### Reduce Allocations
```csharp
// Bad: Allocates new string
for (int i = 0; i < 1000; i++)
{
    string result = "Item " + i;
}

// Good: Reuse StringBuilder
var sb = new StringBuilder();
for (int i = 0; i < 1000; i++)
{
    sb.Clear();
    sb.Append("Item ").Append(i);
}

// Better: Use Span<T> or ArrayPool<T>
var pool = ArrayPool<char>.Shared;
var buffer = pool.Rent(256);
try
{
    // Use buffer
}
finally
{
    pool.Return(buffer);
}
```

### String Performance
```csharp
// Bad: Creates many intermediate strings
string result = "";
for (int i = 0; i < 1000; i++)
    result += i.ToString();

// Good: StringBuilder
var sb = new StringBuilder();
for (int i = 0; i < 1000; i++)
    sb.Append(i);

// Good: String interpolation (for simple cases)
var message = $"Hello, {name}!";

// Good: Span<char> for string manipulation
ReadOnlySpan<char> span = "Hello World".AsSpan();
var hello = span.Slice(0, 5);
```

### Object Pooling
```csharp
// ArrayPool
var pool = ArrayPool<byte>.Shared;
byte[] buffer = pool.Rent(1024);
try
{
    // Use buffer
}
finally
{
    pool.Return(buffer, clearArray: true);
}

// Custom Object Pool
public class ObjectPool<T> where T : class, new()
{
    private readonly ConcurrentBag<T> _objects = new();

    public T Rent()
    {
        return _objects.TryTake(out T item) ? item : new T();
    }

    public void Return(T item)
    {
        _objects.Add(item);
    }
}
```

## LINQ Performance

```csharp
// Bad: Multiple enumerations
var users = GetUsers(); // IEnumerable
var count = users.Count(); // Enumerates
var first = users.First(); // Enumerates again

// Good: Materialize once
var users = GetUsers().ToList(); // Single enumeration
var count = users.Count;
var first = users[0];

// Bad: Inefficient queries
var result = users.Where(u => u.Age > 18).ToList().Count();

// Good: Use appropriate LINQ method
var result = users.Count(u => u.Age > 18);

// Bad: Unnecessary ToList()
var result = users.Where(u => u.Age > 18).ToList().FirstOrDefault();

// Good: Chain properly
var result = users.FirstOrDefault(u => u.Age > 18);
```

## Async Performance

### ValueTask vs Task
```csharp
// Use ValueTask for frequently synchronous results
public ValueTask<int> GetCachedAsync(string key)
{
    if (_cache.TryGetValue(key, out int value))
        return new ValueTask<int>(value); // No allocation

    return new ValueTask<int>(FetchAsync(key));
}

// Avoid ValueTask for:
// - Results always asynchronous
// - Multiple awaits
// - Complex async operations
```

### Async Streams
```csharp
// Good: Use IAsyncEnumerable for streaming data
public async IAsyncEnumerable<T> GetItemsAsync(
    [EnumeratorCancellation] CancellationToken ct = default)
{
    await foreach (var item in source.WithCancellation(ct))
    {
        yield return item;
    }
}
```

### Parallel Processing
```csharp
// Parallel.ForEach for CPU-bound work
Parallel.ForEach(items, item =>
{
    ProcessItem(item);
});

// PLINQ for parallel LINQ
var results = items
    .AsParallel()
    .Where(i => i.IsValid)
    .Select(i => Process(i))
    .ToList();

// Task.WhenAll for I/O-bound work
var tasks = urls.Select(url => DownloadAsync(url));
var results = await Task.WhenAll(tasks);
```

## Collections Performance

### Choose Right Collection
```csharp
// List<T> - Ordered, indexed access
var list = new List<string>();

// HashSet<T> - Unique items, O(1) lookup
var hashSet = new HashSet<string>();

// Dictionary<K,V> - Key-value pairs, O(1) lookup
var dict = new Dictionary<int, string>();

// SortedDictionary<K,V> - Sorted, O(log n) operations
var sortedDict = new SortedDictionary<int, string>();

// ConcurrentDictionary<K,V> - Thread-safe
var concurrentDict = new ConcurrentDictionary<int, string>();
```

### Pre-allocate Capacity
```csharp
// Bad: Resizes multiple times
var list = new List<string>();
for (int i = 0; i < 10000; i++)
    list.Add(i.ToString());

// Good: Pre-allocate
var list = new List<string>(10000);
for (int i = 0; i < 10000; i++)
    list.Add(i.ToString());
```

## Entity Framework Core Performance

### Projection
```csharp
// Bad: Loads entire entity
var users = await context.Users.ToListAsync();

// Good: Project only needed columns
var users = await context.Users
    .Select(u => new { u.Id, u.Name })
    .ToListAsync();
```

### N+1 Query Problem
```csharp
// Bad: N+1 queries
var users = await context.Users.ToListAsync();
foreach (var user in users)
{
    var posts = await context.Posts
        .Where(p => p.UserId == user.Id)
        .ToListAsync(); // N queries
}

// Good: Eager loading
var users = await context.Users
    .Include(u => u.Posts)
    .ToListAsync(); // 1 query

// Good: Explicit loading
var users = await context.Users.ToListAsync();
await context.Entry(users.First())
    .Collection(u => u.Posts)
    .LoadAsync();
```

### AsNoTracking
```csharp
// Read-only queries
var users = await context.Users
    .AsNoTracking() // Faster, no change tracking
    .ToListAsync();
```

### Batch Operations
```csharp
// Good: Batch inserts
context.Users.AddRange(users);
await context.SaveChangesAsync();

// Good: Bulk operations with extensions
await context.BulkInsertAsync(users);
```

## Garbage Collection

### GC Modes
```xml
<!-- Server GC: Better throughput -->
<ServerGarbageCollection>true</ServerGarbageCollection>

<!-- Workstation GC: Lower latency -->
<ServerGarbageCollection>false</ServerGarbageCollection>

<!-- Concurrent GC -->
<ConcurrentGarbageCollection>true</ConcurrentGarbageCollection>
```

### Reduce GC Pressure
```csharp
// Use structs for small, immutable data
public readonly struct Point
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y) => (X, Y) = (x, y);
}

// Use ref returns to avoid copying
public ref readonly Point GetPoint() => ref _point;

// Use in parameters to avoid copying
public void Process(in Point point) { }
```

## Benchmarking

### BenchmarkDotNet
```csharp
[MemoryDiagnoser]
[RankColumn]
public class StringBenchmarks
{
    [Benchmark]
    public string StringConcat()
    {
        string s = "";
        for (int i = 0; i < 100; i++)
            s += i;
        return s;
    }

    [Benchmark]
    public string StringBuilder()
    {
        var sb = new StringBuilder();
        for (int i = 0; i < 100; i++)
            sb.Append(i);
        return sb.ToString();
    }
}
```

## Caching

### Memory Cache
```csharp
private readonly IMemoryCache _cache;

public async Task<User> GetUserAsync(int id)
{
    return await _cache.GetOrCreateAsync($"user:{id}", async entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
        return await _repository.GetByIdAsync(id);
    });
}
```

### Distributed Cache
```csharp
private readonly IDistributedCache _cache;

public async Task<User> GetUserAsync(int id)
{
    var key = $"user:{id}";
    var cached = await _cache.GetStringAsync(key);

    if (cached != null)
        return JsonSerializer.Deserialize<User>(cached);

    var user = await _repository.GetByIdAsync(id);
    await _cache.SetStringAsync(key,
        JsonSerializer.Serialize(user),
        new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
        });

    return user;
}
```

## HTTP Client Performance

```csharp
// Bad: Creates new HttpClient each time
using var client = new HttpClient();
var response = await client.GetAsync(url);

// Good: Reuse HttpClient (singleton or IHttpClientFactory)
services.AddHttpClient<IApiClient, ApiClient>();

// Good: Use IHttpClientFactory
private readonly IHttpClientFactory _clientFactory;

public async Task<string> GetDataAsync()
{
    var client = _clientFactory.CreateClient();
    return await client.GetStringAsync(url);
}
```

## Monitoring

### Application Insights
```csharp
services.AddApplicationInsightsTelemetry();
```

### Custom Metrics
```csharp
private readonly ILogger<MyService> _logger;

using (logger.BeginScope("Processing {ItemId}", itemId))
{
    var sw = Stopwatch.StartNew();
    try
    {
        await ProcessAsync(itemId);
        logger.LogInformation("Processed in {ElapsedMs}ms", sw.ElapsedMilliseconds);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to process");
        throw;
    }
}
```

## Checklist

- [ ] Profiled application to identify bottlenecks
- [ ] Minimized allocations in hot paths
- [ ] Used appropriate collection types
- [ ] Implemented caching where beneficial
- [ ] Optimized database queries (EF Core)
- [ ] Used async/await correctly
- [ ] Configured GC appropriately
- [ ] Benchmarked critical operations
- [ ] Monitoring in place

## Usage

When optimizing .NET performance:
1. Profile to identify actual bottlenecks
2. Measure before and after changes
3. Focus on hot paths
4. Reduce allocations
5. Use appropriate data structures
6. Implement caching strategically
7. Monitor in production
