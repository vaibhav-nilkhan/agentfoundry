---
name: production-reviewer
description: Autonomously reviews uncommitted changes, fixes issues to meet production standards (GEMINI.md), runs tests/builds to verify, and presents the final working code.
---

# Production Reviewer

This skill transforms Gemini CLI into an active, elite code reviewer that not only identifies issues but autonomously remediates them to ensure the codebase is production-ready.

## Workflow

When the user asks you to perform a production review using this skill, you must execute the following multi-step agentic loop:

### 1. Gather Context
*   **Analyze Changes:** Run `git diff HEAD` to see all uncommitted changes in the working directory.
*   **Deep Dive:** Do not review the diff in isolation. Identify related files (e.g., tests, imported modules, configuration) and read them to understand the surrounding architecture and dependencies.

### 2. Evaluate
*   Evaluate the changes against the strict rules defined in `GEMINI.md`.
*   Check for critical bugs, security vulnerabilities, edge cases, and missing test coverage.
*   Ensure the code is DRY, modular, and idiomatic.

### 3. Autonomous Remediation (The Fix Loop)
*   **DO NOT just list the issues for the user.** You are an autonomous agent; fix them directly.
*   Use your file-editing tools to apply refactors, fix logic errors, and enforce style guidelines.
*   If new logic was introduced without tests, write the corresponding unit/integration tests immediately.

### 4. Validation
*   You must verify your changes before finishing.
*   Run the project's standard test suite, build commands, and linters (e.g., `npm test`, `pnpm build`, `cargo test`, depending on the workspace).
*   If any tests fail or the build breaks, diagnose the failure, fix the code, and re-run the validation. Repeat this loop until everything passes cleanly.

### 5. Final Report
*   Once all tests pass and the code is structurally sound, provide a concise summary to the user.
*   List the specific fixes and improvements you applied autonomously.
*   Confirm that the workspace is now validated and ready to be committed.
