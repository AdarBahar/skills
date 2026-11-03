---
name: code-optimization
description: "Makes a codebase easier to maintain through pure refactoring. Analyzes the code, prioritizes refactors, files tracked issues, implements them on a branch with tests, and opens a PR that is ready for review. Use when the user asks to optimize, clean up, refactor, or improve maintainability. Examples are to split large files, move functions into modules, or reduce file or line counts. Use it especially when the user also wants issues, a dev branch with tests, or a PR. Works with GitHub, GitLab, or any available issue or PR tool. Never changes what the code does and never weakens security. Do not use for ordinary PR reviews. Use code-review for those."
---

# Code Optimization

Help the user make a codebase easier to maintain. Do not change behavior and do not weaken security. The work has four phases. Most requests start at Phase 1, but the user can go directly to a later phase. For example, "run a code review on this PR" is Phase 4. Read the phase the user asks for and do that phase. Do not force the whole pipeline if the user wants only a part.

The prime directive for every phase: **optimization is pure refactoring. It must not change observable behavior, remove capabilities, or weaken security in any way.** If a change alters what the code does, it is a feature or a bugfix. Flag it and get explicit approval before you touch it. If you are not sure, make the change smaller.

## Before you start

Confirm the working context so the rest of the work goes smoothly:

- **The repo and tools.** Find which platform hosts the issues and PRs (GitHub with `gh`, GitLab with `glab`, an MCP connector, or other). Verify what is available. Do not assume. Try `gh auth status` or `glab auth status`, or look for a connected issue-tracker MCP. If none is available, still produce the analysis and plan as markdown files. Tell the user how to file them.
- **The test process.** Find how to run the tests (`npm test`, `pytest`, `go test`, `make test`). Find the lint, typecheck, or build command. You need these commands to verify the "before" and "after" states. If there are no tests, tell the user. No tests means more risk for each change. Be more conservative.
- **Scope.** Find out if the scope is the whole repo or a subdirectory or module. Ask if some files are off-limits (generated code, vendored dependencies, migrations).

Then create a task list so the user can follow the progress. Proceed to the requested phase.

---

## Phase 1 — Analyze and prioritize

Goal: survey the code and find the maintainability improvements. Make a prioritized list of 10–15 files to start with. File it as a tracking issue with one sub-issue for each file.

### Survey the code

Get the facts before you give an opinion. These signals are useful, roughly in order of value:

- **Size and density** — the largest files by lines, very long functions or classes, and files that do many unrelated things. Quick commands, such as `git ls-files | xargs wc -l | sort -rn | head -40`, help here. These files are usually the top candidates.
- **Cohesion** — files that mix unrelated concerns (for example HTTP handlers, DB access, and formatting in one module). Such files are easier to read when you split them by responsibility.
- **Duplication** — the same logic copied across files, or a helper that you can extract.
- **Churn × size** — files that are large and also change often (`git log --format= --name-only | sort | uniq -c | sort -rn`) cause the most pain. Maintenance pain grows with the edit frequency. Give these files a higher weight.
- **Dead or unreachable code**, deep nesting, and tangled imports.

Read enough of the real code to make specific and correct recommendations. Do not prioritize on line count alone. For a large repo, start parallel `Explore` subagents. Each subagent surveys a different directory and reports back.

### Decide the level for each file

Assess each candidate and recommend the correct level. Do not apply one rule to all files:

- **Structural (safest, prefer these):** split a file into several files by responsibility. Move a function or class into its own module. Move helpers to a shared util. Reorganize imports. Do not change logic.
- **Low-risk cleanup:** remove code that is provably dead. Merge obvious duplication into a shared helper. Rename for clarity. Do these only where tests or careful reading confirm that behavior does not change.
- **Riskier (flag, do not just do):** anything that touches control flow, error handling, concurrency, auth or permissions, input validation, crypto, or public API signatures. Show these items separately in the analysis and note the risk. Get explicit approval before you implement them. Never put a behavior change into an "optimization" silently.

For each file, state the *benefit* in concrete maintainability terms. Examples are a smaller review surface, clearer ownership, easier tests, or less risk of merge conflicts. Do not use vague words such as "cleaner code".

### Prioritize

Rank 10–15 files. A reasonable priority is (maintenance pain) × (safety and ease). Put the high-impact, low-risk items first. Early wins build confidence and keep the branch easy to review. A simple High, Medium, or Low rating with a one-line reason for each is enough. Do not make the scoring complex.

### File the issues

Create one **tracking issue** with the overall analysis. Then create one **sub-issue for each file or priority**. Read `references/issue-templates.md` for the exact structure to fill in. Link each sub-issue to the tracker. If the platform supports task-list checkboxes or sub-issue relationships, use them. Then the close of a sub-issue updates the parent.

If no issue tracker is available, write the same content to markdown files in the output folder. Tell the user that they can paste the files into a tracker.

At the end of Phase 1, show the user the prioritized list. Ask whether to start to implement. Ask whether to do all of the list or only a subset.

---

## Phase 2 — Implement

Goal: work through the prioritized issues on a dedicated branch, one file or issue at a time. Use tests to prove that behavior does not change. Update each issue as you work.

### Set up

Create a development branch from the default branch (for example `refactor/maintainability` or `opt/<area>`). Then the user can review all the changes together and can roll them back if necessary. Never commit optimizations directly to main.

### Loop for each file or issue

This discipline for each file makes the refactor trustworthy. Do not skip the "before" test.

1. **Test before.** Run the relevant tests (and lint, typecheck, and build). Record that they pass *before* you change anything. If they already fail or do not exist, write a note in the issue. You cannot claim "no behavior change" against a baseline that you did not establish. Either add characterization tests first, or flag the file as higher-risk.
2. **Refactor.** Make the structural change from the plan. Put each file or issue in its own commit (or a small set of commits) that references the issue number. Then the review and the rollback are granular. Move code. Do not rewrite it. Keep the logic line for line where possible.
3. **Add or update tests if relevant.** If a split changes the import paths, update the tests. If a function that you extracted can now be tested alone and no test covered it, add a focused test. Do not add trivial tests only to have more tests.
4. **Test after.** Run the same tests and the same lint, typecheck, and build again. They must pass and must cover the same behavior as before. If observable behavior changed, you went too far. Revert and reduce the scope.
5. **Update the issue.** Add a comment to the sub-issue. Write what you did, the before and after test results, the change in line count, and any follow-up work. Check it off or close it as the team convention says.

Keep the commits clean and scoped so the final review reads file by file. If a planned change is riskier than expected when you see the code, stop and flag it. Do not push through.

---

## Phase 3 — Open the PR

Goal: a PR that is ready for review (or a few PRs, if that is better for review). The PR links every issue, so a merge closes them.

- **One PR or several.** By default, use one PR for the whole branch if the changes are cohesive. A reviewer can read them in one sitting. Use several PRs when the branch is large or touches unrelated areas. Also use several PRs when some files are riskier than others and need a separate review. Group by area or risk, not at random. Explain your choice to the user.
- **Link issues so a merge closes them.** Put closing keywords in the PR description for every sub-issue and for the tracker. Use `Closes #123, Closes #124`, or the platform equivalent. Then a merge closes them automatically. Read `references/pr-template.md`.
- **Make the review easy.** In the description, summarize what changed and why. Confirm that no behavior or security changed. List the before and after test results. Note anything that needs a closer look. Keep the diff readable. Pure moves are easier to review when they are not mixed with edits.
- **Request review.** Open the PR as ready for review (or as a draft if the user wants to look first). Give the link to the user.

---

## Phase 4 — Code review

Use this phase only for a refactor PR. It checks behavior and security first. For any other PR review, use the `code-review` skill.

Fetch the PR: its diff, description, linked issues, and CI status (`gh pr view <url> --json ...` or `gh pr diff`, the `glab mr` equivalents, or the connector). Then review it thoroughly against these axes, in priority order:

1. **Behavior preservation** — the main claim of a refactor. Find out if the diff really preserves behavior or if logic entered it. Examine moved code for subtle edits (changed conditionals, dropped branches, changed defaults, reordered side effects).
2. **Security** — confirm that nothing is weaker. Auth and permission checks are intact. Input validation is not dropped. Secrets are not exposed. There is no new injection or deserialization surface. A refactor must never be a hidden security regression.
3. **Correctness and tests** — find out if the tests still cover the changed code. Find out if coverage dropped. Find out if the before and after results in the description are correct. Find out if the new tests are meaningful.
4. **Maintainability** — find out if the PR achieved the stated benefit (smaller or clearer files, better separation). Or did it only move the mess?
5. **Hygiene** — dead imports left behind, inconsistent names, broken references, the scope of the commits and the PR, and the presence of issue links.

Give the findings grouped by severity (Blocking / Should-fix / Nit). Give each finding a file:line and a concrete suggested fix. Be specific and actionable. Also name what is good, not only the problems. End with an overall verdict (approve / approve-with-nits / request-changes) and the reason.

---

## Guardrails (all phases)

- Refactor. Do not rewrite. Preserve behavior and security exactly. Anything else needs explicit sign-off.
- Always establish a passing baseline before you change a file. Verify again after the change.
- Keep all work on a branch. Keep the commits scoped to one issue for granular rollback.
- Keep the user informed at the phase boundaries. Show the plan before you implement. Show the PR before the merge.
- Adapt to the available tools. Never stop the analysis only because a specific issue tracker is not connected.
