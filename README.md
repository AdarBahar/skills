# Skills

Skills for [Claude](https://claude.com) that I share.

## Purpose

A skill is a set of instructions that teaches Claude how to do one type of task.
Each skill is in its own folder. The folder has a `SKILL.md` file (the steps that Claude follows) and, if necessary, reference files.

## Benefits

- **The same result each time.** Claude follows the same tested steps, not a new plan for each request.
- **Safe defaults.** The skills check their work and ask before a risky change.
- **Easy to use.** You ask in plain words. Claude finds the correct skill. You do not have to type its name.
- **Works in two apps.** Use the skills in Claude Code and in Cowork (the Claude desktop app).

## Index of skills

| Skill | Function | Example request |
|---|---|---|
| [code-review](./code-review) | Reviews a pull request with a panel of independent agents. It scores each finding and posts only the findings that pass. A full review uses five checks. A quick review uses two. | "Review PR #42." · "Run a quick code review on this PR." |
| [code-optimization](./code-optimization) | Makes code easier to maintain. It finds the files to improve, makes issues, refactors on a work branch with tests before and after, and opens a PR. It does not change what the code does and does not weaken security. | "Optimize this project for maintainability." |

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
- `code-optimization` works with GitHub (`gh`), GitLab (`glab`) or an issue tracker connector. Without one, it writes the issues as Markdown files.

## Add a skill

1. Make a new folder with the name of the skill.
2. Write the `SKILL.md` file. Start it with a `name` and a `description`. Claude uses the description to select the skill.
3. Add a `README.md` that tells people what the skill does and how to use it.
4. Add a line to the index above.
