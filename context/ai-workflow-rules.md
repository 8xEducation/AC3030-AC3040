# AI Workflow Rules

## Approach

Build this project incrementally using a strict spec-driven and offline-first workflow. Context files (like `architecture.md` and the unit test plan) define what to build, the dual-entry accounting constraints, and the current state of progress. Always implement against these specs—do not infer or invent financial logic, data flows, or UI behaviors from scratch. Adhere strictly to the defined MVC architecture and the 4 core Design Patterns (Factory, Observer, Strategy, Facade).

## Scoping Rules

- Work on one feature unit at a time
- Prefer small, verifiable increments over large speculative changes
- Do not combine unrelated system boundaries in a single implementation step

## When to Split Work

Split an implementation step if it combines:

- Database schema/model migrations and UI component rendering
- Multiple independent Design Patterns (e.g., implementing both the Transaction Factory and the Budget Strategy in the same pass)
- Financial edge cases or calculations that are not clearly defined in the unit test plan

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files
- If a requirement is ambiguous, resolve it in the relevant context file before implementing
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing

## Protected Files

Do not modify the following unless explicitly instructed:

- `src/utils/currencyFormatter.ts` (Once it passes the unit tests, to strictly prevent floating-point calculation regressions)
- `src/database/schema.ts` (After the initial DB setup, any structural changes require a dedicated migration step)
- WatermelonDB internal adapters or Expo native configuration files (`app.json`, `babel.config.js`)

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries
- Storage model decisions
- Code conventions or standards
- Feature scope

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. TypeScript compiles without errors and all Jest unit tests pass successfully