---
name: Code Review Guidelines
description: Standards for reviewing code changes and pull requests
category: workflow
tags: [review, quality, pull-request, collaboration]
---

# Code Review Guidelines

## When Reviewing Code

### What to Check

#### Correctness
- Does the code do what it's supposed to do?
- Are edge cases handled?
- Are there any off-by-one errors?
- Is error handling appropriate?

#### Design
- Is this the right approach for the problem?
- Does it follow established patterns in the codebase?
- Is it over-engineered or under-engineered?
- Are there any performance concerns?

#### Readability
- Is the code easy to understand?
- Are names descriptive and consistent?
- Is the code properly formatted?
- Are complex parts adequately commented?

#### Testing
- Are there tests for the new functionality?
- Do tests cover edge cases?
- Are tests readable and maintainable?
- Do all existing tests still pass?

#### Security
- No hardcoded secrets or credentials?
- Input validation present?
- No SQL injection or XSS vulnerabilities?
- Proper authentication/authorization?

### How to Give Feedback

#### Be Specific
```
// Bad
"This function is confusing"

// Good
"Consider renaming `process()` to `validateAndSaveUser()`
to better reflect what it does"
```

#### Explain Why
```
// Bad
"Use a Map here instead of an object"

// Good
"Consider using a Map here - we need to iterate in insertion
order and Maps guarantee that, while plain objects don't"
```

#### Suggest Alternatives
```
// Instead of just pointing out issues
"This loop is inefficient"

// Provide a solution
"This loop is O(n²). We could use a Set for lookups
to make it O(n):
`const seen = new Set(items.map(i => i.id))`"
```

#### Use Conventional Comments
- `nit:` - Minor style suggestion, non-blocking
- `suggestion:` - Take it or leave it
- `question:` - Seeking clarification
- `thought:` - Idea for consideration
- `issue:` - Must be addressed before merge

### Review Etiquette

#### As a Reviewer
- Review promptly (within 24 hours)
- Focus on the code, not the person
- Acknowledge good solutions
- Ask questions instead of making accusations
- Be willing to discuss and compromise

#### As an Author
- Keep PRs small and focused
- Provide context in the description
- Respond to all comments
- Don't take feedback personally
- Thank reviewers for their time

## PR Description Template

```markdown
## Summary
Brief description of what this PR does

## Changes
- List of specific changes made
- Why certain decisions were made

## Testing
- How was this tested?
- Test commands to run

## Screenshots (if UI changes)

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.logs or debug code
```
