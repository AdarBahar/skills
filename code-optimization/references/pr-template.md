# PR template

Adapt to the platform. The description must make the "pure refactor" claim verifiable at a glance and auto-close the issues on merge.

```
Title: Maintainability refactor — <area or "batch 1 of N">

## Summary
Refactors <files/area> for maintainability: <split large files / extracted
modules / removed duplication>. No behavior changes and no security changes —
pure restructuring.

## What changed
- <path>: <split into X, Y, Z by responsibility> — <n → n lines>
- <path>: <extracted helper into shared/…>
- ...

## Verification
- Tests: `<command>` — passing before and after (same suite, same coverage).
- Lint/typecheck/build: `<command>` — passing.
- Behavior: unchanged (code moved, not rewritten).
- Security: unchanged (no auth/validation/crypto/permission logic altered).

## Review notes
<anything needing a closer look; files that were flagged as riskier; why the
work is split across N PRs if applicable>

## Closes
Closes #<tracker>
Closes #<sub-issue>
Closes #<sub-issue>
...
```

## One PR vs. several

- **One PR** when the branch is cohesive and reviewable in a single sitting.
- **Several PRs** when the branch is large, spans unrelated areas, or mixes
  low-risk structural moves with flagged riskier changes — split by area/risk so
  each PR reviews cleanly. Each PR closes only the issues it actually resolves.

Include the closing keywords for every resolved issue so a merge updates and
closes them automatically.
```
