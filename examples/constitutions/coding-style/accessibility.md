---
name: Web Accessibility Guidelines
description: WCAG 2.1 compliant accessibility standards for web applications
category: coding-style
tags: [accessibility, a11y, wcag, inclusive-design]
---

# Web Accessibility Guidelines

## Core Principles (POUR)

### Perceivable
Information must be presentable in ways users can perceive.

### Operable
Interface components must be operable by all users.

### Understandable
Information and operation must be understandable.

### Robust
Content must be robust enough for various technologies.

## Semantic HTML

### Use Correct Elements
```html
<!-- Bad -->
<div class="button" onclick="submit()">Submit</div>
<div class="heading">Page Title</div>

<!-- Good -->
<button type="submit">Submit</button>
<h1>Page Title</h1>
```

### Heading Hierarchy
```html
<!-- Correct order, no skipping levels -->
<h1>Main Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>
  <h2>Another Section</h2>
```

### Landmarks
```html
<header role="banner">...</header>
<nav role="navigation">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

## Images & Media

### Alternative Text
```html
<!-- Informative image -->
<img src="chart.png" alt="Sales increased 25% in Q4 2024" />

<!-- Decorative image -->
<img src="decoration.png" alt="" role="presentation" />

<!-- Complex image -->
<figure>
  <img src="diagram.png" alt="System architecture diagram" />
  <figcaption>
    Detailed description of the system architecture...
  </figcaption>
</figure>
```

### Video & Audio
```html
<video controls>
  <source src="video.mp4" type="video/mp4" />
  <track kind="captions" src="captions.vtt" srclang="en" />
  <track kind="descriptions" src="descriptions.vtt" srclang="en" />
</video>
```

## Forms

### Labels
```html
<!-- Explicit label -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" />

<!-- Implicit label -->
<label>
  Email address
  <input type="email" name="email" />
</label>
```

### Error Messages
```html
<label for="email">Email address</label>
<input
  type="email"
  id="email"
  aria-describedby="email-error"
  aria-invalid="true"
/>
<span id="email-error" role="alert">
  Please enter a valid email address
</span>
```

### Required Fields
```html
<label for="name">
  Name <span aria-hidden="true">*</span>
  <span class="sr-only">(required)</span>
</label>
<input type="text" id="name" required aria-required="true" />
```

## Keyboard Navigation

### Focus Management
```css
/* Never remove focus indicator completely */
:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* Custom focus for better visibility */
:focus-visible {
  outline: 3px solid #0066cc;
  box-shadow: 0 0 0 3px white;
}
```

### Tab Order
```html
<!-- Use natural DOM order when possible -->
<!-- Only use tabindex="0" to make non-interactive elements focusable -->
<!-- Avoid tabindex > 0 -->

<div tabindex="0" role="button" onkeydown="handleKey(event)">
  Custom Button
</div>
```

### Skip Links
```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

## ARIA Usage

### When to Use ARIA
1. Only when HTML semantics are insufficient
2. Custom widgets (tabs, modals, carousels)
3. Dynamic content updates
4. Relationships not expressible in HTML

### Common Patterns
```html
<!-- Modal -->
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Confirm Action</h2>
  ...
</div>

<!-- Tabs -->
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel1">
    Tab 1
  </button>
</div>
<div role="tabpanel" id="panel1">
  Panel content
</div>

<!-- Live region for updates -->
<div aria-live="polite" aria-atomic="true">
  Cart updated: 3 items
</div>
```

## Color & Contrast

### Minimum Contrast Ratios
- Normal text: 4.5:1
- Large text (18px+ or 14px bold): 3:1
- UI components: 3:1

### Don't Rely on Color Alone
```html
<!-- Bad: only color indicates error -->
<input class="error-border" />

<!-- Good: icon + text + color -->
<input aria-invalid="true" aria-describedby="error" />
<span id="error">
  <svg aria-hidden="true">⚠️</svg>
  Invalid email format
</span>
```

## Testing Checklist

### Automated Tests
- [ ] aXe DevTools scan
- [ ] Lighthouse accessibility audit
- [ ] WAVE browser extension

### Manual Tests
- [ ] Navigate with keyboard only
- [ ] Test with screen reader (NVDA, VoiceOver)
- [ ] Check at 200% zoom
- [ ] Verify color contrast
- [ ] Test with motion reduced

### Screen Reader Announcements
- [ ] Page title announced on load
- [ ] Headings are navigable
- [ ] Links make sense out of context
- [ ] Form errors are announced
- [ ] Dynamic updates are announced
