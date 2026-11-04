# ui-audit

A Claude skill that audits UI code. It makes sure that a new feature, page, or element fits the UI that already exists. It also checks basic UI/UX and accessibility quality.

Some rules are adapted from [jakubkrehel/skills](https://github.com/jakubkrehel/skills) (MIT). The original license is in `LICENSE`.

## What it does

- **Finds the rulebook first.** It reads the design-system skill, the project documents, the design tokens, the shared components, and the nearby pages. The existing rules have priority over the general rules.
- **Maps new values to tokens.** It uses the nearest token. It asks before a rounding of more than 2px, and before it adds a new token or component variant.
- **Reports evidence, not taste.** A value that is different from a general default is not a finding. Some problems are always HIGH, for example a control with no accessible name or no focus ring.
- **Reviews changes by cause.** For a branch or a PR, it marks each finding as `Introduced`, `Regression`, or `Pre-existing`. It also reviews the pages that use a changed component or token.
- **Same coverage on each run.** A Haiku subagent runs each pattern in the fixed list. The main model confirms each match and decides the findings. A Sonnet subagent reads the rulebook documents.
- **Finds the app.** Before the browser checks, it looks at the local ports and SSH tunnels. If it finds no app, it asks you for the URL.
- **Gives one report.** The report has one row for each root cause, `Before` and `After` columns, a coverage table with one row for each rule and pattern, and a `Block` or `Approve` verdict.

The skill is read-only. It gives findings and proposed fixes, and it never changes the project. A fix is a separate task that starts only when you ask for it.

## Files

- `SKILL.md`: the steps that Claude follows.
- `detection-patterns.md`: code patterns that Claude searches for, with their fixes.
- `LICENSE`: the MIT license of the upstream skills.

## Installing

Copy or link the folder into your skills directory:

- Personal skills: `~/.claude/skills/ui-audit/`
- Project skills: `.claude/skills/ui-audit/` in your repo

If Claude Code is already in operation, restart it.

## Example requests

- "Add a settings page that fits the rest of the app."
- "Audit the dashboard page UI."
- "Review the UI changes on this branch."
