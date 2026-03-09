# Contributing Agent Adapters

Thank you for wanting to extend AgentFoundry! This guide explains how to build a custom adapter to track a new AI coding agent (e.g., Cursor, Windsurf, or your own custom CLI).

## Architecture

AgentFoundry uses an **Adapter Pattern** for log parsing. To support a new agent, you need to provide a JavaScript file that can read that agent's local logs and extract token usage.

## How to Build an Adapter

### 1. Identify the Logs
Every agent stores its session data somewhere on your machine.
- **Claude Code:** `~/.claude/projects/` (JSONL)
- **Gemini CLI:** `~/.gemini/tmp/` (OTel logs)
- **Codex:** `~/.codex/sessions/` (JSONL)

Your first task is to find where your target agent stores its token usage data.

### 2. Implement the `BaseParser` Interface
Your adapter must be a JavaScript file that implements the following interface:

```javascript
/**
 * @typedef {Object} TokenUsage
 * @property {number} inputTokens
 * @property {number} outputTokens
 * @property {number} [cacheCreationTokens]
 * @property {number} [cacheReadTokens]
 * @property {string} [model]
 */

class MyCustomAdapter {
    /**
     * @param {Date} startedAt - Start of the agent session
     * @param {Date} endedAt - End of the agent session
     * @returns {TokenUsage | null}
     */
    parseLogs(startedAt, endedAt) {
        // 1. Scan your agent's log directory
        // 2. Parse files modified between startedAt and endedAt
        // 3. Sum up the tokens
        // 4. Return the TokenUsage object
    }
}

module.exports = MyCustomAdapter;
```

### 3. Install your Adapter
Copy your `.js` file to the AgentFoundry plugin directory:

```bash
mkdir -p ~/.agentfoundry/plugins
cp my-adapter.js ~/.agentfoundry/plugins/my-agent.js
```

AgentFoundry will now automatically detect `my-agent` and use your parser whenever it detects a process with that name.

## Best Practices
- **Time Windows:** Always filter log entries by the `startedAt` and `endedAt` timestamps provided.
- **Error Handling:** Wrap your parsing logic in `try/catch`. If parsing fails, return `null` so AgentFoundry can skip the record gracefully.
- **Subdirectories:** If the agent uses project-specific subdirectories, make sure your parser recurses through them.

## Submitting to Core
If you've built a high-quality adapter for a popular agent, please submit a Pull Request!
1. Add your parser to `packages/cli/src/services/logParsers/`.
2. Register it in `packages/cli/src/services/logParsers/index.ts`.
3. Add a unit test in `packages/cli/src/services/__tests__/logParser.test.ts`.
