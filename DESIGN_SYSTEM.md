# Forge Suite Design System

**Version:** 2.0.0
**Last Updated:** 2025-11-19
**Applications:** TeamForge, SpecForge, BugForge

---

## Overview

This design system defines the visual language and UI standards for the Forge Suite of developer tools. It ensures consistency across all three applications while maintaining a modern, professional, and developer-friendly aesthetic with a dark-mode-first approach.

### Design Principles

1. **Dark Mode First**: Optimized for dark interfaces with high contrast and reduced eye strain
2. **Clarity & Hierarchy**: Clear visual structure with distinct levels of information
3. **Minimalist Refinement**: Clean, focused design without unnecessary ornamentation
4. **Developer-Centric**: Interface patterns familiar to developers, optimized for productivity

---

## Color Palette

### Dark Theme Colors (Primary)

#### Slate (Grayscale Foundation)
Primary color scheme for backgrounds, surfaces, and structural elements.

```css
--slate-50:  #f8fafc  /* Lightest - rare use */
--slate-100: #f1f5f9  /* Very light accents */
--slate-200: #e2e8f0  /* Light borders */
--slate-300: #cbd5e1  /* Subtle text */
--slate-400: #94a3b8  /* Muted text */
--slate-500: #64748b  /* Secondary text */
--slate-600: #475569  /* Border accents */
--slate-700: #334155  /* Elevated surfaces */
--slate-800: #1e293b  /* Primary surfaces */
--slate-900: #0f172a  /* Deep backgrounds */
```

**Usage:**
- `900`: Deep application background
- `800`: Primary surface color (sidebar, elevated panels)
- `700`: Borders, dividers on dark backgrounds
- `600`: Hover states on dark surfaces
- `400-500`: Muted text, secondary information
- `300`: Disabled text
- `200`: Light borders on white backgrounds

#### White (High Contrast)
Used for primary text, icons, and key interactive elements on dark backgrounds.

```css
--white: #ffffff  /* Pure white for maximum contrast */
```

**Usage:**
- Primary headings and labels on dark backgrounds
- Active icons and indicators
- High-emphasis interactive elements

### Accent Colors

#### Orange (Attention & Highlights)
Warm accent color for highlights, active states, and drawing attention.

```css
--orange-400: #fb923c  /* Primary accent */
--orange-500: #f97316  /* Hover/active states */
```

**Usage:**
- Accent bars on active navigation items
- Highlight indicators
- Warning states (sparingly)

---

## Theme Implementation

### Dark Theme (Default)

```css
:root {
  /* Backgrounds */
  --background: hsl(222.2, 84%, 4.9%);      /* #0f172a - slate-900 */
  --card: hsl(217.2, 32.6%, 17.5%);         /* #1e293b - slate-800 */
  --muted: hsl(215, 25%, 27%);              /* Sidebar areas */

  /* Text */
  --foreground: hsl(0, 0%, 100%);           /* #ffffff - white */
  --muted-foreground: hsl(215.4, 16.3%, 56.9%); /* #94a3b8 - slate-400 */

  /* Borders */
  --border: hsl(215, 25%, 27%);             /* #334155 - slate-700 */

  /* Interactive (kept for compatibility) */
  --primary: hsl(199.89, 89.13%, 48.04%);  /* #0ea5e9 (rarely used in dark theme) */
  --accent: hsl(27.27, 94.92%, 60.98%);    /* #fb923c - orange-400 */

  /* Radius */
  --radius: 0.75rem;  /* 12px default */
}
```

---

## Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
             Roboto, "Helvetica Neue", Arial, sans-serif;
```
System fonts for optimal performance and native feel.

### Font Sizes

```css
/* Headings */
--text-3xl: 1.875rem  /* 30px - Page titles */
--text-2xl: 1.5rem    /* 24px - Section headers */
--text-xl: 1.25rem    /* 20px - Card titles */
--text-lg: 1.125rem   /* 18px - Subsections */

/* Body */
--text-base: 1rem     /* 16px - Body text */
--text-sm: 0.875rem   /* 14px - Small text */
--text-xs: 0.75rem    /* 12px - Captions, labels */
--text-2xs: 0.65rem   /* ~10.4px - Tiny labels (custom) */
```

### Font Weights

```css
--font-normal: 400    /* Regular body text */
--font-medium: 500    /* Emphasis, labels */
--font-semibold: 600  /* Subheadings */
--font-bold: 700      /* Headings */
```

---

## Spacing

### Scale (Tailwind Standard)
```
0.5 = 2px    (0.125rem)
1   = 4px    (0.25rem)
1.5 = 6px    (0.375rem)
2   = 8px    (0.5rem)
3   = 12px   (0.75rem)
4   = 16px   (1rem)
5   = 20px   (1.25rem)
6   = 24px   (1.5rem)
8   = 32px   (2rem)
10  = 40px   (2.5rem)
12  = 48px   (3rem)
16  = 64px   (4rem)
18  = 72px   (4.5rem)
```

### Common Patterns
- **Card padding**: `p-6` (24px)
- **Section spacing**: `mb-8` (32px)
- **Item gaps**: `gap-4` (16px) for comfortable spacing
- **Icon spacing**: `space-x-3` (12px) for icon + text

---

## Border Radius

```css
--radius: 0.75rem;  /* 12px - DEFAULT */

rounded-sm: 0.125rem   /* 2px */
rounded-md: 0.375rem   /* 6px */
rounded-lg: 0.5rem     /* 8px */
rounded-xl: 0.75rem    /* 12px - Primary choice */
rounded-2xl: 1rem      /* 16px */
rounded-full: 9999px   /* Pills, circles */
```

**Usage:**
- Buttons: `rounded-lg` or `rounded-xl`
- Cards: `rounded-xl`
- Inputs: `rounded-md`
- Badges: `rounded-full`

---

## Shadows

### Dark Theme Shadows
```css
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3)
shadow: 0 1px 3px 0 rgb(0 0 0 / 0.4)
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4)
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5)
```

**Usage:**
- Header: `shadow-lg`
- Cards: `shadow-sm` (subtle on dark backgrounds)
- Elevated panels: `shadow-md`

---

## Layout Patterns

### Header (Dark Theme)

The header establishes the application identity and provides global navigation context.

#### Structure
```tsx
<header className="border-b border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 shadow-lg">
  <div className="flex h-18 items-center px-6">
    {/* Left: Branding */}
    <div className="flex items-center space-x-3">
      {/* Icon/Logo */}
      <i className="fa-solid fa-fire text-white text-3xl"></i>

      {/* App Title */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-white">
          App Name
        </h1>
        <p className="text-[0.65rem] text-slate-400 -mt-0.5">
          Tagline or Suite Name
        </p>
      </div>
    </div>

    {/* Right: Metadata, Actions */}
    <div className="ml-auto flex items-center space-x-4">
      <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300 font-medium border border-slate-600">
        v1.0.0
      </span>
    </div>
  </div>
</header>
```

#### Specifications

**Height:** `h-18` (72px)
**Background:** Vertical gradient from `slate-800` to `slate-900`
**Border:** Bottom border `slate-700` (1px)
**Shadow:** `shadow-lg` for depth
**Padding:** Horizontal `px-6` (24px)

**Icon/Logo:**
- Size: `text-3xl` (~30px for Font Awesome icons)
- Color: `text-white`
- Spacing: `space-x-3` (12px) from title

**Title:**
- Size: `text-2xl` (24px)
- Weight: `font-bold`
- Color: `text-white`

**Tagline:**
- Size: `text-[0.65rem]` (~10.4px, custom)
- Color: `text-slate-400` (muted)
- Margin: `-mt-0.5` (negative margin to tighten spacing)

**Version Badge:**
- Background: `bg-slate-700`
- Text: `text-slate-300`
- Border: `border-slate-600`
- Padding: `px-2 py-1`
- Border radius: `rounded-full`

---

### Sidebar Navigation (Dark Theme)

Vertical navigation optimized for discoverability and state clarity.

#### Structure
```tsx
<aside className="w-64 border-r border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800">
  <nav className="p-4 space-y-1.5">
    {items.map((item) => {
      const Icon = item.icon;
      const isActive = currentStep === item.id;
      const isDisabled = !hasRequiredState;

      return (
        <button
          key={item.id}
          disabled={isDisabled}
          className={cn(
            "w-full flex items-start space-x-3 rounded-xl p-3 text-left transition-all duration-200 relative",
            isDisabled
              ? "opacity-40 cursor-not-allowed text-slate-600"
              : isActive
              ? "bg-slate-700 text-white shadow-lg border border-slate-600"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          )}
        >
          {/* Orange accent bar for active item */}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-accent rounded-r-full shadow-sm" />
          )}

          <Icon className={cn(
            "h-6 w-6 mt-0.5 flex-shrink-0 transition-transform duration-200",
            isActive && "scale-110"
          )} />

          <div className="flex-1 min-w-0">
            <div className="font-medium">{item.label}</div>
            <div className={cn(
              "text-xs mt-0.5",
              isActive ? "text-slate-300" : "text-slate-500"
            )}>
              {item.description}
            </div>
          </div>
        </button>
      );
    })}
  </nav>
</aside>
```

#### Specifications

**Width:** `w-64` (256px)
**Background:** Horizontal gradient `from-slate-900 to-slate-800`
**Border:** Right border `slate-700` (1px)
**Padding:** `p-4` (16px)
**Item Spacing:** `space-y-1.5` (6px between items)

**Navigation Items:**
- **Default State:**
  - Text: `text-slate-400`
  - Hover: `bg-slate-800`, `text-slate-200`
  - Transition: `duration-200`

- **Active State:**
  - Background: `bg-slate-700`
  - Text: `text-white`
  - Border: `border-slate-600`
  - Shadow: `shadow-lg`
  - **Orange Accent Bar:**
    - Width: `w-1` (4px)
    - Height: `h-10` (40px)
    - Color: `bg-accent` (orange-400)
    - Position: Absolute left edge, vertically centered
    - Radius: `rounded-r-full`

- **Disabled State:**
  - Opacity: `opacity-40`
  - Text: `text-slate-600`
  - Cursor: `cursor-not-allowed`

**Icons:**
- Size: `h-6 w-6` (24px)
- Active scale: `scale-110` (1.1x)
- Top margin: `mt-0.5` (2px) for optical alignment

**Text:**
- Label: `font-medium`
- Description: `text-xs`, muted colors

---

### Main Content Area

```tsx
<main className="flex-1 overflow-hidden flex flex-col relative bg-background">
  <div className="container mx-auto p-6 flex-1 flex flex-col overflow-auto">
    {/* Page content */}
  </div>
</main>
```

**Background:** `bg-background` (slate-900 in dark theme)
**Padding:** `p-6` (24px)
**Overflow:** Scrollable vertically

---

## Components

### Buttons

#### Primary Button (Light Variant for Dark BG)
```tsx
<button className="px-4 py-2 bg-slate-700 text-white rounded-lg
                   hover:bg-slate-600 transition-all duration-200
                   shadow-sm hover:shadow-md font-medium border border-slate-600">
  Action
</button>
```

#### Ghost Button (Dark Theme)
```tsx
<button className="px-4 py-2 text-slate-300 rounded-lg
                   hover:bg-slate-800 hover:text-white transition-all duration-200">
  Secondary Action
</button>
```

### Cards (Dark Theme)

```tsx
<Card className="bg-slate-800 rounded-xl shadow-sm border border-slate-700">
  <CardHeader className="border-b border-slate-700 pb-4">
    <CardTitle className="text-xl font-semibold text-white">Title</CardTitle>
    <CardDescription className="text-sm text-slate-400 mt-1">
      Description
    </CardDescription>
  </CardHeader>
  <CardContent className="pt-6 text-slate-300">
    {/* Content */}
  </CardContent>
</Card>
```

### Inputs (Dark Theme)

```tsx
<input
  className="w-full px-3 py-2 rounded-md border border-slate-700
             bg-slate-800 text-white placeholder:text-slate-500
             focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent
             transition-all duration-200"
  placeholder="Enter text..."
/>
```

### Badges (Dark Theme)

```tsx
{/* Version badge */}
<span className="px-2 py-1 rounded-full text-xs font-medium
                 bg-slate-700 text-slate-300 border border-slate-600">
  v1.0.0
</span>

{/* Status badge */}
<span className="px-2 py-1 rounded-full text-xs font-medium
                 bg-orange-400/20 text-orange-400 border border-orange-400/30">
  Active
</span>
```

---

## Transitions & Animations

### Standard Durations
```css
--duration-fast: 150ms      /* Quick feedback */
--duration-normal: 200ms    /* DEFAULT */
--duration-slow: 300ms      /* Emphasized */
```

### Common Patterns
```css
transition: all 200ms ease-in-out;
```

### Respect Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility

### Contrast Ratios (Dark Theme)
- White text on `slate-900`: 18.5:1 ✅
- `slate-400` text on `slate-900`: 7.2:1 ✅
- `slate-300` text on `slate-800`: 8.1:1 ✅

### Focus States
```css
focus:outline-none
focus:ring-2
focus:ring-slate-600
focus:ring-offset-2
focus:ring-offset-slate-900
```

### Interactive Sizes
- Minimum touch target: 44px × 44px
- Comfortable button height: 40px

---

## Icon Integration

### Font Awesome (CDN)

Add to `index.html`:
```html
<link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer" />
```

### Usage
```tsx
<i className="fa-solid fa-fire text-white text-3xl"></i>
```

**Common Sizes:**
- `text-sm`: ~14px
- `text-base`: 16px
- `text-xl`: 20px
- `text-2xl`: 24px
- `text-3xl`: 30px

---

## Implementation

### globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 40% 97%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 27.27 94.92% 60.98%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.29 31.82% 91.37%;
    --ring: 199.89 89.13% 48.04%;
    --radius: 0.75rem;
  }
}
```

---

## Version History

### v2.0.0 (2025-11-19)
- Complete redesign for dark-mode-first approach
- Slate color palette as foundation
- Simplified header with Font Awesome icon integration
- Enhanced sidebar with orange accent bars
- Removed light theme (dark theme only)
- Updated all component patterns for dark backgrounds

### v1.0.0 (2025-11-19)
- Initial design system
- Light theme focus
- Blue/orange color palette

---

## Maintenance

This design system should be:
- **Reviewed** quarterly for consistency
- **Updated** when patterns evolve
- **Referenced** by all Forge Suite developers
- **Extended** carefully to maintain coherence

For questions, open an issue in the project repository.
