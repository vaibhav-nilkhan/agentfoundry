# Template Files Guide

All blank/template files created for you to paste content into on GitHub.

---

## 📋 Critical Priority Files (Week 1-2)

### 1. Skill Format Specification
**Location**: `docs/architecture/skill-format-spec.md`
**Purpose**: Define the canonical AgentFoundry Skill format
**Status**: ✏️ Ready for content
**Priority**: 🔴 CRITICAL

**What to paste**:
- Directory structure definition
- skill.json schema explanation
- SKILL.md format
- Implementation requirements
- Testing requirements
- Examples

---

### 2. JSON Schema
**Location**: `docs/architecture/skill-schema.json`
**Purpose**: Machine-readable skill.json validation
**Status**: ✅ Has structure (complete)
**Priority**: 🔴 CRITICAL

**What to refine**:
- Add more validation rules if needed
- Extend examples
- Add custom validators

---

### 3. MCP Integration Guide
**Location**: `docs/guides/mcp-integration.md`
**Purpose**: Document MCP integration approach
**Status**: ✏️ Ready for content
**Priority**: 🔴 CRITICAL

**What to paste**:
- MCP architecture
- Implementation details
- Code examples
- Testing approach
- Deployment instructions

---

### 4. Example Skills (3 Production Skills)

#### Skill 1: Web Search
**Location**: `skills/examples/web-search/`
**Files**:
- `SKILL.md` - ✏️ Ready for content
- `skill.json` - ✅ Has structure
- `src/main.py` - ✏️ Ready for implementation
- `tests/test_main.py` - ✏️ Ready for tests
- `docs/` - Create README
- `examples/` - Create usage examples

#### Skill 2: Email Sender
**Location**: `skills/examples/email-sender/`
**Files**:
- `SKILL.md` - ✏️ Ready for content
- `skill.json` - ✅ Has structure
- `src/` - Create main implementation
- `tests/` - Create tests
- `docs/` - Create README
- `examples/` - Create usage examples

#### Skill 3: File Operations
**Location**: `skills/examples/file-operations/`
**Files**:
- `SKILL.md` - ✏️ Ready for content
- `skill.json` - ✅ Has structure
- `src/` - Create main implementation
- `tests/` - Create tests
- `docs/` - Create README
- `examples/` - Create usage examples

---

## 🎨 Week 3-4 Files

### 5. Marketplace UI

#### Browse Page
**Location**: `packages/web/src/app/marketplace/page.tsx`
**Purpose**: Browse all Skills
**Status**: ✏️ Ready for implementation
**Priority**: 🟡 HIGH

**What to paste**:
- Search UI
- Filter controls
- Skills grid
- Pagination

#### Skill Detail Page
**Location**: `packages/web/src/app/marketplace/[slug]/page.tsx`
**Purpose**: View Skill details
**Status**: ✏️ Ready for implementation
**Priority**: 🟡 HIGH

**What to paste**:
- Skill header
- Installation instructions
- Documentation display
- Reviews section

---

### 6. Enhanced Validation

**Location**: `packages/validator/app/services/skill_validator.py`
**Purpose**: Complete validation pipeline
**Status**: ✏️ Ready for implementation
**Priority**: 🟡 HIGH

**What to paste**:
- Full validation orchestration
- Test execution logic
- Dependency checking
- Report generation

---

### 7. CLI Install Command

**Location**: `packages/cli/src/commands/install.ts`
**Purpose**: Install Skills from marketplace
**Status**: ✏️ Ready for implementation
**Priority**: 🟡 HIGH

**What to paste**:
- Fetch from marketplace
- Download logic
- Installation flow
- Config generation

---

## 📊 Tracking & Documentation

### 8. Execution Roadmap
**Location**: `docs/planning/execution-roadmap.md`
**Purpose**: Track progress against execution roadmap
**Status**: ✏️ Ready for updates
**Priority**: 🟢 MEDIUM

**What to update**:
- Mark completed tasks
- Update progress percentages
- Log blockers and decisions
- Add notes and learnings

---

### 9. Documentation Hub
**Location**: `docs/README.md`
**Purpose**: Central documentation index
**Status**: ✅ Complete
**Priority**: 🟢 MEDIUM

---

### 10. Getting Started Guide
**Location**: `docs/guides/getting-started.md`
**Purpose**: Developer onboarding and setup guide
**Status**: ✅ Complete
**Priority**: 🟡 HIGH

---

### 11. 2-Week Sprint Plan
**Location**: `docs/planning/2-week-sprint.md`
**Purpose**: Detailed day-by-day action plan for MVP alpha
**Status**: ✅ Complete
**Priority**: 🔴 CRITICAL

**Contents**:
- Day-by-day breakdown (14 days)
- Task priorities and assignments
- Budget breakdown ($6,000)
- Success metrics
- Red flags and mitigation strategies

---

## 📂 Directory Structure Created

```
agentfoundry/
├── docs/
│   ├── README.md                    ← ✅ Documentation hub
│   ├── architecture/
│   │   ├── skill-format-spec.md    ← ✏️ Paste content
│   │   └── skill-schema.json       ← ✅ Complete
│   ├── guides/
│   │   ├── getting-started.md      ← ✅ Complete
│   │   └── mcp-integration.md      ← ✏️ Paste content
│   └── planning/
│       ├── execution-roadmap.md    ← ✏️ Update progress
│       └── 2-week-sprint.md        ← ✅ Complete
├── skills/
│   └── examples/
│       ├── web-search/
│       │   ├── SKILL.md            ← ✏️ Paste content
│       │   ├── skill.json          ← ✅ Has structure
│       │   ├── src/main.py         ← ✏️ Paste implementation
│       │   └── tests/test_main.py  ← ✏️ Paste tests
│       ├── email-sender/
│       │   ├── SKILL.md            ← ✏️ Paste content
│       │   └── skill.json          ← ✅ Has structure
│       └── file-operations/
│           ├── SKILL.md            ← ✏️ Paste content
│           └── skill.json          ← ✅ Has structure
├── packages/
│   ├── web/src/app/marketplace/
│   │   ├── page.tsx                ← ✏️ Paste UI
│   │   └── [slug]/page.tsx         ← ✏️ Paste UI
│   ├── validator/app/services/
│   │   └── skill_validator.py     ← ✏️ Paste implementation
│   └── cli/src/commands/
│       └── install.ts              ← ✏️ Paste implementation
└── TEMPLATE_FILES_GUIDE.md         ← 📖 This file
```

---

## 🎯 Suggested Order of Implementation

### This Week (Week 1-2)

1. **Day 1-2**: MCP Integration Guide
   - Paste your MCP architecture
   - Document adapter approach
   - Add code examples

2. **Day 3**: Skill Format Specification
   - Define directory structure
   - Document skill.json schema
   - Add examples

3. **Day 4-7**: First 3 Production Skills
   - Implement web-search
   - Implement email-sender
   - Implement file-operations
   - Write tests for each

### Next Week (Week 3-4)

4. **Day 8-10**: Marketplace UI
   - Build browse page
   - Build detail page
   - Add search/filter

5. **Day 11-12**: Enhanced Validation
   - Complete validation pipeline
   - Add test execution

6. **Day 13-14**: CLI Install
   - Implement install command
   - Test end-to-end flow

---

## 💡 Tips for Pasting Content

### On GitHub:

1. **Navigate to file**:
   ```
   https://github.com/[username]/agentfoundry/blob/[branch]/[file-path]
   ```

2. **Click "Edit" button** (pencil icon)

3. **Paste your content** over the placeholder text

4. **Commit changes** with descriptive message

### Example Commit Messages:

```
docs: Add Skill format specification

feat: Implement web-search Skill

feat: Add marketplace browse UI

feat: Complete validation pipeline
```

---

## 🆘 Quick Reference

| File Type | Icon | Meaning |
|-----------|------|---------|
| ✏️ | Ready for content | Blank template, paste your content |
| ✅ | Has structure | JSON/code structure exists, refine if needed |
| 🔴 | CRITICAL | Week 1-2 priority (MCP, Skills, format) |
| 🟡 | HIGH | Week 3-4 priority (marketplace, validation) |
| 🟢 | MEDIUM | Track progress, update as you go |

---

**All files are ready for you to paste content on GitHub!** 🚀

Start with the 🔴 CRITICAL priority files to stay aligned with the roadmap.
