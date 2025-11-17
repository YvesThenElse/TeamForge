---
name: requirements-specification
description: Write clear and comprehensive software requirements and specifications
allowed-tools: Read, Write, Edit
category: Documentation
tags:
  - requirements
  - specifications
  - user-stories
  - documentation
---

# Requirements Specification Skill

This skill helps you write clear software requirements and specifications.

## User Stories

### Standard Format
```markdown
As a [type of user],
I want [goal/desire],
So that [benefit/value].

**Acceptance Criteria:**
- Given [context]
- When [action]
- Then [outcome]
```

### Examples

```markdown
## US-001: User Registration

As a new user,
I want to create an account,
So that I can access personalized features.

**Acceptance Criteria:**

Given I am on the registration page
When I enter valid email, password, and name
Then my account is created and I receive a confirmation email

Given I am on the registration page
When I enter an already registered email
Then I see an error message "Email already exists"

Given I am on the registration page
When I enter a password shorter than 8 characters
Then I see an error message "Password must be at least 8 characters"

**Technical Notes:**
- Use bcrypt for password hashing
- Send confirmation email via SendGrid
- Store user in PostgreSQL database

**Dependencies:**
- Email service must be configured

**Estimation:** 5 story points
```

## Functional Requirements

### Format
```markdown
# Functional Requirements

## FR-001: User Authentication

**Priority:** High
**Status:** Approved

### Description
The system shall provide secure user authentication using email and password.

### Requirements

1. **FR-001.1**: The system shall accept email and password for login
2. **FR-001.2**: The system shall validate credentials against stored records
3. **FR-001.3**: The system shall return an authentication token upon successful login
4. **FR-001.4**: The system shall lock account after 5 failed login attempts
5. **FR-001.5**: The system shall support password reset via email

### Acceptance Criteria

- User can log in with valid credentials
- Invalid credentials show appropriate error
- Account locks after 5 failed attempts
- Locked accounts can be unlocked via email
- Authentication tokens expire after 24 hours

### Test Cases

**TC-001.1**: Valid Login
- Input: Valid email and password
- Expected: Success, token returned
- Priority: High

**TC-001.2**: Invalid Password
- Input: Valid email, wrong password
- Expected: Error "Invalid credentials"
- Priority: High

**TC-001.3**: Account Lockout
- Input: 5 consecutive failed attempts
- Expected: Account locked, email sent
- Priority: Medium
```

## Non-Functional Requirements

```markdown
# Non-Functional Requirements

## Performance Requirements

**NFR-001**: API Response Time
- The system shall respond to 95% of API requests within 200ms
- The system shall respond to 99% of API requests within 500ms
- Under normal load (100 concurrent users)

**NFR-002**: Throughput
- The system shall handle at least 1000 requests per second
- Database queries shall complete within 50ms on average

## Security Requirements

**NFR-003**: Authentication
- All API endpoints shall require authentication except login/register
- Passwords shall be hashed using bcrypt with cost factor 12
- Authentication tokens shall expire after 24 hours

**NFR-004**: Data Encryption
- All data in transit shall be encrypted using TLS 1.3
- Sensitive data at rest shall be encrypted using AES-256

## Reliability Requirements

**NFR-005**: Availability
- The system shall maintain 99.9% uptime (excluding planned maintenance)
- Planned maintenance windows shall not exceed 4 hours per month

**NFR-006**: Data Backup
- Database backups shall occur daily at 2:00 AM UTC
- Backups shall be retained for 30 days
- Point-in-time recovery shall be available for last 7 days

## Scalability Requirements

**NFR-007**: User Capacity
- The system shall support up to 100,000 concurrent users
- The system shall support up to 1 million total users

**NFR-008**: Data Volume
- The system shall handle up to 10TB of data
- Database shall maintain performance with up to 100 million records
```

## Use Cases

```markdown
# Use Case: Process Payment

**ID:** UC-003
**Actor:** Customer
**Preconditions:**
- Customer is logged in
- Items are in shopping cart
- Payment method is configured

**Main Flow:**

1. Customer navigates to checkout
2. System displays order summary
3. Customer selects payment method
4. System validates payment information
5. Customer confirms payment
6. System processes payment with payment gateway
7. System creates order record
8. System sends confirmation email
9. System displays success message

**Alternative Flows:**

**3a. Payment method not configured:**
- 3a.1: System prompts to add payment method
- 3a.2: Customer adds payment method
- 3a.3: Resume at step 3

**6a. Payment fails:**
- 6a.1: System receives failure from payment gateway
- 6a.2: System displays error message
- 6a.3: Customer can retry or choose different method
- 6a.4: Resume at step 4

**Postconditions:**
- Order is created in database
- Payment is processed
- Inventory is updated
- Customer receives confirmation

**Business Rules:**
- BR-001: Minimum order amount is $10
- BR-002: Maximum 3 payment retry attempts
- BR-003: Order must be fulfilled within 2 business days
```

## API Specifications

```markdown
# API Specification: User Service

## POST /api/users

Creates a new user account.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+1234567890" // optional
}
```

**Validation Rules:**
- `email`: Required, valid email format, max 255 chars
- `password`: Required, min 8 chars, must contain uppercase, lowercase, number
- `name`: Required, 2-100 chars
- `phone`: Optional, valid phone format

### Response

**Success (201 Created):**
```json
{
  "id": 123,
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error (400 Bad Request):**
```json
{
  "error": "ValidationError",
  "message": "Invalid request data",
  "details": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

**Error (500 Internal Server Error):**
```json
{
  "error": "InternalServerError",
  "message": "An unexpected error occurred"
}
```

### Rate Limiting

- 10 requests per minute per IP
- Returns 429 Too Many Requests when exceeded
```

## Data Models

```markdown
# Data Model: User

## Entity Relationship

```
User
├── id (PK)
├── email (unique)
├── password_hash
├── name
├── created_at
└── updated_at

UserProfile (1:1)
├── user_id (FK)
├── phone
├── avatar_url
└── bio

UserRole (Many-to-Many)
├── user_id (FK)
└── role_id (FK)
```

## User Table Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| name | VARCHAR(100) | NOT NULL | User's full name |
| is_active | BOOLEAN | DEFAULT true | Account status |
| created_at | TIMESTAMP | NOT NULL | Account creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes:**
- PRIMARY KEY on id
- UNIQUE INDEX on email
- INDEX on created_at

**Business Rules:**
- Email must be validated before storage
- Password must be hashed with bcrypt (cost 12)
- Soft delete: Set is_active = false instead of deleting
```

## Requirements Traceability Matrix

```markdown
| Req ID | Description | Priority | Status | Test Cases | Implementation |
|--------|-------------|----------|--------|------------|----------------|
| FR-001 | User Authentication | High | Done | TC-001.1-001.3 | /api/auth |
| FR-002 | Password Reset | Medium | In Progress | TC-002.1-002.2 | /api/password |
| NFR-001 | API Response Time | High | Done | PT-001 | - |
| NFR-003 | Authentication Security | Critical | Done | ST-001-003 | /middleware/auth |
```

## Best Practices

### Requirements Quality

**SMART Criteria:**
- **Specific**: Clearly defined, unambiguous
- **Measurable**: Can be tested/verified
- **Achievable**: Technically feasible
- **Relevant**: Adds business value
- **Time-bound**: Has clear deadline

### Writing Guidelines

1. **Be Specific**: Avoid vague terms like "fast", "user-friendly"
2. **Be Testable**: Each requirement should be verifiable
3. **Use Consistent Language**: "shall" for must-have, "should" for nice-to-have
4. **Number Requirements**: For easy reference
5. **Prioritize**: High/Medium/Low or MoSCoW
6. **Version Control**: Track changes over time

### Common Pitfalls

❌ **Avoid:**
- "The system should be fast"
- "The UI should be intuitive"
- "The system should handle errors"

✅ **Instead:**
- "The system shall respond within 200ms for 95% of requests"
- "The UI shall follow Material Design guidelines"
- "The system shall display user-friendly error messages for all validation failures"

## Templates

### User Story Template
```markdown
## [US-XXX]: [Title]

As a [role],
I want [feature],
So that [benefit].

**Acceptance Criteria:**
- [ ] Criteria 1
- [ ] Criteria 2

**Technical Notes:**
- Note 1

**Estimation:** X points
**Priority:** High/Medium/Low
```

### Requirement Template
```markdown
## [FR/NFR-XXX]: [Title]

**Priority:** High/Medium/Low
**Status:** Draft/Approved/Implemented

### Description
[Clear description]

### Requirements
1. [REQ-XXX.1]: [Specific requirement]

### Acceptance Criteria
- [ ] Criterion 1

### Dependencies
- [REQ-YYY]
```

## Checklist

- [ ] Requirements are specific and measurable
- [ ] Acceptance criteria defined
- [ ] Prioritized (MoSCoW or High/Medium/Low)
- [ ] Technical constraints documented
- [ ] Dependencies identified
- [ ] Test cases outlined
- [ ] Reviewed by stakeholders
- [ ] Versioned and tracked

## Usage

When writing requirements:
1. Understand the business need
2. Engage with stakeholders
3. Write clear, testable requirements
4. Define acceptance criteria
5. Identify dependencies and constraints
6. Review and refine
7. Maintain traceability to implementation
