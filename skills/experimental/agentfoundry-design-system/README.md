# AgentFoundry Design System

> Professional design system for AI agent UIs. Avoid generic "AI slop" aesthetics.

## 🎯 What It Does

This Claude Code skill automatically applies professional, non-generic design patterns when you build frontend interfaces. It helps you avoid common "AI startup" aesthetics like:

❌ Inter fonts
❌ Purple gradients
❌ Neon glow effects
❌ Excessive centered layouts

Instead, you get:

✅ Clean neutral palettes
✅ Professional typography
✅ Subtle animations
✅ Glass morphism effects

## 🚀 Installation

### Claude Code
```bash
# Install to your skills directory
git clone https://github.com/agentfoundry/skills/agentfoundry-design-system ~/.claude/skills/agentfoundry-design-system
```

### Manual Use
Copy `SKILL.md` to your project and reference it in your prompts.

## 💡 Usage

This skill activates automatically when Claude detects frontend design work:

```
User: "Build a landing page for my AI agent platform"
Claude: [Automatically uses AgentFoundry Design System]
       - Applies neutral color palette (#0f0f0f background)
       - Uses system fonts (not Inter/Roboto)
       - Adds glass morphism navigation
       - Implements subtle hover effects
```

**Trigger words:**
- "landing page", "website", "UI"
- "professional", "clean", "modern"
- "dashboard", "app", "portal"
- "avoid generic look", "not typical AI design"

## 🎨 What You Get

### Color Palette
- **Dark mode primary**: Soft dark gray (#0f0f0f) - not pure black
- **Layered grays**: 6% → 9% → 14% lightness for depth
- **Pure neutrals**: 0 saturation for premium feel
- **Accent colors**: Only for interactions (green/amber/red)

### Typography
- **Modern sans-serif**: System fonts or Geist
- **Responsive scale**: `clamp()` for fluid sizing
- **Proper hierarchy**: -0.02em letter-spacing on headings
- **Readable body**: 1.6-1.8 line-height

### Animations
- **Subtle lifts**: 2-4px translateY on hover
- **Fast timing**: 0.2s-0.3s durations
- **Smooth easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Shine effects**: For CTAs

### Components
- **Glass morphism navigation**: backdrop-blur with transparency
- **Hover-lift cards**: Subtle elevation changes
- **Button hierarchy**: Primary/Secondary/Ghost variants
- **Gradient backgrounds**: Radial gradients for depth

## 📦 What's Included

```
agentfoundry-design-system/
├── SKILL.md           # Main skill file (loads in Claude)
├── README.md          # Documentation
└── skill.yaml         # Skill metadata
```

## 🎯 Real-World Example

**Before (Generic AI Slop):**
```tsx
<div className="bg-gradient-to-br from-purple-500 to-pink-500">
  <h1 className="font-['Inter'] text-center text-6xl animate-pulse">
    🚀 Revolutionize Your Workflow
  </h1>
  <button className="bg-purple-600 rounded-full shadow-2xl hover:scale-110">
    Try Now! ✨
  </button>
</div>
```

**After (Professional):**
```tsx
<div className="bg-background">
  <h1 className="text-5xl font-bold tracking-tight">
    Build reliable AI agents
  </h1>
  <p className="text-xl text-muted-foreground leading-relaxed">
    Infrastructure skills that make all other skills work better.
  </p>
  <button className="px-6 py-3 bg-foreground text-background rounded-lg hover-lift">
    Get Started
  </button>
</div>
```

## 🔗 Learn More

- [Full Design System Docs](https://docs.agentfoundry.dev/design-system)
- [Example Implementations](./examples/)
- [Component Library](https://github.com/agentfoundry/ui)

## 📄 License

MIT © AgentFoundry
