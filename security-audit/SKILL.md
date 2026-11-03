---
name: security-audit
description: Security guidance and vulnerability review for codebases, APIs, services, CLI tools, libraries, and daemons. Use for security questions, focused reviews, vulnerability research, security audits, or pen tests. Run the complete workflow only for explicit codebase audit or pen-test requests, full/comprehensive/end-to-end reviews, or requested report artifacts.
---

# Security Audit

Find vulnerabilities that violate a real trust boundary. Give the owners the source evidence, a safe reproduction, the priority, and the smallest effective fix. This is a defensive workflow that starts from the source. A candidate is not a confirmed finding if it has no concrete affected principal, resource, or security outcome.

## Operating modes

This skill is guidance by default. The load of this skill does not authorize the complete audit workflow or the creation of files.

- **Guidance mode**: Use this mode for security questions, focused reviews, methodology, triage, or investigation of specific findings. Use only the relevant parts of this skill. Do not automatically run all six phases. Do not create an output directory or write audit artifacts. You may launch focused agents when they are useful. They return results to the current task.
- **Full audit mode**: Use the complete workflow when the user explicitly asks to audit or pen-test a codebase. Also use it when the user asks for a full, comprehensive, or end-to-end security review, or requests report artifacts. Run all six phases. Write the files that this skill defines.

If the request could mean either mode, ask one focused question. Ask it before you create files or start the complete workflow.

## Platform terminology

This skill is agent-neutral:

- **Parent** is the agent that coordinates the run and owns the shared state.
- **Task tool** is the delegation or sub-agent mechanism of the platform.
- **`research` agent** is a delegated agent for focused source exploration and factual verification.
- **`general` agent** is a delegated agent for broad investigation and bounded local execution.
- **`subagent_type:`** in a heading names which of these two delegated agent roles runs that work.

Use equivalent platform capabilities. Keep the role, write-isolation, prompt, and independence boundaries.

## Universal execution safety

These rules apply in both operating modes. Source inspection is read-only. Run target-controlled builds, tests, processes, browsers, emulators, fuzzers, and fixture processing only inside an OS-enforced sandbox that provides all of these controls:

- no external network. Use only an isolated loopback namespace when the check needs local client/server traffic;
- an empty environment that an explicit allowlist populates with safe values, with scratch-local `HOME`, temporary directories, and caches;
- a read-only target and toolchain, where the target-controlled process can write only inside its assigned `scratch/` directory; and
- explicit low CPU, memory, process, file-size, disk, and wall-clock limits.

The agent can make a disposable source copy in an assigned `scratch/` directory when a build must write beside the source. The agent makes the copy outside the target-controlled process. In guidance mode, do not retain target-controlled files. In full audit mode, only trusted parent-side code can promote the minimum non-secret result to the retained `artifacts/`. Use the procedure under Write isolation. Never expose these items to target code:

- a retained output directory (other than the assigned `scratch/` directory of the agent itself);
- the directory of another agent;
- the host home directory;
- credentials, sockets, or shared services.

Do not install dependencies. Do not let builds fetch them. Use only the tools and dependencies that are already available locally. If you cannot enforce every control, do not execute target code. Report the missing sandbox capability as a needs-validation blocker. Give a safe validation plan.

Use dummy principals, fixtures, and secrets. Do not probe deployed endpoints, external services, shared infrastructure, production identities, data of other users, or live control planes. Do not test availability against a live or shared process. Do not publish artifacts, alter releases, or spend paid API quota. Do not continue beyond the minimum local effect that establishes a defect. If the decisive fact is outside the source or the sandboxed fixture, report that it needs validation.

## Owner rules

These rules apply in both operating modes. They add to the rules above.

- Never connect to a production host, run commands on it, or change it without first asking the user.
- Name each read-only command before you run it on a production host.
- Never print secret values. Report only that a secret exists and where it is.
- Do not read `.env` files, key files, or credential stores outside the target repository.
- Do not write audit output into a synced folder, such as a cloud drive or an Obsidian vault.
- On macOS, run target code only in a Linux container or virtual machine with networking disabled.

## Stack notes

The owner mainly builds the systems below. Load the companion file that matches the target:

| Target | Companion files |
| --- | --- |
| Node.js or TypeScript services, npm packages | SUPPLY-CHAIN-AND-RELEASE.md, WEB-PROTOCOL-AND-AUTH.md, DATA-ISOLATION-AND-LIFECYCLE.md |
| Python services and scripts | SUPPLY-CHAIN-AND-RELEASE.md, WEB-PROTOCOL-AND-AUTH.md |
| Docker images and servers | CLOUD-AND-DEPLOYMENT.md, HOSTING-STANDARD.md |
| PostgreSQL-backed apps | DATA-ISOLATION-AND-LIFECYCLE.md, HOSTING-STANDARD.md |
| LLM assistants and bots | AI-AND-LLM.md |
| Android apps | DESKTOP-MOBILE-AND-LOCAL-IPC.md |
| Browser extensions | CLIENT-SIDE.md |

## Full audit setup

In full audit mode, resolve these values before reconnaissance:

- **Skill directory**: the absolute directory that contains this `SKILL.md`.
- **Target**: the absolute repository root under review.
- **Repo name**: a stable repository identifier from the directory or the local Git remote.
- **Output directory**: a new writable directory outside the target. The default is `~/security-audits/<repo-name>/run-<N>`, where `<N>` is the next unused integer. Use a directory inside the target only when the user explicitly selects it and the parent verifies that version control ignores the whole directory. If not, stop and request an external path.
- **Source ref**: the reviewed commit and whether the worktree is dirty. Do not treat unreviewed generated or modified files as another revision.

### Write isolation

The parent creates these shared run files. The parent is the only writer of these files:

- `run-metadata.json`
- `architecture.md`
- `coverage-ledger.json`
- `findings.json`
- `REPORT.md`
- `FINDINGS-DETAIL.md`
- `NEEDS-VALIDATION.md`

Each hunter or verifier receives a unique root under `<output-dir>/agents/<agent-id>/`. The root has separate `scratch/` and `artifacts/` directories. Canonical agent IDs match `^[a-z0-9][a-z0-9_-]{0,63}$`. An ID must not equal a Windows device name such as `con`, `prn`, `aux`, `nul`, `com1` through `com9`, or `lpt1` through `lpt9`. Lowercase IDs prevent case-fold collisions.

The agent and every target-controlled process can write only to `scratch/`. The parent owns the retained `artifacts/`. The sandbox never sees `artifacts/`. Only trusted parent-side promotion code can write to it. Agents must not change shared files, target source, retained artifacts, or the directory of another agent. Do not use `/tmp` or the host home directory as a writable fallback.

Before execution, the parent opens and retains trusted, non-inheritable directory descriptors. It does this for the `scratch/` and `artifacts/` roots of the agent. The parent also records an allowlist of expected scratch-relative artifact files. It records explicit per-file and cumulative byte limits. Never pass those descriptors to the agent or the sandbox. After the sandbox and all its processes end, trusted parent-side code promotes each allowlisted file separately:

1. Validate the declared relative path: reject absolute, empty, `.`, `..`, or symlinked components.
2. Walk each parent component from the retained scratch-root descriptor with no-follow directory-relative operations; never reopen by path.
3. Open the leaf no-follow and nonblocking.
4. Verify with `fstat` that it is a regular file with link count exactly one and within the recorded per-file and cumulative byte limits.
5. Enforce those limits again while you read from that descriptor.
6. Copy exactly the verified size, repeat `fstat`, and reject a changed identity, type, link count, or size.
7. For the destination, walk every parent component from the retained artifacts-root descriptor with no-follow directory-relative operations. Require each existing component to be a real directory. Create any missing directory exclusively before you reopen and verify it no-follow.
8. Create the leaf exclusively without following links. Verify that the opened destination is a regular file with link count exactly one. Copy from the verified source descriptor without reopening either path.
9. Use equivalent race-safe APIs on non-POSIX systems.
10. Never recursively copy or glob scratch. Never extract an archive into artifacts. Never open or promote a symlink, FIFO, socket, device, directory, hard-linked file, changing file, or file that exceeds its bound.
11. If any check is unavailable, cannot be enforced, or fails, discard the scratch entry; if it is decisive evidence, retain `needs_validation` with the exact promotion blocker.

[HUNTING.md](HUNTING.md) and [VALIDATION-AND-REPORTING.md](VALIDATION-AND-REPORTING.md) carry this procedure as one identical fenced block for hunter and verifier prompts. The block states the same rules in the same order as this list.

For a reproduced check, record these items: the command, the exact test input, the sandbox limits, and the allowlisted environment variable names. Also record the safe non-secret values that are necessary to reproduce the check. Never capture or copy the ambient environment, inherited variables, credential values, authentication state, or unrelated host paths. Launch from an empty environment. Do not try to redact an environment after execution.

Before delegation, the parent writes `run-metadata.json` with at least these items: `run_id`, `repo`, `target`, `source_ref`, `profile`, `scope_paths`, `budget` (null if unset), `execution_policy: "sandboxed-source-and-local-only"`, selected companion files, prior-run paths, shared-file owners, and `run_status: "in_progress"`. Update the metadata only when those facts change. The state of a candidate belongs in the coverage ledger and in `findings.json`.

## Full audit planning

The requirements for coverage, prior runs, profile, and budget in this section apply only in full audit mode.

### Coverage and prior runs

No single pass is complete. Build a deterministic coverage plan before hunting. Update it after every agent result. [RECONNAISSANCE.md](RECONNAISSANCE.md) defines the stable coverage units. [HUNTING.md](HUNTING.md) defines the coverage-critic waves. Only the parent updates the ledger.

If prior runs exist, read every compatible `coverage-ledger.json` and `findings.json`. Read them before you plan the current run:

1. Compare the relevant current source with each prior record and unit. A prior source ref alone is not evidence that a path is unchanged.
2. Carry a prior `confirmed` record into the current candidate set only when its relevant source and conditions are unchanged and its evidence still meets the current contract. Link it to a current ledger unit that is seeded `planned`. Preserve its fingerprint. Exclude only that carried root cause from hunters. Send the carried record through the current final verification path. The Phase 3 verifier that re-checks it becomes the assignment owner of that unit and moves the unit to `candidate`.
3. When the relevant source for a prior `confirmed` record changed, create a current planned revalidation unit. Do not put that record on the hunter exclusion list. The record stays confirmed only if current independent validation establishes the current path and result.
4. Make prior `needs_validation`, `deferred`, `blocked`, `out_of_scope`, and any changed-source unit current work. You may carry a still-external `needs_validation` record only after you check the current source trace. Link it by fingerprint to a current `planned` unit. The verifier re-check of that unit supplies its owner and evidence. The record keeps the unresolved blocker. These prior states never suppress a current unit.
5. A prior same-source covered unit can inform the priority, but it stays visible in the current ledger. A prior `rejected` record suppresses only the unchanged failed claim. It does not suppress coverage of its unit. Changed evidence creates current work.
6. Read the prior profile and scope. A prior `quick` or scoped ledger contributes only its recorded evidence and gaps. It never implies that "the rest is fine."

If no prior ledger exists, say so in the final coverage statement. Never imply that one run exhausts the target.

### Run profiles and scope

During full audit setup, pick a profile from the request of the user. Or propose a profile from the size and stakes of the target. Record it in `run-metadata.json` (`profile`, `scope_paths`) and state it in the report. The default is `standard`.

- **`quick`** — a bounded pass for small targets, re-runs, or a fast first look. Make the ledger units coarser: surface × boundary × attack class. The subsystem uses the fixed canonical `profile/quick/all-in-scope-subsystems` identifier. Run exactly one hunter wave and then exactly one final coverage-critic pass. Use one fresh verifier for each candidate, for both candidate validation and final record verification. Do not launch a follow-up hunter wave. Record the accepted discoveries and reassignments of the critic as `deferred`.
- **`standard`** — the workflow as written.
- **`deep`** — for high-stakes or large targets. Split ledger units for each subsystem and lifecycle mode. Run critic waves until a clean pass. Keep candidate validation and final record verification as separate fresh agents. Give `prior_covered_same_source` units an independent second pass.

A **scoped run** audits a subset: named paths, one subsystem, one companion domain, or the diff between two source refs. Seed ledger units only for in-scope surfaces. Record everything else as `out_of_scope`, and never as `covered`. A scoped or `quick` run must present itself as partial coverage.

Profiles change the breadth and the redundancy. They never change the evidence bar. Do not scale away any of these items:

- the candidate gate;
- the source/local execution boundary;
- the `needs_validation` discipline;
- schema validation;
- independent verification of `confirmed` records.

#### Cost budget

The ledger makes the spend countable. One unit is roughly one hunter assignment. One surviving candidate is one or two verifier assignments, which depends on the profile. The user can set a budget, or the parent can propose one for a large target. In that case, record `budget` in `run-metadata.json` as a maximum number of agent invocations across all phases.

Apply the strict budget gate before you launch any reconnaissance agent. Reserve the four baseline reconnaissance calls. Reserve one final post-wave critic for `quick`. For `standard` or `deep`, reserve one post-wave critic and one distinct final-clean critic. Reserve at least one verifier call. Add focused reconnaissance only after you repeat this gate for each extra call. If the requested budget cannot fund that minimum, launch no agent. Ask for a larger budget, a narrower scope, or a different profile. If the request remains unchanged, set `run_status: "incomplete"` with `incomplete_reason: "budget_cannot_fund_reconnaissance_and_reserves"`. Report that no audit pass ran.

Spend the budget in this order:

1. Count reconnaissance, every post-wave critic, and the separate final-clean critic as agent invocations.
2. **Reserve critics and validation before hunting.** For `quick`, reserve its one post-wave final critic. Before every `standard` or `deep` hunter wave, reserve one immediate post-wave critic and one distinct final-clean critic. Also reserve the verifier cost from the profile. Reserve about 1 or 2 agents for each expected candidate. When in doubt, reserve 30% of the balance after the critic reservation. Never assign hunters into either reserve.
3. Assign hunters to units in priority order until the hunting allowance is spent. Spend the reserved post-wave critic immediately after that wave. Keep the final-clean reserve and the validation reserve intact.
4. Before a later wave, reserve its new post-wave critic again. Check whether the remaining budget covers the required critic calls and the validation reserve. If it does not, launch no hunters from that wave. Mark its planned units `deferred` with reason `budget_cannot_reserve_critics_and_validation`. Use the retained final-clean critic to record the resulting gap.

Before wave 1, update the pre-recon estimate with the seeded units, the implied hunter count, the mandatory critic calls, the validation reserve, and whether the remaining budget covers the plan. If the budget clearly cannot cover the plan, say so. Propose a tighter scope or a coarser profile. Do not silently thin the evidence. If later facts consume the required final-critic reserve, launch no hunters and mark all planned work deferred. Set the run incomplete with reason `critic_budget_exhausted`. Make no complete-coverage claim.

An unexpectedly large candidate set can exceed a strict total-agent budget. A material Phase 5 replacement that needs another independent verifier can also exceed it. Suppose the remaining budget cannot validate every candidate. Then stop hunting and validate candidates in fingerprint order while the budget permits. Set `run_status: "incomplete"` and `incomplete_reason: "validation_budget_exhausted"`. Keep each unvalidated fingerprint linked to a `candidate` ledger unit with that unresolved reason. Do not put an unvalidated candidate in `findings.json`. Do not relabel it `needs_validation`. Do not report the run as complete. Phase 6 can produce a partial report only if its first section states that candidate validation is incomplete and lists the affected fingerprints and units. Never exceed a user-set strict budget silently.

## Core principles

### Require a boundary and result

For every candidate, name these items:

- the lower-trust principal;
- the accepted input or action;
- the intended control;
- the crossed boundary;
- the affected principal or resource;
- a concrete result that you observed or that the owner can observe.

Do not elevate any of these to a security finding: a missing best practice, a guessed deployment behavior, a generic parser crash, or self-impact.

### Use bounded local evidence

Static analysis establishes the source path. Sandboxed local tests resolve the behavior when all execution controls are available. Examples are a minimal function harness, an existing unit test, or a small parser fixture. Other examples are a dummy-tenant integration test, a locally rendered configuration, or a bounded isolated-loopback client. Stop at a wrong return value, an unauthorized dummy record, a sanitizer finding, a policy difference, or another minimum effect. Do not extend the local check beyond the minimum boundary result. Do not produce material for persistence, post-fault, or concealment.

### Respect source visibility

Deployment controls, proxy behavior, provider settings, browser headers, identity policy, broker ACLs, packaging, and topology are real controls. Sometimes a control is required but absent from the repository. In that case, do not assume that it is present or absent. Use `needs_validation` with the exact missing fact and a safe plan. The plan is an owner-observed check or a local check.

### Separate priority from certainty

Only `confirmed` records receive a severity. The likelihood and the impact must reflect the demonstrated conditions and result. The overall severity cannot exceed the demonstrated impact. `needs_validation` means that a specific, source-grounded boundary hypothesis is blocked. It is not a low-confidence confirmed vulnerability, and it has no severity.

Calibrate the overall severity with these anchors:

- **critical** — an unauthenticated actor gains code execution, full data-store access, or takeover of arbitrary accounts.
- **high** — an actor fully defeats an explicit security control, with real consequences. Examples: authentication bypass, cross-tenant read or write, stored script execution that affects other users, authenticated code execution, or an unauthenticated remote stop of a shared service.
- **medium** — a real boundary violation with a limited blast radius, uncommon preconditions, or consequences that stay in a narrow resource set.
- **low** — disclosure of non-secret internals, or an effect that needs sustained effort for minimal gain.
- **informational** — a confirmed observation of minimal impact. It is useful mainly as a prerequisite inside a larger finding.

The high/medium discriminator is this question. Does the demonstrated result fully defeat an explicit control for an action with real consequences? Or does it only weaken the control? If you cannot state the concrete damage, the severity is lower than it feels.

### Recommend the smallest effective source fix

For each confirmed finding, identify the invariant that the code must enforce. Identify the narrowest source change that enforces it at the last trusted decision point. Prefer specific repository-relative changes and regression tests over generic hardening advice. The audit describes fixes. It does not modify the target source.

## Full audit workflow

In full audit mode, follow all six phases in order:

1. **Reconnaissance** — map the source, trust boundaries, local build paths, companion selections, prior evidence, and the initial deterministic coverage ledger. Use [RECONNAISSANCE.md](RECONNAISSANCE.md).
2. **Coverage-led hunting waves** — assign isolated hunters from the ledger and collect structured candidate results. Use [HUNTING.md](HUNTING.md), [ATTACK-CLASSES.md](ATTACK-CLASSES.md), and the selected domain companions.
3. **Candidate validation** — consolidate fingerprints. Give every candidate to a fresh source verifier, as [VALIDATION-AND-REPORTING.md](VALIDATION-AND-REPORTING.md) defines.
4. **Structured output** — write all final `confirmed`, `needs_validation`, and `rejected` records to `findings.json`. Validate it with `report-schema.json` and `validate-findings.cjs`. Validate the coverage claim with `validate-coverage-ledger.cjs`.
5. **Independent record verification** — use fresh agents to verify the final source claims. Use them also to reconcile corrections or state changes.
6. **Target-neutral report** — derive `REPORT.md`, `FINDINGS-DETAIL.md`, and `NEEDS-VALIDATION.md` from the final records. Do not include live-probe instructions.

Do not end the run before one of exactly two terminal states. In state (a), all Phase 6 artifacts are written and both validators pass. In state (b), `run_status: "incomplete"` is recorded with its exact reason, and the gap is disclosed in the report. Never stop in the middle of a phase.

## Anti-patterns

1. Checklist deviations that are presented as vulnerabilities.
2. Defense-in-depth advice with no reachable boundary violation.
3. Live or shared-environment tests where bounded local evidence is not sufficient.
4. Guesses about provider, proxy, browser, identity, or deployment behavior that is not present in the source.
5. Intended same-principal authority or self-impact that is treated as a cross-boundary result.
6. A report of a parser or runtime effect that is stronger than the observed effect.
7. Prose-only hunter results that cannot be deduplicated or verified.
8. A new report of carried same-source prior confirmed records, or their use as exemplars that anchor the hunt.
9. A severity assigned to `needs_validation` records.
10. A report written before independent verification, or prose and JSON that disagree.
