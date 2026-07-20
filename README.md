# Skills

A collection of [Claude](https://claude.com) skills — reusable, packaged instructions that teach Claude how to carry out a particular kind of task. Each skill lives in its own folder with a `SKILL.md` (the workflow Claude follows) and any supporting reference files.

Skills work in Cowork (the Claude desktop app) and in [Claude Code](https://docs.claude.com/en/docs/claude-code). See each skill's own README for install and usage details.

## Skills in this repo

| Skill | Description |
|-------|-------------|
| [code-optimization](./code-optimization) | Analyze a codebase for maintainability, propose and prioritize refactors, then implement them safely on a dev branch with tracked issues and a review-ready PR. Pure refactoring only — never changes behavior or weakens security. |

## Installing a skill

**Cowork:** package the skill folder as a `.skill` file (`zip -r <skill>.skill SKILL.md references`), open it in Cowork, and click **Save skill**.

**Claude Code:** copy the skill folder into `~/.claude/skills/` (personal) or `.claude/skills/` (per-project). The folder must contain `SKILL.md`.

Each skill's README has the full details.
