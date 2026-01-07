# Theme Configuration Guide

## Overview

CertiTrust uses a comprehensive theming system built with Tailwind CSS v4 and CSS custom properties (variables). The theme supports both light and dark modes with a professional, trust-focused color palette.

## Color System

### Primary Colors
- **Primary**: `#0066cc` - Main brand color (blue)
- **Primary Light**: `#e6f0ff` - Light variant for backgrounds
- **Primary Dark**: `#004499` - Dark variant for hover states

### Neutral Colors
- **Background**: `#ffffff` (light) / `#1a1a1a` (dark)
- **Surface**: `#f8fafc` (light) / `#2d2d2d` (dark)
- **Border**: `#e2e8f0` (light) / `#404040` (dark)
- **Text**: `#1e293b` (light) / `#f5f5f5` (dark)
- **Text Secondary**: `#64748b` (light) / `#a0a0a0` (dark)

### Accent Colors
- **Success**: `#10b981` - For positive actions
- **Error**: `#ef4444` - For destructive actions
- **Warning**: `#f59e0b` - For warnings

## CSS Variables

All colors are defined as CSS custom properties in `app/globals.css`:

\`\`\`css
:root {
  --primary: oklch(0.205 0 0);
  --background: oklch(1 0 0);
  --border: oklch(0.922 0 0);
  /* ... more variables */
}

.dark {
  --primary: oklch(0.985 0 0);
  --background: oklch(0.145 0 0);
  /* ... dark mode overrides */
}
\`\`\`

## Component Classes

### Buttons
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.btn-ghost` - Ghost button (no background)
- `.btn-sm` - Small button
- `.btn-lg` - Large button

### Cards
- `.card-solid` - Solid card with border
- `.card-glass` - Glassmorphism card
- `.card-hover` - Card with hover effect

### Badges
- `.badge-primary` - Primary badge
- `.badge-success` - Success badge
- `.badge-error` - Error badge
- `.badge-warning` - Warning badge

### Inputs
- `.input-base` - Base input styling
- `.input-error` - Input with error state

## Responsive Design

The theme uses Tailwind's responsive prefixes:
- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up
- `xl:` - 1280px and up
- `2xl:` - 1536px and up

## Dark Mode

Dark mode is automatically enabled based on system preferences or user selection. To toggle:

\`\`\`tsx
import { ThemeToggle } from "@/components/theme-toggle"

export default function Header() {
  return <ThemeToggle />
}
\`\`\`

## Customization

To customize the theme:

1. Edit CSS variables in `app/globals.css`
2. Update component classes in the `@layer components` section
3. Modify Tailwind config in `@theme inline` block

## Typography

- **Headings**: Inter font, bold weight
- **Body**: Inter font, regular weight
- **Monospace**: Fira Code for code blocks

## Animations

Available animations:
- `.animate-fade-in` - Fade in effect
- `.animate-slide-in-up` - Slide up effect
- `.animate-slide-in-down` - Slide down effect

## Accessibility

- All interactive elements have focus states
- Color contrast meets WCAG AA standards
- Semantic HTML is used throughout
- ARIA labels are provided where needed
