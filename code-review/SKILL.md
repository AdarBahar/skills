---
name: code-review
description: Reviews a GitHub pull request with independent agents. Scores each finding for confidence and posts only the findings that pass. Use when the user asks to review a PR or run a code review. Use quick mode for a quick or fast review. Full mode uses five review agents and gives a merge verdict. Quick mode uses one or two. When the user names no mode, the skill picks the depth from the size of the PR.
allowed-tools: Bash(gh issue view:*), Bash(gh search:*), Bash(gh issue list:*), Bash(gh pr comment:*), Bash(gh pr diff:*), Bash(gh pr view:*), Bash(gh pr list:*), Bash(gh pr checks:*), Bash(gh api repos/*/pulls/*/comments:*), Bash(gh api repos/*/pulls/comments/*), Bash(gh api repos/*/pulls/*/reviews:*)
---

Do a code review of the given pull request.

## Models

- A "Haiku agent" is a subagent with `model: haiku` (Haiku 5.5). Use it for checks, lists, summaries, and scores.
- A "Sonnet agent" is a subagent with `model: sonnet` (Sonnet 5.5). Use it for the review agents.
- Do not change these models. If a model is not available, use the session model and say so in the review.

## Choosing the depth

This skill has two modes. Choose the mode in this order:

1. If the user names a mode, use it. Quick mode: "quick", "fast", "quick review", "fast code review", or `quick` or `fast` as an argument. Full mode: "full", "full review", or "run a code review" with no size hint.
2. Otherwise, choose a tier from the size of the pull request. Get the changed files and their line counts with `gh pr view <number> --json files`. Count the changed lines as additions plus deletions.

| Tier | When | Mode | Review agents |
| --- | --- | --- | --- |
| 1 | Documentation only: every changed file is `.md`, `.txt`, or `.rst` | Quick | 1 |
| 2 | Code, with at most 5 changed files and at most 150 changed lines | Quick | 2 |
| 3 | Code, with more than 5 changed files or more than 150 changed lines | Full | 5 |

For tier 1, use the **Quick review process** with one review agent in step 2. That agent does both tasks, (a) and (b).

In your first message, state the mode and the tier. This lets the user change the mode before the agents use tokens.

The confidence threshold is **70** in both modes.

## Shared rules

### Authority

- Read the repository, the pull request, its linked issues, its checks, and its review threads.
- Post one review comment for each run. In a re-review, also reply on the existing threads. Do not post anything else.
- Do not change code. Do not push, merge, deploy, run workflows, resolve threads, or edit the pull request.

### Pin the head SHA

- Record the head SHA and the target branch before you start. Review only that SHA.
- If the head SHA changes during the run, start again on the new SHA.
- Check the head SHA again before you post. If it changed, review the new SHA first.

### Existing threads

- Read the existing review comments and threads before you post.
- Do not post a finding that the pull request already reports. Reply on its existing thread with new information.

### Review scope

Check these items. Report only real findings that apply to the change.

- Correctness, edge cases, and regressions. Read the callers and the related features of each change. Check them even when their files did not change.
- Security: authentication, authorization, input handling, and secrets.
- Tests: each fix has a regression test. No test is skipped or disabled. Tests are deterministic, with a controlled clock and no timing waits.
- Database migrations: a new migration uses the next number. Do not edit an applied migration. The running release must still work during and after the migration.
- Compatibility: flag each change to an endpoint or to a response that clients use.
- Project rules: apply the rules in the CLAUDE.md of the repository.

### CI evidence and verdict (full mode only)

- List each required check for the head SHA. Give its state: passed, failed, pending, cancelled, or missing.
- Keep two facts apart. "Verified" means that you read the state on GitHub for this SHA. "Reported" means that the pull request body claims it. Name the source of each fact.
- Severity: P1 is critical or high impact and blocks the merge. P2 is a correctness, regression, security, or compatibility issue to fix before the merge. P3 is minor or optional and does not block the merge.
- Confidence (the score) decides whether a finding is posted. Severity orders the posted findings.
- Give exactly one verdict:
  - **Ready to merge**: the review is complete, required checks passed on the reviewed SHA, and no P1 or P2 remains.
  - **Changes required**: one or more P1 or P2 remain, or a required check failed.
  - **Blocked**: the review cannot be completed, or required evidence is missing. For example, a required check is pending, cancelled, or missing. Say why.

### Re-review

- When the user asks for a review again, run a complete review of the current head SHA. Do not stop because an earlier review exists.
- For each earlier finding, check the current code. Classify it as resolved, partly resolved, or unresolved.
- Reply on its thread with the status and the SHA. Do not resolve the thread unless the user asks.
- Check that the fixes add no new problems.

---

## Full review process

Do these steps exactly:

1. Use a Haiku agent to check the pull request. Do not continue if any of these is true: it is closed; it is a draft; it does not need a code review; it already has a code review from you, unless the user asks for a new review. A pull request does not need a code review if it is automated, or if it is very simple and obviously correct.
2. Use a different Haiku agent to give you a list of file paths to the relevant CLAUDE.md files. Do not request the contents of the files. Include the root CLAUDE.md file (if one exists). Also include each CLAUDE.md file in the directories of the files that the pull request changed.
3. Use a Haiku agent to view the pull request. Ask the agent to return a summary of the change.
4. Start 5 parallel Sonnet agents to review the change independently. Each agent should do the task below. Each agent should return a list of issues and the reason for each issue (for example CLAUDE.md adherence, bug, or historical git context):
   a. Agent #1: Audit the changes to make sure that they comply with the CLAUDE.md. CLAUDE.md is guidance for Claude when it writes code. Not all of its instructions apply to a code review.
   b. Agent #2: Read the file changes in the pull request. Then do a shallow scan for obvious bugs. Do not read extra context beyond the changes. Look only at the changes. Find large bugs. Do not report small issues and nitpicks. Ignore likely false positives. Also check the items in **Review scope** that apply to the change.
   c. Agent #3: Read the git blame and history of the code that the pull request changed. Use this historical context to find bugs.
   d. Agent #4: Read the previous pull requests that changed these files. Check if any comments on those pull requests also apply to the current pull request.
   e. Agent #5: Read the code comments in the changed files. Make sure that the changes in the pull request comply with the guidance in the comments.
5. For each issue found in step 4, start a parallel Haiku agent. Give the agent the pull request, the description of the issue, and the list of CLAUDE.md files from step 2. The agent should score each issue on a scale from 0 to 100. The score shows the confidence of the agent that the issue is real and not a false positive. If an issue was flagged because of CLAUDE.md instructions, the agent should double check that the CLAUDE.md names that specific issue. Use the rubric in **Scoring rubric** below. Give the rubric to the agent verbatim.
6. Remove each issue with a score less than 70. If no issue meets this criterion, do not continue.
7. Use a Haiku agent to do the eligibility check from step 1 again. This makes sure that the pull request is still eligible for a code review.
8. Use the gh bash command to add a comment with the result to the pull request. Use the **Full comment format** below. When you write the comment, obey these rules:
   a. Keep your output brief.
   b. Do not use emojis.
   c. Link and cite the relevant code, files, and URLs.
   d. Read the comment back to confirm that it exists.
   e. If you cannot post the comment, print its full text in the chat.

---

## Quick review process

This process costs less and takes less time. It does not use the two dimensions that are slowest and need the most context (git history and prior-PR research). It keeps the two dimensions that find the most issues for each token. Do these steps exactly:

1. Use a Haiku agent to check the pull request. Do not continue if any of these is true: it is closed; it is a draft; it does not need a code review; it already has a code review from you, unless the user asks for a new review. Ask this agent to also return the PR title, the full 40-character head SHA, and the list of changed files. Then you do not need a separate summary step.
2. Start **2 parallel Sonnet agents** to review the change independently. Each agent returns a list of issues and the reason for each issue:
   a. Agent #1: Read the file changes in the pull request and scan for bugs. Look at the diff itself. Do not use broad extra context. Focus on large bugs, for example correctness errors, wrong guards, bad math, and broken control flow. Do not report nitpicks. Also check the items in **Review scope** that apply to the diff. Also flag each comment in the changed lines that claims a behavior that the code does not do.
   b. Agent #2: Find the root CLAUDE.md and each CLAUDE.md in the directories that the PR changed. Then audit the changes for compliance. CLAUDE.md is guidance for Claude when it writes code. Not all of its instructions apply to a review. Ignore process instructions (branching, PR checklists, and running gates). CI does these.
3. Use a **single** Haiku agent to score **all** issues in one pass. Do not use one agent for each issue. Give the agent the PR, the list of issues, and the CLAUDE.md paths found in step 2. Use the rubric in **Scoring rubric** below, verbatim. For an issue that was flagged because of CLAUDE.md, the agent must double check that the CLAUDE.md names that specific issue.
4. Remove each issue with a score less than 70. If no issue meets this criterion, do not continue.
5. Add a comment to the pull request. Use the **Quick comment format** below. Label the comment as a quick review. Then the reader knows the depth of the review. Read the comment back to confirm that it exists. If you cannot post it, print its full text in the chat. Quick mode gives no verdict and no CI status. Do not add the Head and Verdict line to a quick comment.

Quick mode does not repeat the eligibility check. The run is short, so the risk of a change in the meantime is small. If a quick run takes a long time, do the eligibility check again before you add the comment.

---

## Scoring rubric

Give this to the scoring agent verbatim:

   a. 0: Not confident at all. This is a false positive that does not pass a light check, or it is a pre-existing issue.
   b. 25: Somewhat confident. This can be a real issue, but it can also be a false positive. The agent could not verify that it is a real issue. If the issue is a style issue, the relevant CLAUDE.md did not explicitly name it.
   c. 50: Moderately confident. The agent verified that this is a real issue, but it can be a nitpick or it does not occur often in practice. Compared to the rest of the PR, it is not very important.
   d. 75: Highly confident. The agent checked the issue twice and verified that it is very likely a real issue that users will hit in practice. The existing approach in the PR is not sufficient. The issue is very important and directly affects the function of the code, or the relevant CLAUDE.md directly names the issue.
   e. 100: Absolutely certain. The agent checked the issue twice and confirmed that it is definitely a real issue that will occur often in practice. The evidence directly confirms this.

---

These are examples of false positives, for the review and scoring steps:

- Pre-existing issues
- Something that looks like a bug but is not a bug
- Pedantic nitpicks that a senior engineer would not report
- Issues that a linter, typechecker, or compiler finds (for example missing or incorrect imports, type errors, broken tests, formatting issues, and pedantic style issues like newlines). Do not run these build steps yourself. Assume that CI runs them separately.
- General code quality issues (for example lack of test coverage, general security issues, and poor documentation), unless CLAUDE.md requires them
- Issues that CLAUDE.md names, but the code silences on purpose (for example with a lint ignore comment)
- Changes in functionality that are probably intentional or directly related to the broader change
- Real issues, but on lines that the user did not change in the pull request

Notes:

- Do not check the build signal. Do not try to build or typecheck the app. These run separately and are not relevant to your code review.
- Use `gh` to work with Github (for example to get a pull request, or to create inline comments). Do not use web fetch.
- Make a todo list first.
- Do not invent findings. If no finding passes, say so.
- Give each finding a severity, the problem, a reproduction where it helps, and a concrete fix. Write it so another agent can fix it without questions.
- You must cite and link each bug (for example, if you refer to a CLAUDE.md, you must link it).

### Full comment format

Use this format exactly (in this example, you found 3 issues):

---

### Code review

Head: <full sha>. Verdict: <Ready to merge | Changes required | Blocked>. Checks: verified <state>; reported <claim>.

Found 3 issues:

1. <brief description of bug> (CLAUDE.md says "<...>")

<link to file and line with full sha1 + line range for context, note that you MUST provide the full sha and not use bash here, eg. https://github.com/anthropics/claude-code/blob/1d54823877c4de72b2316a64032a54afc404e619/README.md#L13-L17>

2. <brief description of bug> (some/other/CLAUDE.md says "<...>")

<link to file and line with full sha1 + line range for context>

3. <brief description of bug> (bug due to <file and code snippet>)

<link to file and line with full sha1 + line range for context>

Generated with [Claude Code](https://claude.ai/code)

<sub>If this code review was useful, react with a thumbs up. Otherwise, react with a thumbs down.</sub>

---

- Or, if you found no issues:

---

### Code review

Head: <full sha>. Verdict: <Ready to merge | Changes required | Blocked>. Checks: verified <state>; reported <claim>.

No issues found. Checked for bugs and CLAUDE.md compliance.

Generated with [Claude Code](https://claude.ai/code)

---

### Quick comment format

This format is the same as the full format, with two differences. The heading is `### Code review (quick)`. The body for no issues is this text:

---

### Code review (quick)

No issues found in a quick review, which checks the diff for bugs and CLAUDE.md compliance. It does not check git history or prior PR review comments — ask for a full review to cover those.

Generated with [Claude Code](https://claude.ai/code)

---

If you find issues in quick mode, use the numbered-list body from the full format under the `### Code review (quick)` heading. Add this line before the Generated-with footer:

<sub>Quick review: diff and CLAUDE.md only. Ask for a full review to also check git history and prior PR comments.</sub>

---

- When you link to code, use exactly this format. If you do not, the Markdown preview does not show the link correctly: https://github.com/anthropics/claude-cli-internal/blob/c21d3c10bc8e898b7ac1a2d745bdc9bc4e423afe/package.json#L10-L15
  - The link needs the full git sha.
  - You must give the full sha. Commands like `https://github.com/owner/repo/blob/$(git rev-parse HEAD)/foo/bar` do not work, because the system shows your comment directly as Markdown.
  - The repo name must be the same as the repo that you review.
  - Put a # sign after the file name.
  - The line range format is L[start]-L[end].
  - Give at least 1 line of context before and after the line. Center the range on the line that you comment on (for example, if you comment on lines 5-6, you should link to `L4-7`).
