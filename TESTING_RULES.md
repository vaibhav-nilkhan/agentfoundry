# 🚨 Universal AI Testing Rules 🚨

> **"If a test passes even when the logic is broken, the test is a liability, not an asset."**

To build a production-grade application and avoid naive, AI-hallucinated tests (which just assert `expect(true).toBe(true)`), you MUST test the *actual* behavior of the system, not just whether a function was called. 

This document defines the strict testing philosophy for all AI coding agents operating in this repository.

---

## 1. The Core Directives

- **NO MOCKING THE DATABASE FOR CORE LOGIC:** Never mock the ORM/Database (e.g., Prisma, Mongoose, TypeORM) for core business logic. You MUST use a real, isolated test database (e.g., SQLite `:memory:` or a clean test schema). Mocking the DB hides relational errors, bad SQL constraints, and date parsing bugs.
- **NO MOCKING THE FUNCTION UNDER TEST:** Test the real function, edge cases and all. Only mock external 3rd-party APIs (like Stripe, SendGrid, or LLM providers) when absolutely necessary.
- **STATE THE BUG:** Every test MUST include a comment explicitly stating what real-world bug it catches.
  - *Example:* `// Bug this catches: User being charged twice if they rapidly double-click the checkout button.`
- **INVERT THE LOGIC (The Ultimate Litmus Test):** If you change a threshold or operator in the code (e.g., changing `>` to `<` or `===` to `!==`), the test MUST fail. If it still passes, the test is useless and you must rewrite it.

---

## 2. Test Generation Workflow (For AI Agents)

When writing or updating tests, AI agents MUST follow this internal monologue/process before writing code:

1. **Scenario Generation:** Analyze the feature. Think of the Happy Path, Edge Cases (extreme values, empty data), Invalid Inputs, Logical Failures, and Data Integrity issues (race conditions, duplicate entries).
2. **Test Writing:** Write the integration/unit test against the REAL test database. Assert actual output correctness and state changes.
3. **Bug Injection (Mental Check):** Mentally introduce 3 realistic bugs into the function (e.g., one logical bug, one edge case failure, one data handling issue). If the tests wouldn't catch them, the tests are too weak. Strengthen them.

---

## 3. Mutation Testing (StrykerJS / Equivalent)

We utilize Mutation Testing to automatically enforce rule #1. The framework will systematically mutate the code (e.g., flipping `+` to `-`, removing `if` conditions) and run the test suite.

- If the tests still pass, the mutation "survived" ❌ (Your tests are weak).
- If the tests fail, the mutation was "killed" ✅ (Your tests are strong).
- **Goal:** Maintain a mutation score of **75% or higher** for all core business logic.

---

## 4. Where to Focus Effort (High ROI)

Do not waste time writing 50 isolated unit tests for simple CRUD operations or getters/setters. Instead, write **5 powerful integration tests** focusing on the project's Core IP and Business Logic:

1. **The Core Algorithm / IP:** Does the primary ranking, filtering, recommendation, or processing algorithm actually return the mathematically correct result?
2. **Financials & Billing:** Are subscriptions correctly tracked? Are overcharges prevented? What happens if a payment webhook fails?
3. **Data Integrity & Permissions:** Can User A access User B's private data? Do cascade deletes work correctly without leaving orphaned records?

*By strictly adhering to these rules, the AI and the engineering team will maintain a highly resilient, enterprise-grade codebase.*