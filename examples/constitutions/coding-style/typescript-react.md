---
name: TypeScript React Standards
description: Coding standards for TypeScript React projects
category: coding-style
tags: [typescript, react, frontend, standards]
target-system: claude-code
---

# TypeScript React Coding Standards

## TypeScript Conventions

### Types over Interfaces (for most cases)
```typescript
// Prefer type for unions, intersections, mapped types
type Status = 'idle' | 'loading' | 'success' | 'error';
type Props = BaseProps & ExtendedProps;

// Use interface for objects that may be extended
interface User {
  id: string;
  name: string;
}
```

### Strict Type Safety
- Enable `strict: true` in tsconfig
- Avoid `any` - use `unknown` when type is truly unknown
- Use `as const` for literal types
- Prefer type inference, but annotate function returns

### Null Handling
- Use optional chaining: `user?.profile?.avatar`
- Use nullish coalescing: `value ?? defaultValue`
- Prefer explicit checks over type assertions

## React Patterns

### Component Structure
```typescript
// 1. Imports (external, internal, types, styles)
// 2. Types/Interfaces
// 3. Constants
// 4. Component
// 5. Styles (if styled-components)

interface ComponentProps {
  title: string;
  onAction?: () => void;
}

export function Component({ title, onAction }: ComponentProps) {
  // hooks first
  const [state, setState] = useState(initialValue);

  // derived values
  const derivedValue = useMemo(() => compute(state), [state]);

  // handlers
  const handleClick = useCallback(() => {
    onAction?.();
  }, [onAction]);

  // early returns
  if (!title) return null;

  // render
  return <div onClick={handleClick}>{title}</div>;
}
```

### Hooks Best Practices
- Custom hooks for reusable logic
- Keep dependency arrays accurate
- Use `useCallback` for handlers passed to children
- Use `useMemo` for expensive computations only

### State Management
- Lift state only when necessary
- Co-locate state with usage
- Use context sparingly (performance implications)
- Consider state machines for complex flows

## File Organization

```
src/
├── components/
│   └── ComponentName/
│       ├── ComponentName.tsx
│       ├── ComponentName.test.tsx
│       └── index.ts
├── hooks/
├── utils/
├── types/
└── services/
```

## Naming Conventions

- Components: `PascalCase`
- Hooks: `useCamelCase`
- Utils: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Types/Interfaces: `PascalCase`
- Files: Match export name
