# Issue templates

Use these as the content for the tracking issue and each sub-issue. Adapt field names to the platform (GitHub, GitLab, Jira, etc.). Keep them concise and skimmable — a reviewer should grasp each in under a minute.

## Tracking issue (parent)

```
Title: Code maintainability optimization — analysis & plan

## Goal
Make the codebase easier to maintain via pure refactoring — splitting large
files, extracting functions into their own modules, reducing file/line counts,
improving separation of concerns. No behavior changes, no security changes.

## Scope
<repo / subdir surveyed, and anything explicitly out of scope>

## Method
<how candidates were found: size, churn×size, duplication, cohesion; test/lint
commands used to verify>

## Prioritized files (10–15)
A checklist linking each sub-issue so closing them updates this tracker:

- [ ] #<n> <path> — <High/Med/Low> — <one-line benefit>
- [ ] #<n> <path> — ...

## Expected benefits
<smaller review surface, clearer ownership, easier testing, fewer merge
conflicts — stated concretely>

## Risks / notes
<files with no test coverage, anything flagged as riskier-than-structural,
approach to branching & rollback>
```

## Sub-issue (one per file/priority)

```
Title: Optimize <path>

## Priority
<High / Medium / Low> — <rationale in one line>

## Current state
- Lines: <n>  |  Functions/classes: <n>
- Problems: <too large / mixed responsibilities / duplicated logic / etc.>
- Test coverage: <exists / partial / none — how it's exercised>

## Proposed change
<Structural / low-risk cleanup>. Specifically:
- <e.g. split into foo_handlers.ts, foo_db.ts, foo_format.ts by responsibility>
- <e.g. extract validateX() into shared/validation.ts>
Behavior and security unchanged.

## Benefit
<concrete maintainability gain>

## Plan
1. Run tests + lint/build; record passing baseline.
2. <the refactor steps>
3. Add/update tests: <what, if any>
4. Rerun tests + lint/build; confirm identical behavior.
5. Update this issue with results (before/after tests, line delta).

## Risk level
<Structural — low | Cleanup — low | Flagged — needs approval before implementing>
```
