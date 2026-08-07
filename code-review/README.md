# code-review

A Claude skill that reviews a pull request with a panel of independent agents, scores every finding for confidence before reporting it, and posts only what survives — so the comment on your PR is short and worth reading.

It comes in two depths: a **full** review that looks at the diff from five angles, and a **quick** review that keeps the two highest-yield ones for a fast pass.

## What it does

The skill fans out several agents that review the change independently, then puts their findings through a separate scoring stage. Each finding is scored 0–100 on how confident a fresh agent is that it's real, and anything below **70** is dropped. Findings that survive are posted as a single PR comment with permalinks to the exact lines.

The point of the scoring stage is that the agent that *found* an issue is a poor judge of whether it's real. A second agent, given the finding cold, filters out the pre-existing issues, the plausible-but-wrong, and the nitpicks a senior engineer wouldn't raise.

### Full review — five dimensions

1. **CLAUDE.md compliance** — audits the change against the repo's own written rules.
2. **Bug scan** — reads the diff and looks for real defects, deliberately without loading broad context.
3. **Git history** — reads blame and past commits to catch changes that quietly undo an earlier fix.
4. **Prior PR comments** — reads reviews on earlier PRs that touched these files, and checks whether the same correction applies again.
5. **Code comments** — checks the change against the guidance already written in the files, including comments that claim behavior the code no longer has.

### Quick review — two dimensions

Keeps the bug scan and the CLAUDE.md audit, folding comment-vs-code mismatches into the bug scan for changed lines. It drops the git-history and prior-PR dimensions, which are by far the slowest and most context-hungry.

It also collapses the setup steps: eligibility, PR summary, and CLAUDE.md discovery happen in one call instead of three, and all findings are scored in a single pass rather than one agent per finding.

Roughly 4 agent calls instead of 9–13, with the two slowest dimensions off the critical path.

A quick review posts under a `### Code review (quick)` heading and says plainly which dimensions it skipped — so nobody reads a thin review as a thorough one.

### Design principles

- **Confidence-scored, not just found.** Every finding is re-judged by an agent that didn't find it, against a fixed 0–100 rubric, and filtered at 70.
- **Silence is a valid result.** If nothing clears the bar, the skill says so rather than padding the comment with whatever it has.
- **Never reviews what shouldn't be reviewed.** It checks up front that the PR isn't closed, draft, automated, or already reviewed — and re-checks before commenting on a full run, so a PR merged mid-review doesn't get a late comment.
- **Cites everything.** Findings link to permalinked line ranges at the full commit SHA, with context lines around the flagged code.
- **Leaves CI's job to CI.** Type errors, lint, formatting, and build failures are explicitly out of scope.

## Installing

### In Cowork (Claude desktop app)

Download the packaged `code-review.skill` file and open it — the file card shows a **Save skill** button that installs it into your profile (when your organization allows skill creation).

To package it yourself from this folder:

```bash
zip -r code-review.skill SKILL.md
```

Then present/open that `.skill` file in Cowork and click **Save skill**.

### In Claude Code

Place the `code-review/` folder in your skills directory so Claude Code discovers it:

- Personal skills: `~/.claude/skills/code-review/`
- Project skills: `.claude/skills/code-review/` in your repo

The folder must contain `SKILL.md`. Restart Claude Code if it's already running, and the skill becomes available.

Reviewing GitHub PRs requires the [`gh` CLI](https://cli.github.com) to be installed and authenticated (`gh auth login`).

## Running it

The skill triggers on the kind of request rather than by name. The wording picks the depth:

**Full review**

- "Run a code review on `https://github.com/me/repo/pull/42`."
- "Review PR #17."
- "Code review the current branch's PR."

**Quick review**

- "Run a quick code review on PR #42."
- "Fast review of this PR."
- "Quick review — I just want the obvious stuff."

Claude states which mode it's running before spending tokens, so you can redirect. If the request is ambiguous, it defaults to a full review.

## Tuning the threshold

The 70 cutoff lives in the filter step of both modes in `SKILL.md`. Raise it for quieter reviews, lower it to see more.

If reviews come back consistently empty, the cause may not be the threshold. The rubric mixes two different questions — *is this real* and *how often will it fire* — so a finding that's been confirmed as real still gets capped in the middle bands when it's latent, fail-closed, or not reachable through the current call path. If that pattern shows up, the sharper fix is to score confidence and severity separately, filter on confidence, and let severity drive the ordering.

## What's in this folder

- `SKILL.md` — the skill definition (both review modes, the scoring rubric, and the PR comment formats).

## Origin

Adapted from the `code-review` command in Anthropic's [official Claude Code plugins](https://github.com/anthropics/claude-code) marketplace. Changes from the original: the confidence threshold moved from 80 to 70, the quick mode was added, and the scoring rubric and comment templates were factored out so both modes share one copy.
