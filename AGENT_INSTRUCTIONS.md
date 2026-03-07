# CLAUDE.md - AI Assistant Guide & Rules for AgentFoundry

> **CRITICAL**: This project has PIVOTED from a V1 "Skills Marketplace" to a V2 "Coding Agent Orchestrator". 
> Do NOT write code for the old Postgres database or Skill validation system.
> Read `docs/PRD.md` for the single source of truth about what we are building.

---

## 1. Project Overview & Architecture (V2)

**AgentFoundry** is an open-source coding agent orchestrator/tracker ("Fitbit for coding agents").
- **Core Loop:** A background daemon watches processes (Claude, Codex, Gemini), captures `git diffs` pre/post run, tests quality, and logs token costs to a local SQLite database.
- **Frontend:** A Next.js 15 dashboard to visualize agent performance, costs, and history.
- **Backend:** NestJS API.
- **Database:** Prisma with **SQLite** (Local-first, zero-setup for Solo developers).

---

## 2. Code Quality Standards
*Always apply these standards to all code you write.*

### 2.1 Reuse Before Creating
Before writing new code, analyze existing utilities, components, hooks, helpers, and tests:
1. **Search first** — grep/glob for similar functionality before implementing.
2. **Extend if close** — if something exists that's 80% of what you need, extend it.
3. **Extract if duplicating** — if you're about to copy-paste, extract to a shared module instead.

### 2.2 File Size & Organization
**Keep files between 200-300 lines max.** If a file exceeds this:
1. **Split by responsibility** — one module = one concern.
2. **Extract sub-components** — UI pieces that can stand alone should.
3. **Separate logic from presentation** — hooks/utils in their own files.
4. **Group by feature** — co-locate related files, not by type.

*Signs a file needs splitting:*
- Multiple unrelated exports
- Scrolling to find what you need
- "Utils" file becoming a junk drawer
- Component doing data fetching + transformation + rendering

### 2.3 Code Style
1. Prefer writing clear code and use inline comments sparingly.
2. Document methods with block comments at the top of the method.
3. Use Conventional Commit format for all git commits.

### 2.4 Test To Verify Functionality
*If you didn't test it, it doesn't work.*

Verify written code by:
- Running unit tests
- Running end-to-end tests
- Checking for type errors (TypeScript strict mode)
- Checking for lint errors (ESLint)
- Smoke testing and checking for runtime errors (Playwright where applicable)
- Taking screenshots and verifying the UI is as expected

---

## 3. Workflow Orchestration

### 3.1 Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions).
- If something goes sideways, STOP and re-plan immediately — don't keep pushing.
- Use plan mode for verification steps, not just building.
- Write detailed specs upfront to reduce ambiguity.

### 3.2 Subagent Strategy
- Use subagents liberally to keep the main context window clean.
- Offload research, exploration, and parallel analysis to subagents.
- For complex problems, throw more compute at it via subagents.
- One task per subagent for focused execution.

### 3.3 Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern.
- Write rules for yourself that prevent the same mistake.
- Ruthlessly iterate on these lessons until the mistake rate drops.
- Review `tasks/lessons.md` at the start of every session.

### 3.4 Verification Before Done
- Never mark a task complete without proving it works.
- Diff behavior between main and your changes when relevant.
- Ask yourself: *"Would a staff engineer approve this?"*
- Run tests, check logs, demonstrate correctness.

### 3.5 Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: *"Knowing everything I know now, implement the elegant solution."*
- Skip this for simple, obvious fixes — don't over-engineer.
- Challenge your own work before presenting it.

### 3.6 Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding.
- Point at logs, errors, failing tests — then resolve them.
- Zero context switching required from the user.
- Go fix failing CI tests without being told how.

---

## 4. Task Management
1. **Plan First**: Write the plan to `tasks/todo.md` with checkable items.
2. **Verify Plan**: Check in before starting implementation.
3. **Track Progress**: Mark items complete as you go `[x]`.
4. **Explain Changes**: High-level summary at each step.
5. **Document Results**: Add review section to `tasks/todo.md`.
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections.

---

## 5. Core Principles
- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
- **Follow V2 Architecture**: We use SQLite locally. Monorepo via Turborepo/pnpm. Never rebuild V1 features.
