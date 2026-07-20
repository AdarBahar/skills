# code-optimization

A Claude skill that turns "make this codebase easier to maintain" into a safe, tracked, four-phase workflow — analyze and prioritize, implement, open a PR, and review — without ever changing what the code does or weakening its security.

## What it does

The skill runs in four phases. You can start at any of them; Claude does the phase you ask for rather than forcing the whole pipeline.

1. **Analyze & prioritize** — surveys the code (file size, churn × size, duplication, cohesion), assesses the right level of change per file, and produces a prioritized list of 10–15 files. Files everything as a tracking issue with one sub-issue per file (or as markdown, if no issue tracker is connected).
2. **Implement** — works through the issues on a dedicated dev branch, one file at a time, with a strict test-before → refactor → test-after loop and an issue update after each file.
3. **Open the PR** — creates one or more review-ready PRs that link every issue so merging auto-closes them.
4. **Code review** — reviews a PR (stands alone — just hand it a PR link) against behavior preservation, security, tests, maintainability, and hygiene, with severity-graded findings.

### Design principles

- **Pure refactoring only.** It preserves observable behavior and security exactly. Anything riskier (control flow, auth, validation, crypto, public APIs) is flagged for your explicit approval rather than changed silently.
- **Per-file risk assessment.** Each file gets the appropriate level — structural move, low-risk cleanup, or "flag and ask" — instead of one blanket rule.
- **Platform-agnostic.** Works with GitHub (`gh`), GitLab (`glab`), an issue-tracker MCP connector, or falls back to markdown files when none is available.
- **Always verifiable.** Establishes a passing test baseline before touching a file and re-verifies after, so "no behavior change" is a checked claim, not a promise.

## Installing

### In Cowork (Claude desktop app)

Download the packaged `code-optimization.skill` file and open it — the file card shows a **Save skill** button that installs it into your profile (when your organization allows skill creation).

To package it yourself from this folder:

```bash
zip -r code-optimization.skill SKILL.md references
```

Then present/open that `.skill` file in Cowork and click **Save skill**.

### In Claude Code

Place the `code-optimization/` folder in your skills directory so Claude Code discovers it:

- Personal skills: `~/.claude/skills/code-optimization/`
- Project skills: `.claude/skills/code-optimization/` in your repo

The folder must contain `SKILL.md` (and the `references/` folder). Restart Claude Code if it's already running, and the skill becomes available.

## Running it

You don't invoke it by name — the skill triggers automatically when you ask for the kind of work it covers. Examples:

- "Optimize this project for maintainability — split the large files and give me a prioritized list of what to tackle first, then file issues for each."
- "Let's implement the top few issues on a dev branch. Test before and after each change and update the issues."
- "Open a PR for the refactor branch and link all the issues so they close on merge."
- "Run a thorough code review on `https://github.com/me/repo/pull/42`."

Claude will confirm the repo, test/lint commands, and scope up front, then work through the phase you asked for, pausing at phase boundaries (e.g. showing you the plan before implementing, and the PR before merging).

## What's in this folder

- `SKILL.md` — the skill definition (the workflow Claude follows).
- `references/issue-templates.md` — templates for the tracking issue and per-file sub-issues.
- `references/pr-template.md` — the PR description template and one-PR-vs-several guidance.
