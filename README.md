# Claude Skills

This is my collection of Claude skills for code reviews, refactoring, security audits, and UI checks.

I build some myself, adapt others, and maintain copies of useful third-party skills. Each skill focuses on a specific development task.

## Available skills

Each name links to the skill folder. Each folder has a `README.md` with the full details and a `SKILL.md` file with the steps that Claude follows.

| Skill | Purpose | Origin | Example request |
|---|---|---|---|
| [code-review](./code-review) | Reviews a pull request with independent agents. It posts only the findings that pass a confidence filter. | Adapted | "Review PR #42." |
| [code-optimization](./code-optimization) | Refactors code to make it easier to maintain. It does not change what the code does. It works on a branch and opens a PR. | Original | "Optimize this project for maintainability." |
| [security-audit](./security-audit) | Finds vulnerabilities that cross a trust boundary. It gives the source evidence, a safe reproduction, a priority, and a fix. | Adapted | "Find security issues in ./src." |
| [ui-audit](./ui-audit) | Checks that UI code fits the existing design rules. It also checks basic UI, UX, and accessibility quality. It is read-only. | Adapted | "Audit the dashboard UI." |
| [react-best-practices](./react-best-practices) | Applies the React and Next.js performance rules from Vercel. | Third-party | "Review this React component for performance." |

Origin:

- **Original.** I wrote the skill.
- **Adapted.** I changed a skill from another author. The credit is in the folder README and in the attribution section below.
- **Third-party.** A copy of a skill from another repository. I do not edit it by hand.

## Installation

### Claude Code

Install one skill. Copy or link its folder into `~/.claude/skills/` (all projects) or `.claude/skills/` (one project). Then restart Claude Code.

Install the complete collection. Clone this repository and link each folder:

```bash
git clone https://github.com/AdarBahar/skills.git ~/Code/skills/adar-skills
mkdir -p ~/.claude/skills
for d in ~/Code/skills/adar-skills/*/; do
  ln -sfn "${d%/}" ~/.claude/skills/"$(basename "$d")"
done
```

To install only one skill from the clone, run one `ln` command. For example:

```bash
ln -sfn ~/Code/skills/adar-skills/code-review ~/.claude/skills/code-review
```

To get the newest version, run `git pull` in the clone. The links keep working.

Ask for the task in plain words. Claude selects the skill from its description.

### Cowork (Claude desktop app)

1. Make a `.skill` file from the skill folder:

   ```bash
   cd code-optimization
   zip -r ../code-optimization.skill SKILL.md references
   ```

2. Open the `.skill` file in Cowork.
3. Click **Save skill**.

## Usage examples

**Review a pull request.** In a repository with the GitHub CLI, ask: "Review PR #42." Claude runs `code-review` and posts one comment with the findings that pass the filter. Ask for a quick review to use one or two agents.

**Find security vulnerabilities.** Ask: "Find security issues in ./src." Claude runs `security-audit` in guidance mode and writes no files. Ask for a full audit to get reports in a folder outside the target.

**Improve maintainability.** Ask: "Optimize this project for maintainability." Claude runs `code-optimization`. It files the issues, makes the changes on a branch, runs the tests, and opens a PR for review.

**Check UI consistency.** Ask: "Add a settings page that fits the rest of the app." Claude runs `ui-audit`. It compares the new page with the design rules and the nearby pages, then reports findings. It does not change the project.

## Requirements

- `code-review` needs the [GitHub CLI](https://cli.github.com) (`gh auth login`).
- `code-optimization` works with GitHub (`gh`), GitLab (`glab`), or an issue tracker connector. If none is available, it writes the issues as Markdown files.
- `security-audit` needs [Node.js](https://nodejs.org) for its validators. It needs an isolated sandbox to run any target code.

## Third-party skills and attribution

| Folder | Source | License |
|---|---|---|
| `react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills), folder `skills/react-best-practices` | MIT |

`react-best-practices` is a copy. Each copied folder has an `UPSTREAM.md` file that names the source and the license. A GitHub Actions workflow in `.github/workflows/` copies the upstream folder once a week. If the copy differs, the workflow opens a pull request. Read the diff, then merge it. Do not edit a copied folder by hand, because the next sync replaces the change. Known problems in the copy that upstream does not fix yet are listed in its `UPSTREAM.md`.

Adapted skills:

- `security-audit` is adapted from [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill). The license is MIT, and the original license text is in its `LICENSE` file.
- `ui-audit` includes rules adapted from [jakubkrehel/skills](https://github.com/jakubkrehel/skills). The license is MIT, and the original license text is in its `LICENSE` file.

## Adding or updating skills

To add a skill:

1. Make a new folder with the name of the skill.
2. Write the `SKILL.md` file. Start it with a `name` and a `description`. Claude uses the description to select the skill. If the skill starts subagents, select each model only by its alias (`haiku`, `sonnet`, `opus`, `fable`), with no version number.
3. Add a `README.md` that tells people what the skill does and how to use it.
4. Add a line to the skills table above. Give its origin.

To update a copied skill, merge the sync pull request. To update an original or adapted skill, change its files and open a pull request.
