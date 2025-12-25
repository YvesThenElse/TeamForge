---
name: Git Workflow Standards
description: Git branching strategy and commit message conventions
category: workflow
tags: [git, version-control, branching, commits]
---

# Git Workflow Standards

## Branch Naming

### Format
```
<type>/<ticket-id>-<short-description>
```

### Types
- `feature/` - New features
- `fix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions or fixes
- `chore/` - Maintenance tasks

### Examples
```
feature/PROJ-123-user-authentication
fix/PROJ-456-login-timeout
hotfix/critical-security-patch
refactor/extract-validation-utils
```

## Commit Messages

### Conventional Commits Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Formatting, no code change
- `refactor:` - Code restructuring
- `perf:` - Performance improvement
- `test:` - Adding/fixing tests
- `chore:` - Maintenance, dependencies

### Good Commit Messages
```
feat(auth): add password reset functionality

- Add forgot password form
- Implement email verification flow
- Add rate limiting for reset requests

Closes #123
```

```
fix(api): handle null user in profile endpoint

Previously crashed when user was deleted but session
remained active. Now returns 401 with clear message.

Fixes #456
```

### Bad Commit Messages
```
// Too vague
"Fix bug"
"Update code"
"WIP"

// Too long in subject
"Add new feature that allows users to reset their password
by clicking a button and receiving an email"
```

## Branching Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Integration branch (optional)

### Workflow
1. Create branch from `main`
2. Make changes in small, focused commits
3. Push and create Pull Request
4. Get code review approval
5. Squash and merge to `main`
6. Delete branch

### Rules
- Never commit directly to `main`
- Keep branches short-lived (< 1 week)
- Rebase on `main` before merging if stale
- Resolve conflicts in feature branch

## Pull Request Guidelines

### Size
- Aim for < 400 lines changed
- Split large changes into stacked PRs
- One logical change per PR

### Before Creating PR
```bash
# Update from main
git fetch origin
git rebase origin/main

# Run tests
npm test

# Run linter
npm run lint

# Check build
npm run build
```

### PR Checklist
- [ ] Branch is up-to-date with main
- [ ] All tests pass
- [ ] Linting passes
- [ ] Self-reviewed the diff
- [ ] Added tests for new code
- [ ] Updated documentation if needed

## Common Commands

```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feature/PROJ-123-description

# Save work in progress
git stash
git stash pop

# Interactive rebase to clean commits
git rebase -i HEAD~3

# Amend last commit
git commit --amend

# Undo last commit (keep changes)
git reset --soft HEAD~1
```
