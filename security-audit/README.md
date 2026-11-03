# security-audit

A Claude skill for source-first security audits. It finds vulnerabilities that cross a real trust boundary. It gives the owner the source evidence, a safe reproduction, a priority, and the smallest fix.

Adapted from [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) (MIT). The original license is in `LICENSE`.

## What it does

The skill works in two modes:

- **Guidance mode** (the default). It answers security questions and reviews one area. It writes no files.
- **Full audit mode**. It runs six phases: reconnaissance, coverage-led hunting, candidate validation, structured output, independent record verification, and reporting. It writes the reports to an output folder outside the target.

Full audit mode runs when you ask for a full, comprehensive, or end-to-end audit, or when you ask for report files.

## Owner changes

This copy adds rules for this owner's setup:

- It never connects to a production host without approval.
- It never prints secret values.
- It keeps audit output out of synced folders.
- It writes full audit output to `~/security-audits/<repo-name>/run-<N>`.
- It adds `HOSTING-STANDARD.md`, a checklist for shared Linux servers, reverse proxies, databases, and releases.
- It lists which companion file to load for each type of target.

## Installing

Copy or link the folder into your skills directory:

- Personal skills: `~/.claude/skills/security-audit/`
- Project skills: `.claude/skills/security-audit/` in your repo

Restart Claude Code if it is already running.

## Requirements

- Node.js, for the two validators (`validate-findings.cjs` and `validate-coverage-ledger.cjs`).
- An isolated sandbox for any target code. The sandbox must block network access and limit resources. Without it, the skill does not run target code. It records the gap as `needs_validation`.

## Running it

Ask in plain words:

- "Security audit this codebase."
- "Find security vulnerabilities in `./src`."
- "Do a security review and write the output to `~/security-audits/my-project`."

## What's in this folder

- `SKILL.md`: the workflow, the rules, and the stack notes.
- Phase files: `RECONNAISSANCE.md`, `HUNTING.md`, `VALIDATION-AND-REPORTING.md`.
- Attack classes: `ATTACK-CLASSES.md` and one file per domain (web and auth, client side, AI, cloud, supply chain, and more).
- `HOSTING-STANDARD.md`: the hosting checklist added for this owner.
- `report-schema.json`: the schema for `findings.json`.
- Validators and their tests: `validate-findings.cjs`, `validate-coverage-ledger.cjs`, and the matching `.test.cjs` files.
