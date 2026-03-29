# AgentFoundry Documentation

> **The Fitbit for AI Coding Agents**

Welcome to the AgentFoundry documentation! This directory contains all technical documentation, guides, and planning materials.

---

## 📁 Documentation Structure

### 🏗️ [Architecture](./architecture/)
Technical specifications and architectural decisions

- **[skill-format-spec.md](./architecture/skill-format-spec.md)** - Canonical Skill format specification
  - Directory structure definition
  - `skill.yaml` schema explanation
  - `SKILL.md` format
  - Implementation requirements
  - Testing requirements
  - Examples

- **[skill-schema.json](./architecture/skill-schema.json)** - JSON schema for `skill.yaml` validation
  - Machine-readable schema
  - Validation rules
  - Field definitions

---

### 📖 [Guides](./guides/)
User and developer guides for working with AgentFoundry

- **[getting-started.md](./guides/getting-started.md)** - Quick start guide for developers
  - Environment setup
  - Running the development servers
  - Creating your first Skill
  - Troubleshooting

- **[mcp-integration.md](./guides/mcp-integration.md)** - MCP (Model Context Protocol) integration guide
  - MCP architecture overview
  - Adapter implementation
  - Tool conversion logic
  - Testing with Claude Desktop
  - Deployment instructions

---

### 📋 [Planning](./planning/)
Roadmaps, sprint plans, and progress tracking

- **[execution-roadmap.md](./planning/execution-roadmap.md)** - Overall execution roadmap tracker
  - Phase breakdown (Weeks 1-10)
  - Progress tracking
  - Completed/In Progress/Not Started tasks
  - Blockers and risks
  - Decisions made
  - Critical metrics

- **[2-week-sprint.md](./planning/2-week-sprint.md)** - Detailed 2-week sprint to MVP alpha
  - Day-by-day breakdown
  - Task priorities
  - Budget estimates
  - Success metrics
  - Red flags and mitigation
  - Critical path items

---

## 🚀 Quick Links

### For New Contributors
1. Start with **[Getting Started Guide](./guides/getting-started.md)**
2. Read **[Skill Format Specification](./architecture/skill-format-spec.md)**
3. Check **[2-Week Sprint Plan](./planning/2-week-sprint.md)** for current priorities

### For Developers Building Skills
1. **[Skill Format Specification](./architecture/skill-format-spec.md)** - Learn the Skill format
2. **[MCP Integration Guide](./guides/mcp-integration.md)** - Understand MCP compatibility
3. **[skill-schema.json](./architecture/skill-schema.json)** - Validate your `skill.yaml`

### For Project Planning
1. **[Execution Roadmap](./planning/execution-roadmap.md)** - Track overall progress
2. **[2-Week Sprint](./planning/2-week-sprint.md)** - See immediate priorities
3. **Getting Started** - Understand the development workflow

---

## 📚 Additional Documentation

Documentation outside the `docs/` directory:

### Root Documentation
- **[README.md](../README.md)** - Project overview and features
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - System architecture and tech stack
- **[SETUP.md](../SETUP.md)** - Detailed setup instructions
- **[MIGRATION.md](../MIGRATION.md)** - Migration guide (Express → NestJS)
- **[PORT_CONFIGURATION.md](../PORT_CONFIGURATION.md)** - Port management guide
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines
- **[LICENSE](../LICENSE)** - MIT License

### Helper Files
- **[TEMPLATE_FILES_GUIDE.md](../TEMPLATE_FILES_GUIDE.md)** - Guide for using template files
  - Lists all placeholder files ready for content
  - Implementation order recommendations
  - Priority indicators

---

## 🎯 Current Phase: Week 10 (Multi-Agent Swarm Orchestration)

**Focus**: Implementing concurrent agent monitoring and swarm benchmarking.

### Finished Milestones ✅
1. **Phase 1 (Weeks 1-5)** - Agent monitoring, cost tracking, and basic CLI/Web dashboard.
2. **Phase 2 (Weeks 6-8)** - Efficiency metrics (Token Yield) and Recommendation Engine.
3. **Phase 3 (Week 9)** - Local Team Mode and Profile Switcher (Zero-Setup Architecture).

### Immediate Priorities 🔴
1. **Concurrent Session Logic** - Detect and track multiple agents running at the same time.
2. **Swarm Dashboard** - Real-time view of team-wide agent activity.
3. **Benchmarking** - Tooling to compare different agents on the same task.

See [tasks/todo.md](../tasks/todo.md) for detailed task-level tracking.

---

## 📊 Documentation Status

| Document | Status | Priority | Last Updated |
|----------|--------|----------|--------------|
| Skill Format Spec | ✏️ Template | 🔴 CRITICAL | 2025-11-08 |
| MCP Integration | ✏️ Template | 🔴 CRITICAL | 2025-11-08 |
| Getting Started | ✅ Complete | 🟡 HIGH | 2025-11-08 |
| Execution Roadmap | 🟡 In Progress | 🟢 MEDIUM | 2025-11-08 |
| 2-Week Sprint | ✅ Complete | 🔴 CRITICAL | 2025-11-08 |
| Skill Schema | ✅ Complete | 🔴 CRITICAL | 2025-11-08 |

**Legend**:
- ✏️ Template - Ready for content to be added
- 🟡 In Progress - Partially complete
- ✅ Complete - Finished and ready to use

---

## 🤝 Contributing to Documentation

When adding or updating documentation:

1. **Follow the structure**: Place files in the appropriate directory
2. **Use clear headings**: Make docs scannable with good headers
3. **Add examples**: Include code snippets and examples
4. **Link related docs**: Create cross-references between related documents
5. **Update this README**: Add new docs to the appropriate section

---

## 🔍 Need Help?

- **Can't find what you're looking for?** Check the [Getting Started Guide](./guides/getting-started.md)
- **Working on a specific task?** See the [2-Week Sprint Plan](./planning/2-week-sprint.md)
- **Need architecture context?** Read [ARCHITECTURE.md](../ARCHITECTURE.md)

---

**Let's build the future of AI agents! 🚀**
