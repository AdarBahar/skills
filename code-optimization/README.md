# code-optimization

A Claude skill that turns "make this codebase easier to maintain" into a safe, tracked workflow with four phases: analyze and prioritize, implement, open a PR, and review. It never changes what the code does and never weakens its security.

## What it does

The skill has four phases. You can start at any phase. Claude does the phase that you ask for. It does not force the whole pipeline.

1. **Analyze & prioritize** — surveys the code (file size, churn × size, duplication, cohesion). Assesses the correct level of change for each file. Produces a prioritized list of 10–15 files. Files the list as a tracking issue with one sub-issue for each file (or as markdown, if no issue tracker is connected).
2. **Implement** — works through the issues on a dedicated dev branch, one file at a time. Uses a strict loop of test before, refactor, and test after. Updates the issue after each file.
3. **Open the PR** — creates one or more PRs that are ready for review. Each PR links every issue, so a merge closes them automatically.
4. **Code review** — reviews a PR. This phase works alone, so you only give it a PR link. It checks behavior preservation, security, tests, maintainability, and hygiene. It gives findings that are graded by severity.

### Design principles

- **Pure refactoring only.** The skill preserves observable behavior and security exactly. It flags anything riskier (control flow, auth, validation, crypto, public APIs) for your explicit approval. It does not change these items silently.
- **Risk assessment for each file.** Each file gets the correct level: structural move, low-risk cleanup, or "flag and ask". The skill does not apply one rule to all files.
- **Platform-agnostic.** The skill works with GitHub (`gh`), GitLab (`glab`), or an issue-tracker MCP connector. It uses markdown files when none of these is available.
- **Always verifiable.** The skill establishes a passing test baseline before it changes a file. It verifies again after the change. Then "no behavior change" is a verified claim and not a promise.

## Installing

### In Cowork (Claude desktop app)

Download the packaged `code-optimization.skill` file and open it. The file card shows a **Save skill** button. The button installs the skill into your profile (when your organization allows skill creation).

To package the skill yourself from this folder, run this command:

```bash
zip -r code-optimization.skill SKILL.md references
```

Then open that `.skill` file in Cowork and click **Save skill**.

### In Claude Code

Put the `code-optimization/` folder in your skills directory. Then Claude Code can find it:

- Personal skills: `~/.claude/skills/code-optimization/`
- Project skills: `.claude/skills/code-optimization/` in your repo

The folder must contain `SKILL.md` (and the `references/` folder). If Claude Code is already open, restart it. Then the skill is available.

## Running it

You do not call the skill by name. The skill starts automatically when you ask for the kind of work that it covers. These are examples:

- "Optimize this project for maintainability — split the large files and give me a prioritized list of what to tackle first, then file issues for each."
- "Implement the top few issues on a dev branch. Test before and after each change and update the issues."
- "Open a PR for the refactor branch and link all the issues so they close on merge."
- "Run a thorough code review on `https://github.com/me/repo/pull/42`."

Claude first confirms the repo, the test and lint commands, and the scope. Then it does the phase that you asked for. It stops at the phase boundaries. For example, it shows you the plan before it implements, and it shows you the PR before the merge.

## What is in this folder

- `SKILL.md` — the skill definition (the workflow that Claude follows).
- `references/issue-templates.md` — templates for the tracking issue and the sub-issues for each file.
- `references/pr-template.md` — the PR description template and the guidance on one PR or several PRs.
