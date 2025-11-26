---
name: csharp-code-review
description: Comprehensive C# code review following .NET best practices
allowed-tools: Read, Grep, Glob
category: Code Review
tags:
  - csharp
  - dotnet
  - code-review
  - best-practices
---

# C# Code Review Skill

This skill provides comprehensive code review for C# and .NET projects.

## Code Style & Conventions

### Naming Conventions
```csharp
// PascalCase for types and methods
public class UserService { }
public void GetUser() { }

// camelCase for local variables and parameters
var userId = 1;
public void UpdateUser(int userId) { }

// PascalCase for properties
public string UserName { get; set; }

// PascalCase for constants
public const int MaxRetries = 3;

// _camelCase for private fields (common convention)
private readonly ILogger _logger;

// Interfaces start with I
public interface IUserRepository { }

// Async methods end with Async
public async Task<User> GetUserAsync(int id) { }
```

### Modern C# Features

#### Nullable Reference Types (C# 8+)
```csharp
#nullable enable

public class User
{
    public string Name { get; set; } = string.Empty; // Non-nullable
    public string? MiddleName { get; set; } // Nullable

    public void UpdateName(string name) // Non-null parameter
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
    }
}
```

#### Pattern Matching
```csharp
// Switch expressions (C# 8+)
public decimal GetDiscount(Customer customer) => customer.Type switch
{
    CustomerType.Premium => 0.20m,
    CustomerType.Gold => 0.15m,
    CustomerType.Silver => 0.10m,
    _ => 0.0m
};

// Property patterns
if (user is { Age: >= 18, IsVerified: true })
{
    // Adult verified user
}
```

#### Records (C# 9+)
```csharp
// Immutable data transfer objects
public record UserDto(int Id, string Name, string Email);

// With expressions for modifications
var updatedUser = originalUser with { Name = "New Name" };
```

#### Init-only Properties (C# 9+)
```csharp
public class User
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
}

var user = new User { Id = 1, Name = "John" };
// user.Id = 2; // Compiler error - can't modify after initialization
```

## SOLID Principles

### Single Responsibility
```csharp
// Bad: Multiple responsibilities
public class UserService
{
    public void SaveUser(User user) { }
    public void SendEmail(string email) { }
    public void LogActivity(string message) { }
}

// Good: Separated concerns
public class UserRepository
{
    public void Save(User user) { }
}

public class EmailService
{
    public void Send(string email) { }
}

public class ActivityLogger
{
    public void Log(string message) { }
}
```

### Dependency Inversion
```csharp
// Good: Depend on abstractions
public interface IUserRepository
{
    Task<User> GetByIdAsync(int id);
}

public class UserService
{
    private readonly IUserRepository _repository;

    public UserService(IUserRepository repository)
    {
        _repository = repository;
    }
}
```

## Async/Await Best Practices

### Proper Async Usage
```csharp
// Good: Async all the way
public async Task<User> GetUserAsync(int id)
{
    var user = await _repository.GetByIdAsync(id);
    return user;
}

// Bad: Blocking on async code
public User GetUser(int id)
{
    return _repository.GetByIdAsync(id).Result; // Deadlock risk!
}

// Good: ConfigureAwait(false) in libraries
public async Task<User> GetUserAsync(int id)
{
    var user = await _repository.GetByIdAsync(id).ConfigureAwait(false);
    return user;
}
```

### Cancellation Tokens
```csharp
public async Task<User> GetUserAsync(int id, CancellationToken ct = default)
{
    var user = await _repository.GetByIdAsync(id, ct);
    return user;
}
```

## Exception Handling

### Proper Exception Handling
```csharp
// Good: Specific exceptions
public User GetUser(int id)
{
    if (id <= 0)
        throw new ArgumentException("ID must be positive", nameof(id));

    var user = _repository.GetById(id);
    if (user == null)
        throw new UserNotFoundException(id);

    return user;
}

// Good: Custom exceptions
public class UserNotFoundException : Exception
{
    public int UserId { get; }

    public UserNotFoundException(int userId)
        : base($"User with ID {userId} not found")
    {
        UserId = userId;
    }
}

// Bad: Catching all exceptions without rethrowing
try
{
    // code
}
catch (Exception)
{
    // Swallowing exceptions
}

// Good: Specific catch or rethrow
try
{
    // code
}
catch (SqlException ex)
{
    _logger.LogError(ex, "Database error");
    throw; // Rethrow to preserve stack trace
}
```

## LINQ Best Practices

```csharp
// Good: Deferred execution awareness
var query = users.Where(u => u.Age > 18); // Not executed yet
var result = query.ToList(); // Executes now

// Good: Use appropriate LINQ methods
var firstUser = users.FirstOrDefault(); // Returns null if empty
var singleUser = users.Single(); // Throws if multiple or none

// Avoid multiple enumeration
var activeUsers = users.Where(u => u.IsActive).ToList();
var count = activeUsers.Count; // Don't call Count on IEnumerable twice
```

## Memory Management

### IDisposable
```csharp
// Good: Using statement
using var connection = new SqlConnection(connectionString);
// Automatically disposed

// Good: Async dispose
await using var stream = new FileStream("file.txt", FileMode.Open);

// Good: Implement IDisposable properly
public class ResourceHolder : IDisposable
{
    private bool _disposed;

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;

        if (disposing)
        {
            // Dispose managed resources
        }

        // Dispose unmanaged resources
        _disposed = true;
    }
}
```

### Span<T> and Memory<T>
```csharp
// Good: Use Span for performance-critical code
public void ProcessData(ReadOnlySpan<byte> data)
{
    // No allocations
}

// Avoid allocations with stackalloc
Span<int> numbers = stackalloc int[100];
```

## Common Issues

### String Operations
```csharp
// Bad: String concatenation in loops
string result = "";
for (int i = 0; i < 1000; i++)
    result += i.ToString();

// Good: Use StringBuilder
var sb = new StringBuilder();
for (int i = 0; i < 1000; i++)
    sb.Append(i);
var result = sb.ToString();

// Good: String interpolation
var message = $"Hello, {name}!";
```

### Collections
```csharp
// Good: Use appropriate collection type
var list = new List<string>(); // Dynamic size
var hashSet = new HashSet<string>(); // Unique items, O(1) lookup
var dict = new Dictionary<int, string>(); // Key-value pairs

// Good: Initialize capacity when known
var list = new List<string>(1000);
```

### Null Checking
```csharp
// Modern: Null coalescing
var name = user?.Name ?? "Unknown";

// Modern: Null conditional assignment
user?.UpdateLastLogin();

// Modern: Throw expression
var user = GetUser() ?? throw new UserNotFoundException();
```

## Security

### SQL Injection Prevention
```csharp
// Bad: String concatenation
var sql = $"SELECT * FROM Users WHERE Id = {userId}";

// Good: Parameterized queries
var sql = "SELECT * FROM Users WHERE Id = @userId";
command.Parameters.AddWithValue("@userId", userId);

// Better: Use ORM (Entity Framework)
var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
```

### Secrets Management
```csharp
// Bad: Hardcoded secrets
var apiKey = "sk-1234567890abcdef";

// Good: Configuration/Environment variables
var apiKey = configuration["ApiKey"];
// or
var apiKey = Environment.GetEnvironmentVariable("API_KEY");
```

## Performance

### Avoid Boxing
```csharp
// Bad: Boxing value types
int number = 42;
object obj = number; // Boxing

// Good: Use generics
public void Process<T>(T value) { }
```

### ValueTask vs Task
```csharp
// Good: ValueTask for hot paths that often complete synchronously
public ValueTask<int> GetCachedValueAsync(string key)
{
    if (_cache.TryGetValue(key, out var value))
        return new ValueTask<int>(value); // No allocation

    return new ValueTask<int>(FetchFromDatabaseAsync(key));
}
```

## Tools & Analyzers

- **Roslyn Analyzers**: Built-in code analysis
- **StyleCop**: Code style enforcement
- **SonarAnalyzer**: Code quality and security
- **Roslynator**: Refactorings and analyzers
- **FxCop**: Framework design guidelines
- **Security Code Scan**: Security vulnerability detection

## Checklist

- [ ] Follows .NET naming conventions
- [ ] Uses modern C# features appropriately
- [ ] Async methods properly implemented
- [ ] Exceptions handled correctly
- [ ] No SQL injection vulnerabilities
- [ ] IDisposable implemented correctly
- [ ] SOLID principles followed
- [ ] No performance red flags
- [ ] Nullable reference types enabled
- [ ] Code analyzers warnings addressed

## Usage

When reviewing C# code:
1. Check naming conventions and code style
2. Verify proper use of modern C# features
3. Review async/await patterns
4. Ensure SOLID principles are followed
5. Check for security vulnerabilities
6. Identify performance issues
7. Verify proper resource disposal
