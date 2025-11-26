---
name: code-analysis
description: Analyze existing codebases and identify improvement opportunities
allowed-tools: Read, Grep, Glob
category: Code Review
tags:
  - analysis
  - code-quality
  - static-analysis
  - metrics
---

# Code Analysis Skill

This skill helps you analyze existing codebases to identify issues and improvement opportunities.

## Code Metrics Analysis

### Complexity Metrics

**Cyclomatic Complexity**
- Measures number of independent paths through code
- **Good**: 1-10
- **Moderate**: 11-20
- **High**: 21-50
- **Very High**: >50

```javascript
// Bad: High complexity (CC = 8)
function processOrder(order) {
    if (order.status === 'pending') {
        if (order.amount > 1000) {
            if (order.customer.vip) {
                // Process VIP large order
            } else {
                // Process regular large order
            }
        } else {
            if (order.customer.vip) {
                // Process VIP small order
            } else {
                // Process regular small order
            }
        }
    } else if (order.status === 'cancelled') {
        // Handle cancellation
    }
}

// Good: Reduced complexity (CC = 3 per function)
function processOrder(order) {
    if (order.status === 'cancelled') {
        return handleCancellation(order);
    }

    const strategy = getProcessingStrategy(order);
    return strategy.process(order);
}
```

**Lines of Code (LOC)**
- Total lines
- Source lines (excluding comments/blanks)
- Comment lines

**Function/Method Metrics**
- Number of parameters (should be ≤ 4)
- Lines per function (should be < 50)
- Nesting depth (should be ≤ 3)

### Maintainability Index
- Calculated from complexity, LOC, and comments
- **0-9**: Difficult to maintain (red)
- **10-19**: Moderate (yellow)
- **20-100**: Good (green)

## Code Smells Detection

### Bloaters

**Long Method**
```java
// Bad: Method too long (>30 lines)
public void processCustomerOrder() {
    // 100+ lines of code
}

// Good: Extract methods
public void processCustomerOrder() {
    validateOrder();
    calculateTotals();
    applyDiscounts();
    processPayment();
    sendConfirmation();
}
```

**Large Class**
```python
# Bad: God class with too many responsibilities
class UserManager:
    def create_user(self): pass
    def send_email(self): pass
    def log_activity(self): pass
    def generate_report(self): pass
    def process_payment(self): pass
    # ... 50 more methods

# Good: Separate concerns
class UserService: pass
class EmailService: pass
class ActivityLogger: pass
class ReportGenerator: pass
class PaymentProcessor: pass
```

**Long Parameter List**
```typescript
// Bad: Too many parameters
function createUser(
    name: string,
    email: string,
    phone: string,
    address: string,
    city: string,
    zipCode: string,
    country: string
) { }

// Good: Use object parameter
interface UserData {
    name: string;
    email: string;
    phone: string;
    address: Address;
}

function createUser(userData: UserData) { }
```

### Object-Orientation Abusers

**Switch Statements**
```csharp
// Bad: Type switch (should use polymorphism)
decimal CalculatePrice(Product product)
{
    switch (product.Type)
    {
        case ProductType.Book:
            return product.Price * 0.9m; // 10% discount
        case ProductType.Electronics:
            return product.Price * 0.95m; // 5% discount
        case ProductType.Clothing:
            return product.Price * 0.85m; // 15% discount
        default:
            return product.Price;
    }
}

// Good: Use polymorphism
interface IProduct
{
    decimal CalculateFinalPrice();
}

class Book : IProduct
{
    public decimal CalculateFinalPrice() => Price * 0.9m;
}
```

**Temporary Field**
```java
// Bad: Fields only used in some methods
class Order {
    private double subtotal; // Only used in calculateTotal()
    private double tax; // Only used in calculateTotal()
    private double shipping; // Only used in calculateTotal()

    public double calculateTotal() {
        subtotal = calculateSubtotal();
        tax = calculateTax(subtotal);
        shipping = calculateShipping();
        return subtotal + tax + shipping;
    }
}

// Good: Use local variables or separate class
class Order {
    public OrderTotal calculateTotal() {
        double subtotal = calculateSubtotal();
        double tax = calculateTax(subtotal);
        double shipping = calculateShipping();
        return new OrderTotal(subtotal, tax, shipping);
    }
}
```

### Change Preventers

**Divergent Change**
- One class is changed for multiple reasons
- Violates Single Responsibility Principle

**Shotgun Surgery**
- One change requires modifications in many classes
- Indicates poor cohesion

### Dispensables

**Comments**
```javascript
// Bad: Unnecessary comments
// Get the user
const user = getUser(); // Call getUser function

// Returns user name
return user.name; // Return the name property

// Good: Self-documenting code
const currentUser = authenticateAndFetchUser();
return currentUser.displayName;

// Good: Meaningful comments for complex logic
// Apply exponential backoff: 2^attempt * baseDelay
// e.g., 1st retry: 2s, 2nd: 4s, 3rd: 8s
const delay = Math.pow(2, attemptNumber) * baseDelay;
```

**Dead Code**
```python
# Bad: Unused code
def old_calculate_price(item):  # Never called
    return item.price * 0.9

def calculate_price(item):  # Currently used
    return item.price * item.discount_rate
```

**Duplicate Code**
```go
// Bad: Duplicated logic
func ProcessOnlineOrder(order Order) {
    ValidateOrder(order)
    CalculateTotals(order)
    ApplyDiscounts(order)
    ProcessPayment(order)
    SendConfirmation(order)
}

func ProcessStoreOrder(order Order) {
    ValidateOrder(order)
    CalculateTotals(order)
    ApplyDiscounts(order)
    ProcessPayment(order)
    SendConfirmation(order) // Same logic!
}

// Good: Extract common logic
func ProcessOrder(order Order) {
    ValidateOrder(order)
    CalculateTotals(order)
    ApplyDiscounts(order)
    ProcessPayment(order)
    SendConfirmation(order)
}
```

## Dependency Analysis

### Circular Dependencies
```
Module A -> Module B
Module B -> Module C
Module C -> Module A  // ❌ Circular!
```

**Detection:**
```bash
# Python
pip install pydeps
pydeps mypackage --show-cycles

# JavaScript
npm install -g madge
madge --circular src/

# Java
# Use jdeps or SonarQube
```

### Coupling Metrics

**Afferent Coupling (Ca)**
- Number of classes that depend on this class
- High Ca = many dependencies on this class

**Efferent Coupling (Ce)**
- Number of classes this class depends on
- High Ce = this class depends on many others

**Instability (I = Ce / (Ce + Ca))**
- 0 = Maximally stable
- 1 = Maximally unstable

## Static Analysis Tools

### Multi-Language
- **SonarQube**: Comprehensive code quality platform
- **CodeClimate**: Automated code review
- **Codacy**: Automated code review

### Language-Specific

**JavaScript/TypeScript**
```bash
# ESLint
npx eslint src/

# TypeScript Compiler
tsc --noEmit

# Complexity analysis
npm install -g complexity-report
cr src/**/*.js
```

**Python**
```bash
# Pylint
pylint mypackage/

# Flake8
flake8 mypackage/

# mypy (type checking)
mypy mypackage/

# Radon (complexity)
radon cc mypackage/ -a
radon mi mypackage/ -s
```

**Java**
```bash
# SpotBugs
spotbugs -textui target/classes

# PMD
pmd -d src -R rulesets/java/quickstart.xml

# Checkstyle
checkstyle -c google_checks.xml src/
```

**C#**
```bash
# Roslyn Analyzers (built into .NET SDK)
dotnet build /p:TreatWarningsAsErrors=true

# SonarAnalyzer
dotnet sonarscanner begin /k:"project-key"
dotnet build
dotnet sonarscanner end
```

## Code Coverage Analysis

### Coverage Types

**Line Coverage**
- Percentage of lines executed during tests

**Branch Coverage**
- Percentage of decision branches taken

**Function Coverage**
- Percentage of functions called

**Statement Coverage**
- Percentage of statements executed

### Coverage Tools

```bash
# JavaScript (Jest)
jest --coverage

# Python (pytest + coverage)
pytest --cov=mypackage --cov-report=html

# Java (JaCoCo)
mvn test jacoco:report

# C# (Coverlet)
dotnet test /p:CollectCoverage=true
```

### Interpreting Results

- **<50%**: Poor, insufficient testing
- **50-70%**: Fair, basic testing
- **70-85%**: Good, adequate testing
- **85-95%**: Very good, comprehensive testing
- **>95%**: Excellent (diminishing returns)

## Technical Debt Analysis

### Debt Categories

**Code Debt**
- Duplicated code
- Complex code
- Poor naming
- Missing tests

**Design Debt**
- Architectural inconsistencies
- Poor separation of concerns
- Tight coupling

**Documentation Debt**
- Missing or outdated docs
- Uncommented complex code
- No API documentation

**Test Debt**
- Low test coverage
- Flaky tests
- Slow tests

### Quantifying Debt

**SQALE Method**
- Estimate time to fix each issue
- Categorize by severity
- Calculate total remediation time

```
Technical Debt Ratio = (Remediation Cost / Development Cost) × 100

≤5%: Excellent
5-10%: Good
10-20%: Moderate
>20%: High debt
```

## Analysis Report Template

```markdown
# Code Analysis Report

**Project:** MyApp
**Date:** 2024-01-15
**Analyzer:** John Doe

## Executive Summary

- **Overall Health:** Good
- **Lines of Code:** 15,234
- **Test Coverage:** 78%
- **Technical Debt Ratio:** 12%

## Key Findings

### Critical Issues (3)
1. **Security**: SQL Injection vulnerability in UserService.java:142
2. **Bug**: Null pointer exception in OrderController.cs:87
3. **Performance**: N+1 query problem in ProductRepository.py:45

### High Priority (12)
- 8 code smells
- 4 complexity issues

### Medium Priority (47)
- 23 code duplications
- 24 minor code smells

## Metrics

### Complexity
- Average Cyclomatic Complexity: 3.2
- Files with CC > 10: 5
- Maximum Complexity: 24 (in LegacyService.java)

### Test Coverage
- Line Coverage: 78%
- Branch Coverage: 72%
- Uncovered Critical Paths: 3

### Code Quality
- Maintainability Index: 72 (Good)
- Code Duplication: 8.5%
- Comment Density: 15%

## Recommendations

1. **Immediate Actions:**
   - Fix security vulnerability in UserService
   - Add null checks in OrderController
   - Optimize database queries in ProductRepository

2. **Short-term (1-2 sprints):**
   - Refactor LegacyService to reduce complexity
   - Increase test coverage to >85%
   - Remove duplicate code

3. **Long-term:**
   - Implement architectural improvements
   - Establish coding standards
   - Set up continuous code quality monitoring

## Detailed Analysis

[Attach detailed reports from tools]
```

## Checklist

- [ ] Run static analysis tools
- [ ] Check code metrics (complexity, LOC)
- [ ] Analyze test coverage
- [ ] Identify code smells
- [ ] Check for security vulnerabilities
- [ ] Analyze dependencies and coupling
- [ ] Calculate technical debt
- [ ] Generate comprehensive report
- [ ] Prioritize issues by severity
- [ ] Create remediation plan

## Usage

When analyzing code:
1. Run automated analysis tools
2. Review metrics and identify trends
3. Identify critical issues first
4. Categorize findings by severity
5. Quantify technical debt
6. Create actionable remediation plan
7. Monitor progress over time
