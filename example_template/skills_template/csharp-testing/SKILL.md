---
name: csharp-testing
description: Comprehensive C# testing with xUnit, NUnit, and MSTest
allowed-tools: Read, Write, Edit, Bash
category: Quality Assurance
tags:
  - csharp
  - dotnet
  - testing
  - xunit
  - nunit
---

# C# Testing Skill

This skill provides comprehensive testing guidance for C# and .NET applications.

## Testing Frameworks

### xUnit (Recommended)
```csharp
using Xunit;
using FluentAssertions;

public class CalculatorTests
{
    [Fact]
    public void Add_TwoNumbers_ReturnsSum()
    {
        // Arrange
        var calculator = new Calculator();

        // Act
        var result = calculator.Add(5, 3);

        // Assert
        result.Should().Be(8);
    }

    [Theory]
    [InlineData(1, 2, 3)]
    [InlineData(0, 0, 0)]
    [InlineData(-1, 1, 0)]
    public void Add_VariousInputs_ReturnsCorrectSum(int a, int b, int expected)
    {
        var calculator = new Calculator();
        var result = calculator.Add(a, b);
        result.Should().Be(expected);
    }
}
```

### NUnit
```csharp
using NUnit.Framework;

[TestFixture]
public class UserServiceTests
{
    private UserService _userService;

    [SetUp]
    public void Setup()
    {
        _userService = new UserService();
    }

    [Test]
    public void GetUser_ValidId_ReturnsUser()
    {
        var user = _userService.GetUser(1);
        Assert.That(user, Is.Not.Null);
        Assert.That(user.Id, Is.EqualTo(1));
    }

    [TestCase(1)]
    [TestCase(2)]
    [TestCase(3)]
    public void GetUser_MultipleIds_ReturnsCorrectUser(int id)
    {
        var user = _userService.GetUser(id);
        Assert.That(user.Id, Is.EqualTo(id));
    }
}
```

### MSTest
```csharp
using Microsoft.VisualStudio.TestTools.UnitTesting;

[TestClass]
public class OrderServiceTests
{
    private OrderService _orderService;

    [TestInitialize]
    public void Initialize()
    {
        _orderService = new OrderService();
    }

    [TestMethod]
    public void CreateOrder_ValidInput_ReturnsOrder()
    {
        var order = _orderService.CreateOrder("Product", 2);
        Assert.IsNotNull(order);
        Assert.AreEqual("Product", order.ProductName);
    }
}
```

## Mocking with Moq

### Basic Mocking
```csharp
using Moq;

[Fact]
public void GetUserById_CallsRepository()
{
    // Arrange
    var mockRepo = new Mock<IUserRepository>();
    mockRepo.Setup(x => x.GetById(1))
            .Returns(new User { Id = 1, Name = "John" });

    var service = new UserService(mockRepo.Object);

    // Act
    var user = service.GetUserById(1);

    // Assert
    user.Should().NotBeNull();
    user.Name.Should().Be("John");
    mockRepo.Verify(x => x.GetById(1), Times.Once);
}
```

### Advanced Mocking
```csharp
[Fact]
public void SaveUser_ValidUser_CallsRepositorySave()
{
    var mockRepo = new Mock<IUserRepository>();
    var service = new UserService(mockRepo.Object);

    var user = new User { Name = "Jane" };
    service.SaveUser(user);

    mockRepo.Verify(x => x.Save(It.Is<User>(u => u.Name == "Jane")),
                    Times.Once);
}
```

## Async Testing

```csharp
[Fact]
public async Task GetUserAsync_ValidId_ReturnsUser()
{
    var mockRepo = new Mock<IUserRepository>();
    mockRepo.Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync(new User { Id = 1, Name = "John" });

    var service = new UserService(mockRepo.Object);
    var user = await service.GetUserByIdAsync(1);

    user.Should().NotBeNull();
}
```

## Integration Testing

### WebApplicationFactory (ASP.NET Core)
```csharp
public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetUsers_ReturnsSuccessStatusCode()
    {
        var response = await _client.GetAsync("/api/users");
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var users = JsonSerializer.Deserialize<List<User>>(content);

        users.Should().NotBeEmpty();
    }
}
```

### Database Integration Tests
```csharp
public class DatabaseTests : IDisposable
{
    private readonly DbContext _context;

    public DatabaseTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _context.Database.EnsureCreated();
    }

    [Fact]
    public void AddUser_SavesToDatabase()
    {
        var user = new User { Name = "Test User" };
        _context.Users.Add(user);
        _context.SaveChanges();

        var savedUser = _context.Users.FirstOrDefault(u => u.Name == "Test User");
        savedUser.Should().NotBeNull();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
```

## Test Data Builders

```csharp
public class UserBuilder
{
    private string _name = "Default Name";
    private string _email = "default@example.com";
    private int _age = 25;

    public UserBuilder WithName(string name)
    {
        _name = name;
        return this;
    }

    public UserBuilder WithEmail(string email)
    {
        _email = email;
        return this;
    }

    public UserBuilder WithAge(int age)
    {
        _age = age;
        return this;
    }

    public User Build()
    {
        return new User
        {
            Name = _name,
            Email = _email,
            Age = _age
        };
    }
}

// Usage
[Fact]
public void CreateUser_ValidData_Success()
{
    var user = new UserBuilder()
        .WithName("John Doe")
        .WithEmail("john@example.com")
        .Build();

    user.Name.Should().Be("John Doe");
}
```

## Assertion Libraries

### FluentAssertions
```csharp
// Collections
users.Should().HaveCount(3);
users.Should().Contain(u => u.Name == "John");
users.Should().BeInAscendingOrder(u => u.Age);

// Exceptions
Action act = () => service.GetUser(-1);
act.Should().Throw<ArgumentException>()
   .WithMessage("Invalid user ID");

// Objects
user.Should().BeEquivalentTo(expectedUser, options =>
    options.Excluding(u => u.Id));
```

### Shouldly
```csharp
result.ShouldBe(expected);
collection.ShouldContain(item);
action.ShouldThrow<Exception>();
```

## Code Coverage

### Using Coverlet
```bash
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

### ReportGenerator
```bash
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator -reports:coverage.opencover.xml -targetdir:coveragereport
```

## Best Practices

### Test Naming
```csharp
// Pattern: MethodName_Scenario_ExpectedBehavior
[Fact]
public void Divide_ByZero_ThrowsDivideByZeroException()
{
    // Test implementation
}
```

### Test Organization
- One assert per test (generally)
- Use AAA pattern (Arrange-Act-Assert)
- Keep tests independent
- Use descriptive names
- Test one thing at a time

### Dependency Injection
```csharp
public class ServiceTests
{
    private readonly Mock<IDependency> _mockDependency;
    private readonly Service _sut; // System Under Test

    public ServiceTests()
    {
        _mockDependency = new Mock<IDependency>();
        _sut = new Service(_mockDependency.Object);
    }
}
```

## Performance Testing

### BenchmarkDotNet
```csharp
using BenchmarkDotNet.Attributes;

[MemoryDiagnoser]
public class PerformanceBenchmarks
{
    [Benchmark]
    public void StringConcatenation()
    {
        string result = "";
        for (int i = 0; i < 1000; i++)
            result += i.ToString();
    }

    [Benchmark]
    public void StringBuilder()
    {
        var sb = new StringBuilder();
        for (int i = 0; i < 1000; i++)
            sb.Append(i);
    }
}
```

## Tools & Extensions

- **xUnit / NUnit / MSTest**: Testing frameworks
- **Moq / NSubstitute**: Mocking frameworks
- **FluentAssertions / Shouldly**: Assertion libraries
- **Bogus / AutoFixture**: Test data generation
- **Coverlet**: Code coverage
- **Stryker.NET**: Mutation testing
- **BenchmarkDotNet**: Performance benchmarking

## Checklist

- [ ] Tests follow AAA pattern
- [ ] Test names are descriptive
- [ ] Mocks are used for dependencies
- [ ] Async methods tested properly
- [ ] Code coverage > 80%
- [ ] Integration tests for critical paths
- [ ] Tests run in CI/CD pipeline
- [ ] No flaky tests

## Usage

When testing C# code:
1. Choose appropriate testing framework
2. Use mocks for dependencies
3. Write clear, descriptive tests
4. Aim for high code coverage
5. Include integration tests
6. Run tests in CI/CD
