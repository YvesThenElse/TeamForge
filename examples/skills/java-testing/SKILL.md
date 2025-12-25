---
name: java-testing
description: Comprehensive Java testing with JUnit 5, Mockito, and Spring Test
allowed-tools: Read, Write, Edit, Bash
category: Quality Assurance
tags:
  - java
  - testing
  - junit
  - mockito
  - spring
---

# Java Testing Skill

This skill provides comprehensive testing guidance for Java applications.

## JUnit 5 (Jupiter)

### Basic Tests
```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    private Calculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new Calculator();
    }

    @Test
    @DisplayName("Adding two numbers should return their sum")
    void testAdd() {
        assertEquals(5, calculator.add(2, 3));
    }

    @Test
    void testDivideByZero() {
        assertThrows(ArithmeticException.class, () -> {
            calculator.divide(10, 0);
        });
    }
}
```

### Parameterized Tests
```java
@ParameterizedTest
@ValueSource(ints = {1, 3, 5, 7, 9})
void testOddNumbers(int number) {
    assertTrue(number % 2 != 0);
}

@ParameterizedTest
@CsvSource({
    "1, 2, 3",
    "10, 20, 30",
    "100, 200, 300"
})
void testAddition(int a, int b, int expected) {
    assertEquals(expected, calculator.add(a, b));
}

@ParameterizedTest
@MethodSource("provideStringsForIsBlank")
void testIsBlank(String input, boolean expected) {
    assertEquals(expected, StringUtils.isBlank(input));
}

static Stream<Arguments> provideStringsForIsBlank() {
    return Stream.of(
        Arguments.of(null, true),
        Arguments.of("", true),
        Arguments.of("  ", true),
        Arguments.of("not blank", false)
    );
}
```

### Nested Tests
```java
@DisplayName("User Service Tests")
class UserServiceTest {

    @Nested
    @DisplayName("When user is new")
    class WhenNew {

        @Test
        @DisplayName("Should create user successfully")
        void shouldCreate() {
            // Test implementation
        }

        @Test
        @DisplayName("Should validate email")
        void shouldValidateEmail() {
            // Test implementation
        }
    }

    @Nested
    @DisplayName("When user exists")
    class WhenExists {

        @Test
        @DisplayName("Should update user")
        void shouldUpdate() {
            // Test implementation
        }
    }
}
```

## Mockito

### Basic Mocking
```java
import org.mockito.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetUserById() {
        // Arrange
        User mockUser = new User(1L, "John Doe");
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        // Act
        User result = userService.getUserById(1L);

        // Assert
        assertEquals("John Doe", result.getName());
        verify(userRepository).findById(1L);
    }
}
```

### Advanced Mocking
```java
@Test
void testSaveUser() {
    User user = new User();
    user.setName("John");

    when(userRepository.save(any(User.class)))
        .thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

    User saved = userService.save(user);

    assertNotNull(saved.getId());
    verify(userRepository).save(argThat(u -> u.getName().equals("John")));
}

@Test
void testExceptionHandling() {
    when(userRepository.findById(999L))
        .thenThrow(new EntityNotFoundException("User not found"));

    assertThrows(EntityNotFoundException.class, () -> {
        userService.getUserById(999L);
    });
}
```

### Spies and Partial Mocks
```java
@Test
void testPartialMocking() {
    List<String> list = new ArrayList<>();
    List<String> spy = Mockito.spy(list);

    spy.add("one");
    spy.add("two");

    verify(spy).add("one");
    assertEquals(2, spy.size());

    doReturn(100).when(spy).size();
    assertEquals(100, spy.size());
}
```

## AssertJ (Fluent Assertions)

```java
import static org.assertj.core.api.Assertions.*;

@Test
void testWithAssertJ() {
    String name = "John Doe";

    assertThat(name)
        .isNotNull()
        .startsWith("John")
        .endsWith("Doe")
        .contains(" ");

    List<String> names = Arrays.asList("John", "Jane", "Bob");

    assertThat(names)
        .hasSize(3)
        .contains("John", "Jane")
        .doesNotContain("Alice");

    assertThat(names)
        .filteredOn(name -> name.startsWith("J"))
        .hasSize(2);
}

@Test
void testObjectAssertion() {
    User user = new User(1L, "John", "john@example.com");

    assertThat(user)
        .extracting("name", "email")
        .containsExactly("John", "john@example.com");
}
```

## Spring Boot Testing

### Integration Tests
```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void testGetAllUsers() throws Exception {
        userRepository.save(new User("John"));
        userRepository.save(new User("Jane"));

        mockMvc.perform(get("/api/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].name", is("John")));
    }

    @Test
    void testCreateUser() throws Exception {
        String userJson = "{\"name\":\"John\",\"email\":\"john@example.com\"}";

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(userJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name", is("John")));
    }
}
```

### Repository Tests
```java
@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void testFindByEmail() {
        User user = new User("John", "john@example.com");
        entityManager.persist(user);
        entityManager.flush();

        Optional<User> found = userRepository.findByEmail("john@example.com");

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("John");
    }
}
```

### MockBean for Services
```java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    void testGetUser() throws Exception {
        User user = new User(1L, "John");
        when(userService.getUserById(1L)).thenReturn(user);

        mockMvc.perform(get("/api/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name", is("John")));
    }
}
```

## Test Containers

```java
@SpringBootTest
@Testcontainers
class DatabaseIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Test
    void testDatabaseOperations() {
        // Test with real PostgreSQL database
    }
}
```

## Performance Testing

### JMH (Java Microbenchmark Harness)
```java
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@State(Scope.Benchmark)
public class StringConcatenationBenchmark {

    @Benchmark
    public String stringConcatenation() {
        String result = "";
        for (int i = 0; i < 100; i++) {
            result += i;
        }
        return result;
    }

    @Benchmark
    public String stringBuilder() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 100; i++) {
            sb.append(i);
        }
        return sb.toString();
    }
}
```

## Test Data Builders

```java
public class UserBuilder {
    private String name = "Default Name";
    private String email = "default@example.com";
    private int age = 25;

    public UserBuilder withName(String name) {
        this.name = name;
        return this;
    }

    public UserBuilder withEmail(String email) {
        this.email = email;
        return this;
    }

    public UserBuilder withAge(int age) {
        this.age = age;
        return this;
    }

    public User build() {
        return new User(name, email, age);
    }
}

// Usage
@Test
void testUserCreation() {
    User user = new UserBuilder()
        .withName("John Doe")
        .withEmail("john@example.com")
        .build();

    assertEquals("John Doe", user.getName());
}
```

## Code Coverage

### JaCoCo
```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

```bash
mvn test jacoco:report
```

## Best Practices

### Test Naming
```java
// Pattern: methodName_scenario_expectedBehavior
@Test
void getUserById_validId_returnsUser() { }

@Test
void getUserById_invalidId_throwsException() { }
```

### Test Organization
- **AAA Pattern**: Arrange, Act, Assert
- **One assertion per test** (generally)
- **Independent tests**: No test order dependency
- **Fast tests**: Unit tests should run in milliseconds
- **Use @BeforeEach and @AfterEach** for setup/teardown

### Test Doubles
```java
// Use @Mock for dependencies
@Mock
private UserRepository repository;

// Use @InjectMocks for class under test
@InjectMocks
private UserService service;

// Use @Spy for partial mocking
@Spy
private List<String> spyList = new ArrayList<>();

// Use @Captor for argument capturing
@Captor
private ArgumentCaptor<User> userCaptor;
```

## Tools & Libraries

- **JUnit 5**: Testing framework
- **Mockito**: Mocking framework
- **AssertJ**: Fluent assertions
- **Spring Boot Test**: Spring testing utilities
- **TestContainers**: Integration testing with Docker
- **WireMock**: HTTP mocking
- **RestAssured**: REST API testing
- **Awaitility**: Async testing
- **JMH**: Microbenchmarking

## Checklist

- [ ] Tests follow AAA pattern
- [ ] Descriptive test names
- [ ] Good code coverage (>80%)
- [ ] Integration tests for critical paths
- [ ] Mocks used appropriately
- [ ] Tests run fast
- [ ] No flaky tests
- [ ] Tests in CI/CD pipeline

## Usage

When testing Java code:
1. Choose appropriate testing framework (JUnit 5)
2. Use mocks for dependencies (Mockito)
3. Write clear, maintainable tests
4. Include integration tests
5. Measure code coverage
6. Run tests in CI/CD
