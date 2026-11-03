# PR template

Change the template to fit the platform. The description must let a reader verify the "pure refactor" claim at a glance. It must also close the issues automatically on merge.

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

- **One PR** when the branch is cohesive and a reviewer can read it in one sitting.
- **Several PRs** when the branch is large, covers unrelated areas, or mixes
  low-risk structural moves with flagged riskier changes. Split by area or risk
  so that each PR is easy to review. Each PR closes only the issues that it resolves.

Include the closing keywords for every resolved issue. Then a merge updates and closes the issues automatically.
```
