---
name: ui-audit
description: Audit UI code for consistency with the project's existing design rules and for basic UI/UX and accessibility quality. Use when you create, change, or review a frontend page, component, or style file (HTML, JSX/TSX, Vue, CSS, Tailwind classes). Use especially when you add a new feature, page, or element to a UI that already exists. Do not use for backend-only changes.
---

# UI Audit

The goal is one UI that looks like one product. A new element must look like it was always part of the page.

Some rules are adapted from [jakubkrehel/skills](https://github.com/jakubkrehel/skills) (MIT). The original license is in `LICENSE`.

## Read-only: findings, not changes

This skill gives findings and proposed fixes only. It never changes the project.

- Do not edit, create, delete, or move files in the repository.
- Do not run commands that change the working tree: `git checkout`, `git switch`, `git stash`, `git reset`, `git commit`, `gh pr checkout`, a formatter, or a code generator. `git fetch` is permitted, because it changes only `.git`.
- Do not change shared tokens, components, settings, or dependencies.
- Do not open issues, PRs, or comments unless the user asks.
- In the browser, only look, scroll, resize, and press Tab. Do not submit forms, save, delete, or click actions that change data. The app can be signed in to real data.
- Temporary files (an export of a branch, a test page) go in a scratch folder outside the repository. Delete them at the end and say so in the report.
- Tell each subagent that you start to change nothing. These rules apply to it too.

At the end of the report, ask the user which findings to fix. A fix is a separate task that starts only when the user asks for it.

## Evidence, not taste

A finding needs evidence: a file and line, the current code, and a failure that you can show. Examples of a failure are a clip, an overlap, a missing state, a broken contrast pair, or a difference from the project rulebook.

A value that is different from a general number in Step 4 is not a finding. Deliberate project choices are not findings. A documented project rule decides questions of taste. It never excuses an escalation trigger (Step 5).

## Step 1: Find the scope

Find the type of task:

- **Build:** The user asked you to add a feature, page, or element. That task writes the code, not this skill. Use Steps 2, 3, and 4 as the rules for that code. Then audit the new code and report. Do not fix the findings without approval.
- **Change review:** The user names a branch, a PR, or uncommitted changes. Review only the problems that the change caused.
- **Screen review:** The user names a page or a flow. Review all of it, including the empty, loading, error, and narrow-width states.

State the scope at the start of the report. If the scope is too large, run the mechanical checks (Step 4) on all of it. Do the full review on one complete flow. State what you did not review.

**Shared components are in scope.** A screen uses shared components that are in other files: modal, dialog, side panel, menu, toast, table, form fields. Find the shared components that the screens in scope import or open. Add their component files and their style rules to the scope. A problem in a shared component is a problem on each screen that uses it.

**Make sure that you review the current code:**

1. Run `git fetch`. Compare the local branch with `origin/<default-branch>` (`git rev-list --left-right --count HEAD...origin/<default-branch>`).
2. If the local branch is behind, tell the user. For a screen review, review `origin/<default-branch>`. Read it with `git show` or `git archive` into a scratch folder outside the repository. Do not check it out.
3. If you use a running dev server, find which checkout it serves (for example, the working folder of the server process). Compare a visible feature of the page with the code. If they do not match, say which code your browser results come from.
4. State the reviewed commit (short SHA) in the scope. Give all line numbers against that commit.

## Step 2: Find the UI rulebook (always do this first)

Look in this order:

1. A design-system skill for this project (for example a `<project>-design` skill). If one exists, load it. Its rules override Step 4.
2. Project documents: `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, `DESIGN*.md`, `STYLEGUIDE*`, `docs/UI-RULES.md`, Storybook docs.
3. Design tokens: `tailwind.config.*`, CSS custom properties (`:root { --... }`), `theme.ts`, `globals.css`.
4. The shared component library: `components/ui/`, `components/common/`, or similar.
5. Two or three existing pages near the new element. Use them as the reference implementation.

Write a short summary of the rulebook:

- Spacing scale and the usual gaps (sections, cards, form fields).
- Font families, type scale, weights.
- Color tokens by role: background, surface, border, text, accent, success, danger.
- Corner radius, borders, shadow or elevation.
- Shared components: button, input, card, modal, table, toast.
- Theme modes (dark, light), breakpoints, motion easing and duration.
- Vocabulary: the words that the UI uses for the same things.

Name the documents that you found, or say that there are none. If the project has no rulebook, get the rules from the existing pages. Offer to write `docs/UI-RULES.md` from the summary.

**Subagent.** If you can start subagents, give items 2 to 5 to one subagent with `model: sonnet`. Set the model in the call. Tell it to write the summary above, with a file and line for each rule, and to change nothing. Load the design-system skill (item 1) yourself. Read the token values yourself, because the contrast check needs the exact values.

## Step 3: New feature, page, or element in an existing UI

When the UI already exists, consistency has priority over Step 4.

**Map each value to the rulebook:**

| In the new code | Use |
|---|---|
| A value that equals a token | That token |
| A value with no token | The nearest token. List it in the report as "rounded". |
| A rounding of more than 2px, or a color on a different step | Stop and ask the user |
| A control that exists in the shared library | That component, with the correct variant |
| A control with no shared equivalent | Plain markup. Ask if a new shared component is necessary. |

**Rules:**

- Do not add hard-coded hex colors, pixel values, or arbitrary Tailwind values (`p-[13px]`, `text-[#3a3a3a]`).
- Copy the layout pattern from a similar page: header, section spacing, card grid, form layout.
- Use the same words, capitalization, and icon set as the rest of the UI.
- Make the new element work in all theme modes and at all breakpoints that the page supports.
- Give the new element all its states: hover, focus-visible, active, disabled, loading, empty, error.
- If sibling pages show the same type of control, add it to all of them, or tell the user.
- Do not add a new token or a new component variant without approval.
- Do not change code outside the feature. Do not make cleanups on other pages.
- If the existing UI breaks a rule in Step 4, follow the existing UI. Report the problem as `Pre-existing`.

## Step 4: General rules (defaults)

Use these rules only when the rulebook does not cover a topic, or when you build a new UI.

1. **Spacing:** Use a 4px base unit. 1px and 2px borders are permitted. The gap between groups is a minimum of 2× the gap inside a group.
2. **Typography:** Use a maximum of 2 font families. Use only the sizes in the type scale. Show hierarchy with weight and color. Use `tabular-nums` on prices, counters, timers, and number columns.
3. **Color:** Use color tokens only, by role. Keep large areas neutral. Use the accent color only for the primary action, links, focus, and status. Give each view one filled primary action.
4. **Contrast:** Body text 4.5:1. Large text (24px, or 18.67px bold) 3:1. UI borders, icons, and focus rings 3:1. Check both themes.
5. **Target size:** WCAG 2.2 AA requires 24×24px. Use 44×44px on touch screens and 40×40px on desktop when the density permits. The hit area can be larger than the visible element. Hit areas must not overlap.
6. **Focus and keyboard:** Style `:focus-visible`. Do not remove the outline without a replacement. All actions work with the keyboard. Modals trap focus, close with Escape, and return focus to the trigger.
7. **Semantics:** Use `<button>` for actions and `<a href>` for navigation. Each input has a `<label>`. Icon-only buttons have an `aria-label`. Do not use color as the only signal.
8. **Responsive:** No horizontal scroll at 320px width or at 200% zoom. Mobile inputs use 16px text (no iOS zoom). Text containers use `min-height`, not `height`.
9. **Surfaces:** Outer radius = inner radius + padding. Use borders for structure and shadows for elevation.
10. **Motion:** Use the existing easing and duration tokens. Respect `prefers-reduced-motion`. Use transitions, not keyframes, for state changes. Do not use `transition: all`.
11. **Direction:** For Hebrew or another RTL language, use logical properties (`ms-`, `me-`, `ps-`, `pe-`, `margin-inline-start`). Wrap mixed-direction values in `<bdi>`.
12. **Copy:** Buttons start with a verb. Errors tell the user how to correct the problem. Empty states tell the user the next step.

### Mechanical checks

The mechanical checks use the fixed list in [detection-patterns.md](detection-patterns.md). Run each pattern on each run, so that two runs give the same coverage.

1. If you can start subagents, start one subagent with `model: haiku`. Set the model in the call. Do not use the default model. Give it:
   - The full text of `detection-patterns.md`.
   - The folder to search (the repository, or the scratch export from Step 1) and the files in scope, including the shared components and their style rules.
   - These instructions: "Search for each pattern ID. For each ID, return the matches as `path:line` with the matched text, or 'no match'. Do not skip an ID. Do not judge the matches. Change nothing."
2. If you cannot start subagents, do the same search yourself, ID by ID.
3. Check that the result has every pattern ID. Run the search again for each missing ID.
4. Confirm each match yourself in context. The subagent finds leads. It never decides a finding or its severity.
5. A "Failure" match that you confirm is a finding. A "Hygiene" match becomes a finding only when you show a failure. If not, put it under **Notes** in the report.

Some rules need judgment, not a search: rule 3 (one primary action), rule 7 (color as the only signal), and rule 12 (copy). Check them yourself while you read the pages in scope.

**State paths in the code.** For each data view in scope, read the loading, empty, and error branches in the code (for example a `catch` block, an `error` state, or a status check). This check needs no browser. For each error branch, check these points:

- The message matches the cause. For example, a network error must not say "not found".
- The user can recover: Try again, a link back, or a clear next step.
- The view uses the shared loading, empty, and error components of the rulebook.

Rule 12 can be `Clear` only after this check. In the coverage table, name the error branches that you read.

## Step 5: Severity

- **HIGH:** The problem stops a task, hides content or a control, misleads the user, or repeats across the product.
- **MEDIUM:** The problem makes the UI harder to understand or use, or breaks consistency with the rulebook.
- **LOW:** A small polish problem in one location.

**Escalation triggers.** These are always HIGH, on every surface:

- An interactive control with no accessible name.
- A control with no visible focus indicator.
- A focus indicator with a contrast under 3:1 against an adjacent color (WCAG 1.4.11). A shared focus-ring token under 3:1 is HIGH, also when it passes on some surfaces.
- A control that works with a pointer but not with the keyboard.
- Motion that ignores `prefers-reduced-motion`.
- Content or a control that is clipped or not reachable at 320px width or 200% zoom.
- Text that fails its contrast ratio.
- A state or meaning that only color shows.
- A destructive action with no confirmation, no undo, and no distinct style.
- Truncated content with no way to see the full value.
- An error message that does not tell the user how to recover.
- A semantic color used against its meaning (for example, the danger color on a safe action).

## Step 6: Change review

For a branch, a PR, or uncommitted work:

1. Find the base with `git merge-base origin/<default-branch> HEAD`. Include untracked files from `git ls-files --others --exclude-standard`.
2. Do not review lockfiles, `dist/`, `build/`, snapshots, or vendored code. Name what you excluded.
3. **Blast radius.** For each changed component, review its direct consumers. For a changed token or theme value, search for the token name. Review a maximum of 5 consumers. Say how many you did not review.
4. **Removed lines.** Search the `-` side of the diff for removed `aria-`, `alt=`, `<label`, `focus`, `outline`, `tabindex`, `prefers-reduced-motion`, `dir=`, and logical properties. A removal is a regression only if nothing in the change replaces it.
5. **Classify** each finding by cause:
   - `Introduced`: the change created it.
   - `Regression`: the change made something worse that was correct before.
   - `Pre-existing`: the problem was there before the change, and the change did not make it worse. Report a maximum of 3.
6. **Incomplete change.** Read the PR title and the commit messages. Look for missing states, missing theme modes, and sibling pages without the new control.

Do not run `git checkout`, `git switch`, `git stash`, or `gh pr checkout`. Read a PR with `git fetch origin pull/<n>/head:refs/remotes/pr/<n>` and `git show`.

## Step 7: Proposed fixes

Write a proposed fix in the `After` column of each finding. Do not apply it (see "Read-only").

When more than one fix works, propose the first that works:

1. **Delete:** remove a separator, an animation, or an ARIA attribute that is not necessary.
2. **Use the platform:** a native element or the browser focus ring.
3. **Reuse:** an existing token, component, or spacing step.
4. **Correct:** change the value to the correct one.
5. **Add:** a new token, component, or attribute.

Mark each fix that changes a shared token, a shared component, or other pages. The user must approve these fixes separately.

## Step 8: Verify

**Find the app first.** Do not mark the browser checks `Not verified` before you do these steps:

1. List all local listening ports: `lsof -nP -iTCP -sTCP:LISTEN`. Include SSH tunnels (the command is `ssh`). A dev server on another machine often has a tunnel to a local port.
2. For each likely port, open the page. Compare its title or a visible feature with the code in scope. A port can serve a different project.
3. If no port serves the app, ask the user for the URL. Then wait for the answer.
4. Mark the browser checks `Not verified` only when the user has no URL, or the app does not load.

State the URL that you used, and which commit it serves, if you can find it.

Without a browser, check the code only. With a browser (Claude in Chrome or the `run` skill), check these:

- The widths that the page supports, and 320px.
- 200% zoom.
- Dark and light mode.
- A complete keyboard pass with Tab.
- The RTL mirror if the page uses Hebrew.
- Contrast (see below).

**320px width.** Chrome has a minimum window width, near 500px. Use the first method that works:

1. Device emulation in DevTools, or a resize of the window, if the browser tool supports it. This gives a real 320px viewport.
2. A temporary HTML page in a scratch folder outside the repository, with `<iframe src="<page URL>" width="320" height="800">`. This works only when the page needs no sign-in. A signed-in app usually shows its sign-in screen in the frame, because the frame does not get the session cookie. Do not sign in inside the frame.
3. A root zoom in your own tab: `document.documentElement.style.zoom = "<viewport width / 320>"`. This is a simulation. Container queries react to it, but `@media` width rules do not. Remove the zoom after the check.

Record the method and the viewport width. Mark each result from method 3 as "simulated" in the findings and in the Verification section. If no method worked, mark 320px as `Not verified`.

**Contrast.** Use one method each time:

1. List each text/background token pair and each border, icon, or focus-ring/background pair that the UI uses. Do this for each theme.
2. Compute the WCAG 2 contrast ratio from the token values with a short script: relative luminance of each sRGB color, then `(L1 + 0.05) / (L2 + 0.05)`.
3. For a color with alpha, first blend it on its real background.
4. Compare each ratio with Step 4, rule 4. Report each failed pair with its ratio. Measure 1 or 2 pairs in the live page to confirm the token values.

Mark each check that you did not run as `Not verified`. Do not report a visual result that you did not see.

## Step 9: Report

**Scope:** the task type, the files or pages, the rulebook documents that you found, and what you excluded.

**Findings:** one row for each root cause, with all locations in the same row. Report a token or shared-component problem once, against its source. Order by severity, then by the number of locations.

| Severity | Status | Location | Before | After | Why |
|---|---|---|---|---|---|
| HIGH | Introduced | `src/Card.tsx:42` | `<div onClick>` | `<button>` | The control does not work with the keyboard |

The `Status` column is necessary only for a change review. Keep each cell short. If a `Before` or `After` value is longer than a few words, write "see below" in the cell. Then put the full value in a numbered list under the table. List the values that you rounded to a token. If there are no findings, write "No actionable UI findings."

**Coverage:** one row for each Step 4 rule (1 to 12) and one row for each Failure pattern ID in `detection-patterns.md`. Do not omit a row.

| Check | Result | Evidence |
|---|---|---|
| Rule 5: Target size | Finding | `.icon-button.small` 26px, see finding 4 |
| A1: `outline: none` with no replacement | Clear | 3 matches, each has a `focus-visible` style |
| L5: physical properties on an RTL page | Not checked | The app has no RTL page |

- `Finding`: a row in the findings table.
- `Clear`: you checked and found no problem. Give the evidence: the search, the files, or the browser check.
- `Not checked`: give the reason. A check that does not apply (for example, RTL on a page with no RTL) is `Not checked` with the reason "does not apply".

**Notes:** hygiene pattern matches with no failure that you showed (see `detection-patterns.md`). Put them on one line each. They are not findings.

**Verification:** each check, the command or steps, and the result. Name each subagent that you started, with the model that ran (for example "pattern search: `haiku`"). If a subagent did not use the model that this skill names, say so. List the `Not verified` checks separately.

**Verdict:**
- `Block`: one or more HIGH findings remain.
- `Approve`: no HIGH findings remain. MEDIUM and LOW findings stay in the table as work to do.

**Next step:** Name the temporary files that you deleted. Then ask the user which findings to fix. Do not start a fix in the same turn.
