---
name: code-refactoring
description: Refactor code to improve quality, maintainability, and performance
allowed-tools: Read, Write, Edit, Grep, Glob
category: Code Review
tags:
  - refactoring
  - clean-code
  - improvement
  - maintenance
---

# Code Refactoring Skill

This skill helps you refactor code to improve its quality and maintainability.

## Refactoring Principles

### When to Refactor

✅ **Do Refactor:**
- Before adding new features
- When fixing bugs (Boy Scout Rule)
- During code review
- When code is hard to understand
- When tests are hard to write

❌ **Don't Refactor:**
- Close to deadlines (without discussion)
- Code that will be deleted soon
- Without tests (add tests first!)
- Everything at once (incremental is better)

### Safe Refactoring

1. **Have Tests**: Ensure existing tests pass
2. **Small Steps**: One refactoring at a time
3. **Run Tests**: After each change
4. **Commit Often**: Small, atomic commits
5. **Review Changes**: Before merging

## Common Refactorings

### Extract Method

**Before:**
```python
def print_invoice(orders):
    print("***********************")
    print("***** Invoice *****")
    print("***********************")

    total = 0
    for order in orders:
        print(f"{order.name}: ${order.price}")
        total += order.price

    print(f"Total: ${total}")
```

**After:**
```python
def print_invoice(orders):
    print_header()
    total = print_orders(orders)
    print_total(total)

def print_header():
    print("***********************")
    print("***** Invoice *****")
    print("***********************")

def print_orders(orders):
    total = 0
    for order in orders:
        print(f"{order.name}: ${order.price}")
        total += order.price
    return total

def print_total(total):
    print(f"Total: ${total}")
```

### Inline Method

**Before:**
```java
class OrderService {
    public double calculateTotal(Order order) {
        return getOrderTotal(order);
    }

    private double getOrderTotal(Order order) {
        return order.getPrice() * order.getQuantity();
    }
}
```

**After:**
```java
class OrderService {
    public double calculateTotal(Order order) {
        return order.getPrice() * order.getQuantity();
    }
}
```

### Extract Variable

**Before:**
```javascript
function calculatePrice(order) {
    return order.quantity * order.price *
           (1 - Math.max(0, order.quantity - 500) * 0.05) *
           (1 + order.tax);
}
```

**After:**
```javascript
function calculatePrice(order) {
    const basePrice = order.quantity * order.price;
    const quantityDiscount = Math.max(0, order.quantity - 500) * 0.05;
    const discountedPrice = basePrice * (1 - quantityDiscount);
    const finalPrice = discountedPrice * (1 + order.tax);
    return finalPrice;
}
```

### Rename Variable/Method

**Before:**
```csharp
public void ProcessData(List<int> arr, int x)
{
    int temp = 0;
    for (int i = 0; i < arr.Count; i++)
    {
        if (arr[i] > x)
            temp++;
    }
    Console.WriteLine(temp);
}
```

**After:**
```csharp
public void CountNumbersAboveThreshold(List<int> numbers, int threshold)
{
    int count = 0;
    foreach (int number in numbers)
    {
        if (number > threshold)
            count++;
    }
    Console.WriteLine(count);
}
```

### Replace Conditional with Polymorphism

**Before:**
```typescript
class Bird {
    type: string;

    getSpeed(): number {
        switch (this.type) {
            case 'European':
                return this.getBaseSpeed();
            case 'African':
                return this.getBaseSpeed() - this.getLoadFactor();
            case 'NorwegianBlue':
                return (this.isNailed) ? 0 : this.getBaseSpeed();
        }
    }
}
```

**After:**
```typescript
abstract class Bird {
    abstract getSpeed(): number;
}

class EuropeanBird extends Bird {
    getSpeed(): number {
        return this.getBaseSpeed();
    }
}

class AfricanBird extends Bird {
    getSpeed(): number {
        return this.getBaseSpeed() - this.getLoadFactor();
    }
}

class NorwegianBlueBird extends Bird {
    getSpeed(): number {
        return this.isNailed ? 0 : this.getBaseSpeed();
    }
}
```

### Introduce Parameter Object

**Before:**
```go
func CreateUser(
    name string,
    email string,
    phone string,
    address string,
    city string,
    zipCode string
) User {
    // Implementation
}
```

**After:**
```go
type UserDetails struct {
    Name    string
    Email   string
    Phone   string
    Address Address
}

type Address struct {
    Street  string
    City    string
    ZipCode string
}

func CreateUser(details UserDetails) User {
    // Implementation
}
```

### Replace Magic Numbers with Constants

**Before:**
```rust
fn calculate_price(quantity: i32) -> f64 {
    let base_price = quantity as f64 * 29.99;
    if quantity > 100 {
        base_price * 0.9
    } else {
        base_price
    }
}
```

**After:**
```rust
const UNIT_PRICE: f64 = 29.99;
const BULK_QUANTITY_THRESHOLD: i32 = 100;
const BULK_DISCOUNT_RATE: f64 = 0.1;

fn calculate_price(quantity: i32) -> f64 {
    let base_price = quantity as f64 * UNIT_PRICE;
    if quantity > BULK_QUANTITY_THRESHOLD {
        base_price * (1.0 - BULK_DISCOUNT_RATE)
    } else {
        base_price
    }
}
```

## Architectural Refactorings

### Extract Class

**Before:**
```java
class Person {
    private String name;
    private String officeAreaCode;
    private String officeNumber;

    public String getTelephoneNumber() {
        return "(" + officeAreaCode + ") " + officeNumber;
    }
}
```

**After:**
```java
class Person {
    private String name;
    private TelephoneNumber officeTelephone;

    public String getTelephoneNumber() {
        return officeTelephone.toString();
    }
}

class TelephoneNumber {
    private String areaCode;
    private String number;

    public String toString() {
        return "(" + areaCode + ") " + number;
    }
}
```

### Move Method

Move method to the class where it's used most.

**Before:**
```python
class Account:
    def __init__(self, account_type):
        self.account_type = account_type

    def overdraft_charge(self):
        if self.account_type.is_premium():
            return 10
        else:
            return 20

class AccountType:
    def is_premium(self):
        return self._premium
```

**After:**
```python
class Account:
    def __init__(self, account_type):
        self.account_type = account_type

    def overdraft_charge(self):
        return self.account_type.overdraft_charge()

class AccountType:
    def is_premium(self):
        return self._premium

    def overdraft_charge(self):
        return 10 if self.is_premium() else 20
```

### Replace Inheritance with Delegation

**Before:**
```csharp
class Stack<T> : List<T>
{
    public void Push(T item)
    {
        Add(item);
    }

    public T Pop()
    {
        T item = this[Count - 1];
        RemoveAt(Count - 1);
        return item;
    }
}
```

**After:**
```csharp
class Stack<T>
{
    private List<T> _items = new List<T>();

    public void Push(T item)
    {
        _items.Add(item);
    }

    public T Pop()
    {
        T item = _items[_items.Count - 1];
        _items.RemoveAt(_items.Count - 1);
        return item;
    }
}
```

## Performance Refactorings

### Lazy Initialization

**Before:**
```javascript
class ExpensiveObject {
    constructor() {
        this.data = this.loadLargeData(); // Always loaded
    }
}
```

**After:**
```javascript
class ExpensiveObject {
    constructor() {
        this._data = null;
    }

    get data() {
        if (this._data === null) {
            this._data = this.loadLargeData();
        }
        return this._data;
    }
}
```

### Caching

**Before:**
```python
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)
```

**After:**
```python
from functools import lru_cache

@lru_cache(maxsize=None)
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)
```

### Database Query Optimization

**Before:**
```java
// N+1 Query Problem
List<User> users = userRepository.findAll();
for (User user : users) {
    List<Post> posts = postRepository.findByUserId(user.getId());
    user.setPosts(posts);
}
```

**After:**
```java
// Use eager loading or join
List<User> users = userRepository.findAllWithPosts();
```

## Refactoring to Patterns

### Strategy Pattern

**Before:**
```typescript
class PriceCalculator {
    calculatePrice(type: string, basePrice: number): number {
        if (type === 'regular') {
            return basePrice;
        } else if (type === 'premium') {
            return basePrice * 0.9;
        } else if (type === 'vip') {
            return basePrice * 0.8;
        }
    }
}
```

**After:**
```typescript
interface PricingStrategy {
    calculate(basePrice: number): number;
}

class RegularPricing implements PricingStrategy {
    calculate(basePrice: number): number {
        return basePrice;
    }
}

class PremiumPricing implements PricingStrategy {
    calculate(basePrice: number): number {
        return basePrice * 0.9;
    }
}

class VIPPricing implements PricingStrategy {
    calculate(basePrice: number): number {
        return basePrice * 0.8;
    }
}

class PriceCalculator {
    constructor(private strategy: PricingStrategy) {}

    calculatePrice(basePrice: number): number {
        return this.strategy.calculate(basePrice);
    }
}
```

### Factory Pattern

**Before:**
```java
public User createUser(String type) {
    if (type.equals("admin")) {
        return new AdminUser();
    } else if (type.equals("regular")) {
        return new RegularUser();
    } else if (type.equals("guest")) {
        return new GuestUser();
    }
}
```

**After:**
```java
public interface UserFactory {
    User createUser();
}

public class AdminUserFactory implements UserFactory {
    public User createUser() {
        return new AdminUser();
    }
}

public class RegularUserFactory implements UserFactory {
    public User createUser() {
        return new RegularUser();
    }
}
```

## Refactoring Workflow

### 1. Identify Code Smell
```
Long methods
Duplicated code
Large classes
Long parameter lists
```

### 2. Choose Refactoring
```
Extract Method
Extract Class
Rename Variable
Introduce Parameter Object
```

### 3. Ensure Tests Pass
```bash
npm test
pytest
mvn test
dotnet test
```

### 4. Apply Refactoring
- Make small, incremental changes
- One refactoring at a time

### 5. Run Tests Again
- Verify no regression
- All tests still pass

### 6. Commit
```bash
git add .
git commit -m "refactor: extract method for clarity"
```

### 7. Review & Iterate
- Code review
- Get feedback
- Continue refactoring

## Tools

### IDE Refactoring Tools
- **Visual Studio**: Built-in refactoring
- **IntelliJ IDEA**: Powerful refactoring tools
- **VS Code**: Refactoring extensions
- **Eclipse**: Refactoring menu

### Automated Refactoring
- **Resharper**: C# refactoring
- **Rope**: Python refactoring
- **jscodeshift**: JavaScript codemods

## Checklist

- [ ] Tests exist and pass before refactoring
- [ ] Change one thing at a time
- [ ] Run tests after each change
- [ ] Commit frequently
- [ ] Code is more readable after refactoring
- [ ] No new bugs introduced
- [ ] Performance is same or better
- [ ] Reviewed by team member

## Usage

When refactoring code:
1. Understand the existing code
2. Ensure tests exist and pass
3. Identify code smells
4. Choose appropriate refactoring
5. Apply changes incrementally
6. Test after each change
7. Commit small, atomic changes
8. Review and get feedback
