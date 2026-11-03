# code-review

A Claude skill that reviews a pull request with a panel of independent agents. It scores each finding for confidence before it reports the finding. It posts only the findings that pass, so the comment on your PR is short and useful.

The skill has two depths. A **full** review examines the diff from five angles. A **quick** review keeps the two angles that find the most issues, for a fast pass.

## What it does

The skill starts several agents that review the change independently. Then a separate scoring stage examines their findings. A fresh agent scores each finding from 0 to 100 for how confident it is that the finding is real. The skill removes each finding below **70**. It posts the remaining findings as a single PR comment with permalinks to the exact lines.

The agent that *found* an issue is a poor judge of whether the issue is real. A second agent gets the finding with no prior context. This agent removes the pre-existing issues, the issues that look correct but are wrong, and the nitpicks that a senior engineer would not raise.

### Full review - five dimensions

1. **CLAUDE.md compliance** - audits the change against the written rules of the repo.
2. **Bug scan** - reads the diff and looks for real defects. It does not load broad context, on purpose.
3. **Git history** - reads blame and past commits to find changes that silently undo an earlier fix.
4. **Prior PR comments** - reads the reviews on earlier PRs that changed these files. It checks if the same correction applies again.
5. **Code comments** - checks the change against the guidance that is already in the files. This includes comments that claim a behavior that the code no longer has.

### Quick review - two dimensions

Quick review keeps the bug scan and the CLAUDE.md audit. The bug scan also finds comments in changed lines that do not agree with the code. Quick review does not use the git-history and prior-PR dimensions. These two dimensions are the slowest and need the most context.

Quick review also combines the setup steps. One call does the eligibility check, the PR summary, and the CLAUDE.md discovery, not three calls. One pass scores all findings, not one agent for each finding.

Quick review uses about 4 agent calls, not 9 to 13. The two slowest dimensions are not on the critical path.

A quick review posts under a `### Code review (quick)` heading. It states clearly which dimensions it did not check. Then nobody reads a thin review as a thorough review.

### Design principles

- **Scored for confidence, not only found.** An agent that did not find the issue judges each finding again. The agent uses a fixed 0-100 rubric. The skill filters the findings at 70.
- **No result is a valid result.** If no finding passes the threshold, the skill says so. It does not fill the comment with the findings that it has.
- **It does not review what it should not review.** At the start, it checks the PR. It checks that the PR is not closed, a draft, automated, or already reviewed. In a full run, it checks again before it comments. Then a PR that was merged during the review does not get a late comment.
- **It cites everything.** Each finding links to permalinked line ranges at the full commit SHA, with context lines around the flagged code.
- **CI does the work of CI.** Type errors, lint, formatting, and build failures are out of scope.
- **Limited authority.** The skill reads the pull request and posts one comment. It does not change code, push, merge, or resolve threads.
- **Pinned to one commit.** The skill records the head SHA before it starts. If the head changes, it starts again. It checks the SHA again before it posts.
- **No duplicate findings.** It reads the existing threads first. It replies on a thread that already reports a finding.
- **A verdict in full mode.** The full review gives one verdict: Ready to merge, Changes required, or Blocked. A verdict needs verified CI evidence. A missing or pending required check gives Blocked.
- **Re-review.** When you ask for a review again, the skill reviews the current head in full. It marks each earlier finding as resolved, partly resolved, or unresolved.

## Installing

### In Cowork (Claude desktop app)

Download the packaged `code-review.skill` file and open it. The file card shows a **Save skill** button. This button installs the skill into your profile (if your organization allows the creation of skills).

To package the skill yourself from this folder, run this command:

```bash
zip -r code-review.skill SKILL.md
```

Then open the `.skill` file in Cowork and click **Save skill**.

### In Claude Code

Put the `code-review/` folder in your skills directory. Then Claude Code can find it:

- Personal skills: `~/.claude/skills/code-review/`
- Project skills: `.claude/skills/code-review/` in your repo

The folder must contain `SKILL.md`. If Claude Code is already in operation, restart it. Then the skill is available.

To review GitHub PRs, you must install the [`gh` CLI](https://cli.github.com) and authenticate it (`gh auth login`).

## Running it

The skill starts from the type of request, not from its name. The words of the request select the depth:

**Full review**

- "Run a code review on `https://github.com/me/repo/pull/42`."
- "Review PR #17."
- "Code review the current branch's PR."

**Quick review**

- "Run a quick code review on PR #42."
- "Fast review of this PR."
- "Quick review — I just want the obvious stuff."

Claude states which mode it uses before it spends tokens. This lets you change the mode. If the request is not clear, Claude uses a full review.

## Tuning the threshold

The 70 cutoff is in the filter step of both modes in `SKILL.md`. Increase it for fewer findings. Decrease it to see more findings.

If reviews are always empty, the threshold can be the wrong cause. The rubric mixes two different questions: *is this real* and *how often will it occur*. A finding can be real and still get a middle score. This occurs if the finding is latent, fails closed, or the current call path cannot reach it. If you see this pattern, a better solution is possible. Score confidence and severity separately. Filter on confidence. Use severity to set the order.

## Contents of this folder

- `SKILL.md` - the skill definition (both review modes, the scoring rubric, and the PR comment formats).

## Origin

This skill is adapted from the `code-review` command in the [official Claude Code plugins](https://github.com/anthropics/claude-code) marketplace of Anthropic. These are the changes from the original: the confidence threshold changed from 80 to 70, and the quick mode is new. The scoring rubric and comment templates are now separate sections, so both modes share one copy.
