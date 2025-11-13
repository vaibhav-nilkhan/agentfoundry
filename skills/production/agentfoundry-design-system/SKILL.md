---
name: agentfoundry-design-system
description: Professional design system for AI agent UIs. Use when building interfaces, landing pages, dashboards, or any frontend artifact. Avoids generic "AI startup" aesthetics (Inter fonts, purple gradients, excessive glow effects) in favor of clean, professional developer tool styling inspired by Claude.ai, Linear, and Vercel.
---

# AgentFoundry Design System

This skill applies professional, non-generic design patterns to frontend artifacts. Use this when creating UIs to avoid common "AI slop" aesthetics.

## Core Design Principles

### ❌ Avoid "AI Slop"
- **Never use**: Inter, Roboto, or default system fonts
- **Never use**: Purple gradients, neon colors, excessive glow effects
- **Never use**: Centered layouts exclusively, uniform rounded corners everywhere
- **Never use**: Flashy animations, gradient orbs, cyberpunk aesthetics

### ✅ Professional Dev Tool Aesthetic
- Clean neutral color palettes
- Subtle, purposeful animations
- Glass morphism for depth
- Substance over style

## Color Palette

### Dark Mode (Primary)
```css
--background: hsl(0 0% 6%)        /* #0f0f0f - Soft dark gray, not pure black */
--foreground: hsl(0 0% 98%)       /* #fafafa - Off-white text */
--card: hsl(0 0% 9%)              /* #171717 - Slightly lighter for depth */
--border: hsl(0 0% 14%)           /* #242424 - Subtle borders */
--muted: hsl(0 0% 64%)            /* #a3a3a3 - Secondary text */
--accent: hsl(0 0% 14%)           /* #242424 - Accent backgrounds */
```

**Why these colors?**
- `6%` lightness for background (not 0%) prevents eye strain
- Layered grays (6% → 9% → 14%) create depth without colors
- Pure neutral (0 saturation) looks more premium than tinted grays

### Light Mode (Optional)
```css
--background: hsl(0 0% 100%)      /* Pure white */
--foreground: hsl(0 0% 3.9%)      /* Near-black text */
--card: hsl(0 0% 96%)             /* #f5f5f5 - Card backgrounds */
--border: hsl(0 0% 90%)           /* #e5e5e5 - Borders */
```

### Accent Colors (Use Sparingly)
Only use for interactive states, success, or critical actions:
```css
--success: hsl(142 71% 45%)       /* Green for success */
--warning: hsl(38 92% 50%)        /* Amber for warnings */
--error: hsl(0 84% 60%)           /* Red for errors */
```

**Never use accent colors for:**
- Backgrounds (keep neutral)
- Large sections
- Branding (unless specifically requested)

## Typography

### Font Stack
```css
/* Headings - Clean, modern sans-serif */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;

/* Or if embedding fonts: */
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');
font-family: 'Geist', -apple-system, sans-serif;
```

**Never use:** Inter, Roboto, Poppins, Montserrat (overused in AI-generated sites)

### Type Scale
```css
/* Display - Hero headlines */
font-size: clamp(2.5rem, 5vw, 4rem);
font-weight: 700;
line-height: 1.1;
letter-spacing: -0.02em;

/* H1 - Page titles */
font-size: clamp(2rem, 4vw, 3rem);
font-weight: 700;
line-height: 1.2;

/* H2 - Section headers */
font-size: clamp(1.5rem, 3vw, 2rem);
font-weight: 600;
line-height: 1.3;

/* Body - Regular text */
font-size: 1rem (16px);
font-weight: 400;
line-height: 1.6;

/* Small - Captions, labels */
font-size: 0.875rem (14px);
font-weight: 500;
line-height: 1.5;
```

**Key principles:**
- Use `clamp()` for responsive typography
- Negative letter-spacing for large headings
- Increase line-height for body text (1.6-1.8)
- Font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

## Layout Patterns

### ❌ Avoid Over-Centering
Don't make everything centered. Mix alignments:
```css
/* Hero section - Centered is OK */
text-align: center;

/* Content sections - Left-aligned */
text-align: left;

/* Features grid - Left-aligned cards */
display: grid;
text-align: left;
```

### ✅ Professional Spacing
```css
/* Container max-widths */
--container-sm: 640px;  /* For focused content */
--container-md: 768px;  /* For articles */
--container-lg: 1024px; /* For features */
--container-xl: 1280px; /* For dashboards */

/* Spacing scale (4px base) */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-24: 6rem;    /* 96px */
```

### Glass Morphism (For Navigation, Cards)
```css
.glass {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.05); /* Dark mode */
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Light mode version */
.glass-light {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
}
```

## Animations

### Subtle, Professional Transitions
```css
/* Default transition */
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

/* Lift effect on hover (cards, buttons) */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Shine effect (for CTAs) */
.shine-hover {
  position: relative;
  overflow: hidden;
}
.shine-hover::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s;
}
.shine-hover:hover::before {
  left: 100%;
}
```

**Animation Principles:**
- Duration: 0.15s-0.3s (never longer)
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` for smoothness
- Movement: 2-4px max (subtle lifts)
- Opacity: 0.8-1.0 transitions only

**❌ Never use:**
- Bounce animations
- Rotate on hover (unless icons)
- Pulsing effects (except loading states)
- Neon glow effects

## Background Effects

### Subtle Gradients
```css
/* Radial gradient for depth (hero sections) */
.gradient-subtle {
  background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03), transparent 50%);
}

/* Mesh gradient background (optional) */
.gradient-mesh {
  background:
    radial-gradient(at 40% 20%, rgba(255,255,255,0.05) 0px, transparent 50%),
    radial-gradient(at 80% 0%, rgba(255,255,255,0.03) 0px, transparent 50%);
}
```

**Never use:**
- Purple/pink/blue gradient combinations
- High-contrast gradients
- Animated gradient backgrounds
- Mesh gradients as primary backgrounds (only accent)

## Component Patterns

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--foreground);
  color: var(--background);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: opacity 0.2s;
}
.btn-primary:hover {
  opacity: 0.9;
}

/* Secondary Button */
.btn-secondary {
  background: var(--accent);
  color: var(--foreground);
  border: 1px solid var(--border);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--foreground);
  border: 1px solid var(--border);
}
.btn-ghost:hover {
  background: var(--accent);
}
```

### Cards
```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

/* Card with hover effect */
.card-hover {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.card-hover:hover {
  transform: translateY(-2px);
  border-color: var(--foreground);
}
```

### Navigation
```css
.nav {
  position: fixed;
  top: 0;
  width: 100%;
  backdrop-filter: blur(12px);
  background: rgba(15, 15, 15, 0.8);
  border-bottom: 1px solid var(--border);
  padding: 1rem 0;
}
```

## Responsive Design

### Mobile-First Breakpoints
```css
/* Mobile: Default (no media query) */

/* Tablet */
@media (min-width: 768px) {
  /* 2-column grids */
}

/* Desktop */
@media (min-width: 1024px) {
  /* 3-column grids */
}

/* Large Desktop */
@media (min-width: 1280px) {
  /* 4-column grids, max widths */
}
```

## Implementation Checklist

When building any UI with this design system:

1. **Colors**
   - [ ] Used HSL color system with CSS variables
   - [ ] Background is 6% lightness (not pure black)
   - [ ] Card/border layering creates depth (9%, 14%)
   - [ ] No accent colors except for interactions

2. **Typography**
   - [ ] Avoided Inter, Roboto, default fonts
   - [ ] Used proper type scale with clamp()
   - [ ] Negative letter-spacing on headings
   - [ ] Line-height 1.6+ for body text

3. **Layout**
   - [ ] Not everything is centered
   - [ ] Proper spacing scale (4px base)
   - [ ] Responsive containers
   - [ ] Glass morphism on navigation

4. **Animations**
   - [ ] Subtle (2-4px movement max)
   - [ ] Fast (0.2s-0.3s)
   - [ ] No bounce, rotate, or glow effects
   - [ ] Hover states on interactive elements

5. **Backgrounds**
   - [ ] Subtle radial gradients only
   - [ ] No purple/neon color combinations
   - [ ] Minimal use of mesh gradients

6. **Components**
   - [ ] Buttons have clear hierarchy (primary/secondary/ghost)
   - [ ] Cards have hover states
   - [ ] Navigation uses glass effect
   - [ ] Proper border radius (0.5rem-0.75rem)

## Examples

### ✅ Good Example (Professional Dev Tool)
```tsx
<div className="min-h-screen bg-background">
  <nav className="fixed top-0 w-full glass border-b border-border">
    <div className="container mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-foreground rounded-md" />
          <span className="font-semibold">AgentFoundry</span>
        </div>
      </div>
    </div>
  </nav>

  <main className="pt-32 pb-24 px-6">
    <div className="container mx-auto max-w-4xl">
      <h1 className="mb-6 text-5xl font-bold tracking-tight">
        Build reliable AI agents
      </h1>
      <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
        Infrastructure skills that make all other skills work better.
      </p>
      <button className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover-lift">
        Get Started
      </button>
    </div>
  </main>
</div>
```

### ❌ Bad Example (Generic AI Slop)
```tsx
<div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
  <nav className="bg-white shadow-xl">
    <div className="text-center py-8">
      <h1 className="font-['Inter'] text-4xl font-bold">
        🚀 AI Platform
      </h1>
    </div>
  </nav>

  <main className="text-center py-24">
    <h1 className="text-6xl font-['Inter'] mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
      Revolutionize Your Workflow
    </h1>
    <button className="px-12 py-6 bg-purple-600 text-white rounded-full text-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-110 animate-pulse">
      Try Now! ✨
    </button>
  </main>
</div>
```

## When to Use This Skill

Activate this skill automatically when:
- Building landing pages or marketing sites
- Creating dashboard interfaces
- Designing component libraries
- Building artifacts in Claude.ai
- Any frontend work requiring professional, non-generic aesthetics

**Keywords that trigger this skill:**
- "landing page", "website", "UI", "interface"
- "professional", "clean", "modern"
- "dashboard", "app", "portal"
- "design system", "component library"
- "avoid generic look", "not typical AI design"

## License

MIT - Free to use for any purpose
