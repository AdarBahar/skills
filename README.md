# Skills

Skills for [Claude](https://claude.com) that I share.

## Purpose

A skill is a set of instructions that teaches Claude how to do one type of task.
Each skill is in its own folder. The folder has a `SKILL.md` file, which contains the steps that Claude follows. If necessary, the folder also has reference files.

## Benefits

- **The same result each time.** Claude follows the same tested steps. It does not make a new plan for each request.
- **Safe defaults.** The skills verify their work. They ask before a risky change.
- **Easy to use.** You ask in plain words. Claude finds the correct skill. You do not have to type its name.
- **Works in two apps.** Use the skills in Claude Code and in Cowork (the Claude desktop app).

## Index of skills

| Skill | Function | Example request |
|---|---|---|
| [code-review](./code-review) | Reviews a pull request with a panel of independent agents. It scores each finding and posts only the findings that pass. A full review uses five checks and gives a merge verdict. A quick review uses one or two. If you name no mode, it picks the depth from the size of the PR. | "Review PR #42." · "Run a quick code review on this PR." |
| [code-optimization](./code-optimization) | Makes code easier to maintain. It finds the files to improve and makes issues. It refactors on a work branch with tests before and after, and it opens a PR. It does not change what the code does. It does not weaken security. | "Optimize this project for maintainability." |
| [security-audit](./security-audit) | Audits code for security vulnerabilities that cross a trust boundary. It gives the source evidence, a safe reproduction, a priority, and a fix. Full audits write reports. It never runs target code without a sandbox. It never touches a production host without approval. Adapted from Cloudflare's MIT-licensed skill. | "Security audit this codebase." · "Find security issues in ./src." |
| [ui-audit](./ui-audit) | Audits UI code. It makes sure that a new feature, page, or element fits the existing UI rulebook (design system, tokens, shared components). It also checks basic UI/UX and accessibility quality. It reports findings with evidence and gives a verdict. Adapted in part from jakubkrehel/skills (MIT). | "Add a settings page that fits the rest of the app." · "Audit the dashboard UI." |
| [react-best-practices](./react-best-practices) | React and Next.js performance rules from Vercel. A copy of a third-party skill. See "Third-party skills" below. | "Review this React component for performance." |

Each skill folder has a README with the full details.

## How to use

### Claude Code

1. Copy or link the skill folder into `~/.claude/skills/` (all projects) or `.claude/skills/` (one project).
2. Restart Claude Code.
3. Ask for the task in plain words.

To get all the skills and their updates, clone this repository and link each folder:

```bash
git clone https://github.com/AdarBahar/skills.git ~/Code/skills/adar-skills
for d in ~/Code/skills/adar-skills/*/; do
  ln -sfn "${d%/}" ~/.claude/skills/"$(basename "$d")"
done
```

Then run `git pull` in the clone to get the newest version.

### Cowork (Claude desktop app)

1. Make a `.skill` file from the skill folder:

   ```bash
   cd code-optimization
   zip -r ../code-optimization.skill SKILL.md references
   ```

2. Open the `.skill` file in Cowork.
3. Click **Save skill**.

### Requirements

- `code-review` needs the [GitHub CLI](https://cli.github.com) (`gh auth login`).
- `code-optimization` works with GitHub (`gh`), GitLab (`glab`) or an issue tracker connector. If none is available, it writes the issues as Markdown files.
- `security-audit` needs [Node.js](https://nodejs.org) for its validators. It needs an isolated sandbox to run any target code.

## Third-party skills

Some folders are copies of skills from other repositories. Each one has an `UPSTREAM.md` file that names the source and the license.

| Folder | Source | License |
|---|---|---|
| `react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills), folder `skills/react-best-practices` | MIT |

Do not edit a copied folder. A workflow in `.github/workflows/` copies the upstream folder once a week. If the copy differs, the workflow opens a pull request. Read the diff, then merge it. The prose of a copied skill is not in ASD-STE100, because a rewrite would be lost at the next sync.

## Add a skill

1. Make a new folder with the name of the skill.
2. Write the `SKILL.md` file. Start it with a `name` and a `description`. Claude uses the description to select the skill.
3. Add a `README.md` that tells people what the skill does and how to use it.
4. Add a line to the index above.
