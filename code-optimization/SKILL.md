---
name: code-optimization
description: Analyze a codebase for maintainability, propose and prioritize refactors, then implement them safely with tracked issues and a review-ready PR. Use whenever the user wants to optimize, clean up, refactor, or improve the maintainability of code — split large files, extract functions into separate files, reduce file/line counts, or otherwise make a project easier to maintain — especially when they also want issues/sub-issues created, work done on a dev branch with tests, and a PR opened for review. Also use for the standalone "review this PR" ask. Works with GitHub, GitLab, or any issue/PR tooling that's available. This is a refactoring skill: it never changes what the code does or weakens security.
---

# Code Optimization

Help the user make a codebase easier to maintain without changing behavior or weakening security. The work runs in four phases. Most requests start at Phase 1, but the user may jump straight to a later phase (e.g. "run a code review on this PR" is Phase 4). Read the phase they're asking for and do that one; don't force the whole pipeline if they only want part of it.

The prime directive across every phase: **optimization is pure refactoring. It must not change observable behavior, remove capabilities, or weaken security in any way.** If a change would alter what the code does, that's a feature/bugfix — flag it and get explicit approval before touching it. When in doubt, keep the change smaller.

## Before you start

Confirm the working context so the rest goes smoothly:

- **The repo and tooling.** What platform hosts issues/PRs (GitHub via `gh`, GitLab via `glab`, an MCP connector, or something else)? Check what's actually available rather than assuming — try `gh auth status` / `glab auth status`, or look for a connected issue-tracker MCP. If none is available, still produce the analysis and plan as files/markdown and tell the user how they'd file it.
- **The test story.** How are tests run (`npm test`, `pytest`, `go test`, `make test`)? Is there a lint/typecheck/build command? You need these to verify "before" and "after". If there are no tests at all, say so — it raises the risk of every change and shapes how conservative to be.
- **Scope.** The whole repo, or a subdirectory/module? Any files that are off-limits (generated code, vendored deps, migrations)?

Then create a task list so the user can follow progress, and proceed to the requested phase.

---

## Phase 1 — Analyze and prioritize

Goal: survey the code, find maintainability wins, and produce a prioritized list of 10–15 files to start with, filed as a tracking issue with one sub-issue per file.

### Survey the code

Get a factual picture before opining. Useful signals, roughly in order of value:

- **Size and density** — largest files by lines; functions/classes that are very long; files doing many unrelated things. `git ls-files | xargs wc -l | sort -rn | head -40` and similar are quick wins. These are the usual top candidates.
- **Cohesion** — files mixing unrelated concerns (e.g. HTTP handlers + DB access + formatting in one module) that would read better split by responsibility.
- **Duplication** — the same logic copy-pasted across files; a helper that wants extracting.
- **Churn × size** — files that are both large and frequently changed (`git log --format= --name-only | sort | uniq -c | sort -rn`) hurt the most, since maintenance pain compounds with edit frequency. Weight these up.
- **Dead or unreachable code**, overly deep nesting, tangled imports.

Read enough of the actual code to make specific, correct recommendations — don't prioritize on line count alone. For a large repo, spawn parallel `Explore` subagents to survey different directories and report back.

### Decide the level per file

Assess each candidate and recommend the appropriate level, rather than applying one blanket rule:

- **Structural (safest, prefer these):** split a file into several by responsibility; extract a function/class into its own module; move helpers to a shared util; reorganize imports. No logic changes.
- **Low-risk cleanup:** remove provably-dead code, collapse obvious duplication into a shared helper, rename for clarity — only where tests (or careful reading) confirm behavior is unchanged.
- **Riskier (flag, don't just do):** anything that touches control flow, error handling, concurrency, auth/permissions, input validation, crypto, or public API signatures. Call these out separately in the analysis with the risk noted, and get explicit approval before implementing. Never fold a behavior change into an "optimization" silently.

For each file, capture the *benefit* in concrete maintainability terms — smaller review surface, clearer ownership, easier testing, less merge-conflict risk — not vague "cleaner code".

### Prioritize

Rank 10–15 files. A reasonable priority = (maintenance pain) × (safety/ease). Favor high-impact, low-risk items first so early wins build confidence and the branch stays easy to review. A simple High/Medium/Low with a one-line rationale each is enough; don't over-engineer the scoring.

### File the issues

Create one **tracking issue** with the overall analysis, then one **sub-issue per file/priority**. See `references/issue-templates.md` for the exact structure to fill in. Link each sub-issue to the tracker. If the platform supports task-list checkboxes or sub-issue relationships, use them so closing sub-issues updates the parent.

If no issue tracker is available, write the same content to markdown files in the output folder and tell the user they can paste them in.

End Phase 1 by showing the user the prioritized list and asking whether to start implementing (and whether to do all of it or a subset).

---

## Phase 2 — Implement

Goal: work through the prioritized issues on a dedicated branch, one file/issue at a time, with tests proving behavior is unchanged, updating each issue as you go.

### Set up

Create a development branch off the default branch (e.g. `refactor/maintainability` or `opt/<area>`) so everything can be reviewed together and rolled back if needed. Never commit optimizations straight to main.

### For each file/issue, follow this loop

This per-file discipline is what makes the refactor trustworthy — do not skip the "before" test.

1. **Test before.** Run the relevant tests (and lint/typecheck/build) and record that they pass *before* you touch anything. If they're already failing or absent, note it in the issue — you can't claim "no behavior change" against a baseline you never established, so either add characterization tests first or explicitly flag the file as higher-risk.
2. **Refactor.** Make the structural change from the plan. Keep each file/issue in its own commit (or small set of commits) referencing the issue number, so review and rollback are granular. Move code; don't rewrite it — preserve logic line-for-line where possible.
3. **Add/update tests if relevant.** If splitting a file changes import paths, update tests. If a newly-extracted function is now independently testable and wasn't covered, add a focused test. Don't pad with trivial tests for their own sake.
4. **Test after.** Rerun the same tests + lint/typecheck/build. They must pass and cover the same behavior as before. If anything changed in observable behavior, you went too far — revert and reduce the scope.
5. **Update the issue.** Comment on the sub-issue with what was done, the before/after test result, line-count delta, and any follow-ups. Check it off / close it per the team's convention.

Keep commits clean and scoped so the eventual review reads file-by-file. If a planned change turns out riskier than expected once you see the code, stop and flag it rather than pushing through.

---

## Phase 3 — Open the PR

Goal: a review-ready PR (or a few, if that reviews better) linking every issue so merging closes them.

- **One PR vs several.** Default to one PR for the whole branch if the changes are cohesive and reviewable in one sitting. Split into several when the branch is large, touches unrelated areas, or when some files are riskier than others and deserve separate review — group by area/risk, not arbitrarily. Explain your choice to the user.
- **Link issues so merge closes them.** Put closing keywords in the PR description (`Closes #123, Closes #124`, or the platform equivalent) for every sub-issue and the tracker, so a merge auto-closes them. See `references/pr-template.md`.
- **Make it easy to review.** In the description: summarize what changed and why, confirm no behavior/security change, list the before/after test results, and note anything that needs a closer look. Keep the diff readable — pure moves are easier to review when they're not mixed with edits.
- **Request review.** Open it as ready-for-review (or draft if the user wants to look first) and hand the link back to the user.

---

## Phase 4 — Code review

Use this when the user asks to review a PR (often on a fresh agent with just a PR link — that's fine, this phase stands alone).

Fetch the PR: its diff, description, linked issues, and CI status (`gh pr view <url> --json ...` / `gh pr diff`, `glab mr` equivalents, or the connector). Then review thoroughly against these axes, in priority order:

1. **Behavior preservation** — the headline claim of a refactor. Does the diff actually preserve behavior, or did logic sneak in? Scrutinize moved code for subtle edits (changed conditionals, dropped branches, altered defaults, reordered side effects).
2. **Security** — confirm nothing weakened: auth/permission checks intact, input validation not dropped, secrets not exposed, no new injection/deserialization surface. A refactor must never be a stealth security regression.
3. **Correctness & tests** — do tests still cover the changed code? Did coverage drop? Do the before/after results in the description hold up? Are new tests meaningful?
4. **Maintainability** — did it achieve the stated benefit (smaller/clearer files, better separation)? Or just move mess around?
5. **Hygiene** — dead imports left behind, inconsistent naming, broken references, commit/PR scope, issue links present.

Deliver findings grouped by severity (Blocking / Should-fix / Nit), each with file:line and a concrete suggested fix. Be specific and actionable; call out what's genuinely good too, not only problems. End with an overall verdict (approve / approve-with-nits / request-changes) and the reasoning.

---

## Guardrails (all phases)

- Refactor, don't rewrite. Preserve behavior and security exactly. Anything else needs explicit sign-off.
- Always establish a passing baseline before changing a file, and re-verify after.
- Keep everything on a branch; keep commits scoped per issue for granular rollback.
- Keep the user in the loop at phase boundaries — show the plan before implementing, show the PR before merging.
- Adapt to available tooling; never block the analysis just because a specific issue tracker isn't wired up.
