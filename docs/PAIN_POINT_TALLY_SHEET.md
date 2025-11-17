# Pain Point Tally Sheet — Real Developer Problems (Nov 2025)

> **Research Method**: GitHub Issues analysis (langchain-ai/langchain, llama_index)
> **Date Collected**: November 16, 2025
> **Purpose**: Catalogue real developer pain to identify first 15-20 launch skills
> **Source**: Direct complaints from developers building production agents

---

## Methodology

**Step 1**: Searched GitHub Issues with keywords: "bug," "tool use," "fail," "Anthropic," "Cohere," "parsing," "response_format," "agent," "state management," "streaming"

**Step 2**: Catalogued pain points by **frequency** (not by theoretical demand)

**Step 3**: Identified **specific developers** filing these bugs (potential design partners)

---

## Pain Point Categories (Sorted by Frequency)

### 🔴 Tier 1: Critical Pain (6+ mentions) — Build These First

---

## Pain #1: Cross-Platform Tool Use Incompatibilities

**Frequency**: 8 mentions
**Severity**: 🔴 Critical
**Impact**: Developers cannot write once, deploy anywhere

### Specific Complaints

| Issue # | Developer | Exact Pain Point | Model Combo |
|---------|-----------|------------------|-------------|
| #33855 | N/A | "tool_choice='any' inserted for Bedrock invocation when using ChatLiteLLM" | OpenAI params → Bedrock |
| #33863 | N/A | "[BUG] Structured Output Incompatible when using tools" | Generic |
| #28848 | N/A | "bind_tools not callable after with_structured_output" | OpenAI |
| #29410 | jonmach | "ChatOllama with_structured_output not honoured by langchain. Works fine using direct ollama call" | Ollama |
| #29282 | N/A | "DeepSeek V3 Does Not Support Structured Output in LangChain" | DeepSeek |
| #19212 (llama_index) | N/A | "Not getting the tool calling parameters for anthropic models" | Anthropic |
| #33965 | N/A | "Some models' ToolMessage content fields do not support arrays" | Multiple |
| #32492 | N/A | "Cannot use GPT-5 verbosity parameter with structured output" | OpenAI GPT-5 |

### Root Cause
Different model providers use different tool-calling formats:
- OpenAI: `tool_choice`, `tools`, `function_call` (deprecated)
- Anthropic: `tool_use` blocks
- Bedrock: Different parameter schema
- Ollama, DeepSeek: Limited structured output support

### Developer Quote
> "ChatOllama with_structured_output not honoured by langchain. Works fine using direct ollama chat() call." — jonmach, Issue #29410

### 🎯 Proposed Skills

1. **`Cross_Platform_Tool_Adapter_v1`**
   - **What It Does**: Automatically translates tool definitions from OpenAI format → Anthropic, Bedrock, Cohere, Ollama
   - **Value Prop**: Write tool once, works everywhere
   - **Validation**: Test same tool against 5+ model providers
   - **Estimated Demand**: 🔥🔥🔥🔥🔥 (8 issues, core value prop)

2. **`Structured_Output_Fallback_v1`**
   - **What It Does**: Detects when model doesn't support native structured output, falls back to JSON parsing with retry logic
   - **Value Prop**: 99.9% reliability even on models without structured output support
   - **Validation**: Test with DeepSeek, Ollama, older models
   - **Estimated Demand**: 🔥🔥🔥🔥 (4 issues)

---

## Pain #2: State Management & Memory Failures

**Frequency**: 6 mentions
**Severity**: 🔴 Critical
**Impact**: Multi-turn agent conversations break, agents lose context

### Specific Complaints

| Issue # | Developer | Exact Pain Point | Context |
|---------|-----------|------------------|---------|
| #33936 | N/A | "Agent with Checkpointer Reuses Tool Results in Multi-Turn Conversations" | Checkpointing |
| #33966 | N/A | "Browser session terminates immediately after browser_navigate execution" | Stateful tools (MCP Playwright) |
| #19719 (llama_index) | N/A | "how to pass memory to the router query engine for follow up questions..." | Memory persistence |
| #33808 | N/A | "Dynamic Tool Addition/Removal" (cannot modify tools after init) | Tool lifecycle |
| #33726 | N/A | "RunnableConfig Access in Middleware" (middleware lacks config context) | Middleware state |
| #33962 | N/A | "How langchain1.0 create_agent uses PostgresSaver as checkpointer" | Unclear documentation |

### Root Cause
- Agents cache tool results when they shouldn't (#33936)
- External resources (browser sessions) aren't persisted across tool calls (#33966)
- No clear pattern for passing memory/state in multi-turn conversations (#19719)
- Cannot dynamically modify agent tools after initialization (#33808)

### Developer Quote
> "Browser session terminates immediately after browser_navigate execution, causing subsequent tool calls to fail" — Issue #33966

### 🎯 Proposed Skills

3. **`Stateful_Agent_Checkpointer_v1`**
   - **What It Does**: Reliable checkpointing that knows when to cache vs re-execute tools
   - **Value Prop**: Prevents stale data in multi-turn conversations
   - **Validation**: Test with PostgreSQL, Redis, in-memory checkpointers
   - **Estimated Demand**: 🔥🔥🔥🔥 (6 issues)

4. **`Session_Manager_for_Stateful_Tools_v1`**
   - **What It Does**: Manages lifecycle of stateful external resources (browser sessions, database connections) across agent tool calls
   - **Value Prop**: Browser/DB sessions persist correctly
   - **Validation**: Test with Playwright MCP, database tools
   - **Estimated Demand**: 🔥🔥🔥 (2 issues, but high severity)

5. **`Dynamic_Tool_Registry_v1`**
   - **What It Does**: Add/remove tools from agent at runtime without re-initialization
   - **Value Prop**: Agents can adapt toolset mid-conversation
   - **Validation**: Test dynamic tool swapping in running agent
   - **Estimated Demand**: 🔥🔥 (1 issue, marked 1.1 candidate = high priority)

---

## Pain #3: Streaming + Tool Call Results Missing

**Frequency**: 4 mentions
**Severity**: 🟠 High
**Impact**: Real-time UX breaks, developers can't show intermediate steps

### Specific Complaints

| Issue # | Developer | Exact Pain Point | Provider |
|---------|-----------|------------------|----------|
| #33920 | N/A | "Code execution tool result blocks missing from streaming responses" | Anthropic |
| #33807 | N/A | "Server-side tools only emit after execution completes" | Multiple (web_search, code_interpreter) |
| #25436 | N/A | "OpenAI Adapter Chunk response missing handling for tool_calls" | OpenAI |
| #33696 | N/A | "create_agent with tools fail as final LLM call does not happen" | Generic |

### Root Cause
- Anthropic's streaming doesn't include tool result blocks (#33920)
- Server-side tools emit results only after completion, not when decided (#33807)
- OpenAI chunk responses don't handle tool_calls properly (#25436)

### Developer Quote
> "Server-side tools (web_search, code_interpreter, etc) only emit after execution completes, not when model decides to call them" — Issue #33807

### 🎯 Proposed Skills

6. **`Streaming_Tool_Call_Wrapper_v1`**
   - **What It Does**: Intercepts tool calls, emits intermediate steps, buffers results for streaming
   - **Value Prop**: Real-time UX with tool call visibility
   - **Validation**: Test with Anthropic, OpenAI streaming APIs
   - **Estimated Demand**: 🔥🔥🔥 (4 issues, affects UX)

7. **`Server_Tool_Progress_Tracker_v1`**
   - **What It Does**: Emits progress events for long-running server-side tools (web_search, code_interpreter)
   - **Value Prop**: Users see "Searching web..." before results arrive
   - **Validation**: Test with Anthropic's web_search, code_interpreter
   - **Estimated Demand**: 🔥🔥 (1 issue, but major UX problem)

---

### 🟡 Tier 2: High Pain (3-5 mentions) — Build Next

---

## Pain #4: Schema Validation Failures (Pydantic)

**Frequency**: 5 mentions
**Severity**: 🟠 High
**Impact**: Tool inputs/outputs randomly fail validation

### Specific Complaints

| Issue # | Developer | Exact Pain Point | Pydantic Version |
|---------|-----------|------------------|------------------|
| #32224 | N/A | "tool invocation fails to correctly recognize Pydantic v2 schema" | v2 |
| #33300 | codeonym | "LangGraph CLI treats InjectedState as required tool parameter" | Unknown |
| #32067 | eyurtsev | "Potential validation issue when using StateLike in Annotation for a tool" | Unknown |
| #32042 | N/A | "$ref paths with list indices raise KeyError in dereference_refs" | Unknown |
| #31132 | N/A | "Validation Error while using Chatgroq" | Unknown |

### Root Cause
- Pydantic v2 schemas not recognized (#32224)
- Complex type annotations (InjectedState, StateLike) cause validation errors
- JSON schema dereferencing breaks with nested structures

### Developer Quote
> "tool invocation fails to correctly recognize Pydantic v2 schema" — Issue #32224

### 🎯 Proposed Skills

8. **`Pydantic_V2_Schema_Adapter_v1`**
   - **What It Does**: Auto-converts Pydantic v2 models to LangChain-compatible tool schemas
   - **Value Prop**: Pydantic v2 works without manual schema writing
   - **Validation**: Test with Pydantic v2 nested models
   - **Estimated Demand**: 🔥🔥🔥 (2 issues, but affects all Pydantic v2 users)

9. **`Robust_Tool_Schema_Validator_v1`**
   - **What It Does**: Pre-validates tool schemas before execution, provides clear error messages
   - **Value Prop**: Catch schema errors at registration, not runtime
   - **Validation**: Test with complex nested schemas, union types
   - **Estimated Demand**: 🔥🔥 (3 issues)

---

## Pain #5: Legacy Code Path Conflicts

**Frequency**: 3 mentions
**Severity**: 🟡 Medium
**Impact**: Developers forced to use deprecated APIs or workarounds

### Specific Complaints

| Issue # | Developer | Exact Pain Point | Issue |
|---------|-----------|------------------|-------|
| #33970 | N/A | "get_buffer_string cannot correctly output AI tool call message" | Uses deprecated function_call instead of tool_calls |
| #33965 | N/A | "Some models' ToolMessage content fields do not support arrays" | Array content support |
| #33961 | N/A | "XAI Live Search API will be deprecated, use tools instead" | Migration from API to tools |

### Root Cause
- Code still uses deprecated `function_call` field instead of `tool_calls` (#33970)
- Inconsistent array support in ToolMessage content across models (#33965)

### 🎯 Proposed Skills

10. **`Legacy_Tool_Call_Migrator_v1`**
    - **What It Does**: Auto-detects deprecated function_call usage, translates to modern tool_calls
    - **Value Prop**: Seamless migration from old to new tool calling APIs
    - **Validation**: Test with old LangChain code using function_call
    - **Estimated Demand**: 🔥🔥 (2 issues, but affects legacy codebases)

---

### 🟢 Tier 3: Medium Pain (2 mentions) — Build Later

---

## Pain #6: Retry Logic & Error Handling

**Frequency**: 2 mentions
**Severity**: 🟡 Medium
**Impact**: Agents fail permanently instead of retrying

### Specific Complaints

| Issue # | Developer | Exact Pain Point | Context |
|---------|-----------|------------------|---------|
| #33983 | N/A | "Add ModelRetryMiddleware for fine-grained control for LLM retries" | Feature request for retry logic |
| #33696 | N/A | "create_agent with tools fail as final LLM call does not happen and it errors out with UnboundLocalError" | Unhandled error |

### 🎯 Proposed Skills

11. **`Intelligent_Retry_Wrapper_v1`**
    - **What It Does**: Retry failed tool calls with exponential backoff, model fallback
    - **Value Prop**: Transient failures don't kill entire agent workflow
    - **Validation**: Test with rate limit errors, timeout errors
    - **Estimated Demand**: 🔥 (1 explicit request, but universally useful)

---

## Pain #7: Async & Performance

**Frequency**: 1 mention (llama_index)
**Severity**: 🟡 Medium
**Impact**: Slow agent performance in production

### Specific Complaints

| Issue # | Developer | Exact Pain Point | Context |
|---------|-----------|------------------|---------|
| #19734 (llama_index) | N/A | "how to make azure open ai async" | Async implementation unclear |

### 🎯 Proposed Skills

12. **`Async_Agent_Executor_v1`**
    - **What It Does**: Properly implements async/await for parallel tool execution
    - **Value Prop**: 10x faster multi-tool agent workflows
    - **Validation**: Benchmark parallel vs sequential tool execution
    - **Estimated Demand**: 🔥 (1 issue, but affects production performance)

---

## Summary: Top 12 Skills to Build for Launch

### Tier 1: Build First (Critical Pain, 6+ mentions)

| Priority | Skill Name | Pain Point Solved | Frequency | Estimated Demand |
|----------|------------|-------------------|-----------|------------------|
| **#1** | `Cross_Platform_Tool_Adapter_v1` | Tool definitions work across OpenAI, Anthropic, Bedrock, Ollama | 8 | 🔥🔥🔥🔥🔥 |
| **#2** | `Structured_Output_Fallback_v1` | Fallback for models without native structured output | 4 | 🔥🔥🔥🔥 |
| **#3** | `Stateful_Agent_Checkpointer_v1` | Prevents stale data in multi-turn conversations | 6 | 🔥🔥🔥🔥 |
| **#4** | `Session_Manager_for_Stateful_Tools_v1` | Browser/DB sessions persist across tool calls | 2 | 🔥🔥🔥 |
| **#5** | `Dynamic_Tool_Registry_v1` | Add/remove tools at runtime | 1 | 🔥🔥 |

### Tier 2: Build Next (High Pain, 3-5 mentions)

| Priority | Skill Name | Pain Point Solved | Frequency | Estimated Demand |
|----------|------------|-------------------|-----------|------------------|
| **#6** | `Streaming_Tool_Call_Wrapper_v1` | Real-time UX with tool call visibility | 4 | 🔥🔥🔥 |
| **#7** | `Server_Tool_Progress_Tracker_v1` | Progress events for long-running tools | 1 | 🔥🔥 |
| **#8** | `Pydantic_V2_Schema_Adapter_v1` | Pydantic v2 models work without manual schemas | 2 | 🔥🔥🔥 |
| **#9** | `Robust_Tool_Schema_Validator_v1` | Catch schema errors at registration, not runtime | 3 | 🔥🔥 |

### Tier 3: Build Later (Medium Pain, 1-2 mentions)

| Priority | Skill Name | Pain Point Solved | Frequency | Estimated Demand |
|----------|------------|-------------------|-----------|------------------|
| **#10** | `Legacy_Tool_Call_Migrator_v1` | Migrate deprecated function_call to tool_calls | 2 | 🔥🔥 |
| **#11** | `Intelligent_Retry_Wrapper_v1` | Retry failed tool calls with exponential backoff | 1 | 🔥 |
| **#12** | `Async_Agent_Executor_v1` | Parallel tool execution for 10x performance | 1 | 🔥 |

---

## Potential Design Partners (Direct Outreach)

### Developers Filing These Issues

| GitHub Username | Issues Filed | Pain Point | Contact Method |
|-----------------|--------------|------------|----------------|
| **jonmach** | #29410 | ChatOllama structured output failure | LinkedIn/X: Find via GitHub profile |
| **codeonym** | #33300 | InjectedState validation error | LinkedIn/X: Find via GitHub profile |
| **eyurtsev** | #32067 | StateLike validation issue | LinkedIn/X: Find via GitHub profile (LangChain team member!) |

### Outreach Template

```
Subject: Built a fix for Issue #{number} — Want to beta test?

Hi {Name},

I saw your GitHub issue on LangChain about {specific pain point}. I'm a dev also working on agent reliability and I've built a verified, cross-platform solution that solves that exact bug.

It's called {Skill_Name_v1} and it {specific solution}.

I'm looking for 5-10 beta testers to validate this works in production. Can I send you the (free) beta version and get your feedback?

Would love to get on a 15-min call to understand your other pain points as well.

Best,
{Your Name}
AgentFoundry
```

---

## Validation Strategy

### For Each Skill

1. **Build Skill**: Follow SKILL_SPECIFICATION.md
2. **Write Tests**: 80%+ code coverage, test against 3+ model providers
3. **Validate Against Real Issue**: Run skill on exact scenario from GitHub Issue
4. **Contact Issue Author**: Send beta version, get feedback
5. **Iterate**: Fix based on feedback, re-test
6. **Publish**: Add to marketplace with "✅ Validated Against Issue #{number}" badge

---

## Next Steps

### Week 1 (Pre-Launch)
- [ ] Build Skills #1-3 (Cross_Platform_Tool_Adapter, Structured_Output_Fallback, Stateful_Agent_Checkpointer)
- [ ] Validate against Issues #33855, #33863, #33936
- [ ] Contact jonmach, codeonym, eyurtsev with beta versions

### Week 2 (Beta Launch)
- [ ] Build Skills #4-6
- [ ] Publish all 6 skills to marketplace
- [ ] Post "Show HN: AgentFoundry — Solved 6 LangChain Tool Use Bugs" with links to issues

### Week 3-4
- [ ] Build Skills #7-9 based on beta user feedback
- [ ] Expand to 12 skills total
- [ ] Get 10 design partner testimonials

---

## Key Insight

**We are not building a "skill marketplace."**

**We are building a "bug fix distribution system" where the bugs are the most painful, expensive, and repetitive problems developers face when building production agents.**

Every skill maps 1:1 to a real GitHub Issue filed by a frustrated developer. That is demand.

---

**The market research was correct about trends. This is the tactical execution.**
