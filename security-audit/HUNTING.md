# Vulnerability Hunting

### Phase 2: Run coverage-led hunting waves

The parent assigns `planned` ledger units to `general` agents. Use enough focused hunters to cover the units. Do not combine unrelated boundaries. One hunter can own closely related units in one subsystem. An agent-count limit must not leave a unit silently unassigned. A unit that the budget cannot reach is explicitly `deferred` with reason `budget_cannot_reserve_critics_and_validation`.

A budget or profile can cap the hunter count. In that case, assign units in priority order and record the ordering rationale in the ledger. Rank by these criteria in this order. (1) Rank unauthenticated or lowest-trust entry surfaces before authenticated ones. (2) Rank boundaries that protect the most valuable resources (credentials, cross-tenant data, code execution, release authority). (3) Rank prior-run gaps, revalidation targets, and changed source before same-source re-passes. (4) Rank units whose class historically yields confirmed findings for this target type before speculative units. Break ties lexicographically by `coverage_id`, so that runs stay deterministic.

Before launch, the parent changes the assigned units to `in_progress`, sets a canonical lowercase `agent_id`, and creates the `scratch/` and the parent-owned `artifacts/` of that agent. Hunters read the source and the context that the parent provides. They write only to their unique `scratch/`. They return one structured result through the Task tool. They never write retained artifacts. They never edit the target source, `architecture.md`, `coverage-ledger.json`, `findings.json`, or the files of another agent.

## Required hunter prompt

Every hunter prompt contains these parts in this order:

1. A role preamble of two sentences. The first sentence states that the goal of the hunter is to find source-grounded security invariant failures in its assigned units. The second sentence states that the hunter must return exactly one JSON object that matches the structured-result contract at the end of this prompt.
2. `architecture.md` verbatim.
3. The assigned coverage IDs, subsystem, boundary, repository-relative starting paths, and the assignment block map of each unit from `coverage-ledger.json`.
4. The exact selected blocks, copied verbatim. These are each selected ordinary attack-class block from `ATTACK-CLASSES.md`, and, from each selected companion, its `Core discipline`, each chosen attack-class subsection, `Universal moves`, and `Validation rules`. Ordinary blocks are self-contained. They have no companion-style `Core discipline`, `Universal moves`, or `Validation rules` sections. Do not send block or companion names alone.
5. The excluded ordinary and companion blocks, explicitly, with a reason for each exclusion.
6. The core hunting method below, followed by the promotion procedure block.
7. The core validation rules below.
8. The carried same-source prior confirmed exclusions, each limited to fingerprint, title, and root cause. Also the peer-owned current coverage IDs that this hunter must not duplicate.
9. The unique scratch and artifact paths, the safe agent ID, the predeclared promotion allowlist and byte limits, and the structured-result contract. The contract includes the Structured hunter result block below and the `confirmed` and `needs_validation` branches of `report-schema.json`, copied verbatim.

A prompt can select several companion blocks when the same path crosses several domains. Keep their constraints together. The scope is the coverage obligation of the hunter. It is not permission to duplicate excluded work. If an unexpected different boundary appears, return it under `uncovered`. Then the parent creates a stable ledger unit and assigns it in the next wave.

#### Core hunting method — include in every hunter prompt

```text
## Defensive vulnerability-finding method

Your goal is to find source-grounded security invariant failures and the smallest fix,
not to expand harm beyond the boundary result. Stay within source review and bounded local execution.
Do not contact deployed endpoints, provider APIs, registries, identity systems,
message brokers, shared services, or other users. Use local dummy data only.

READ THE CODE AT DEPTH. Follow each assigned input through parsing, identity,
authorization, normalization, state, derived copies, and the final sink. Read sibling,
legacy, batch, retry, cancellation, migration, and error paths that produce the same
effect. Compare sibling controls for equivalence, not only presence, and compare what
one component guarantees with what the next component assumes.

WORK FROM A CONCRETE INVARIANT:
1. Name the lower-trust principal and starting capability.
2. Name the accepted value, action, state transition, or resource selector.
3. Locate the control that should reject, bind, isolate, limit, or revoke it.
4. Trace the exact source path after that decision.
5. Stop at the smallest affected dummy record, wrong return value, process-integrity
   effect, or locally observable shared-resource effect.
6. State a source-level change and regression case that enforce the invariant.

DEPTH BOUND: trace only paths that can reach your assigned boundary or whose
guarantees that boundary relies on. Stop a line of investigation as soon as the
invariant is settled either way, and record the result in your structured output —
a covered, candidate, or blocked disposition, or an `uncovered` entry — instead of
continuing to search.

TEST SAD PATHS AND DISAGREEMENTS. Check absent, empty, zero, negative, maximum,
over-limit, duplicate, mixed encoding, stale, revoked, reordered, concurrent,
partially migrated, failed dependency, and rollback state only where the interface
accepts them. Compare canonicalization and units at every parser or policy handoff.
For multi-step issues, treat each output as a prerequisite and do not assume a later
boundary. If any prerequisite is not established, record a blocker.

When a proposed high or critical candidate reveals a reusable root cause, search paths
owned by the assigned coverage IDs for lexical, structural, and logical variants.
Consolidate the same root cause, but establish each variant's conditions and impact
independently. Do not investigate peer-owned units. Return a variant with no current
coverage unit as `uncovered`.

USE THE NARROWEST LOCAL CHECK THAT SETTLES THE CLAIM. Target-controlled builds,
tests, processes, browsers, emulators, fuzzers, and fixture processing may run only
inside the parent-approved OS-enforced sandbox. It must disable external networking,
start from an empty allowlisted environment, expose target and tools read-only, permit
writes only to your scratch directory, and apply low CPU, memory, process, file-size,
disk, and wall-clock limits. Isolated loopback is allowed only for a local fixture.
If any control is unavailable, do not execute: return needs_validation with that exact
blocker. Prefer an existing unit test, minimal function harness, dummy-tenant service
call, small malformed fixture, deterministic race schedule, or locally rendered policy.
Do not install or fetch tools.

Record the exact input, command, limits, and minimum result. For the environment,
record only allowlisted variable names and safe non-secret values needed to reproduce
the check. Never capture the ambient environment, inherited variables, credentials,
authentication state, or unrelated host paths. The target-controlled process writes
only in scratch. After the sandbox and all its processes terminate, only trusted
parent-side code may promote predeclared scratch-relative files, following the
promotion procedure block included verbatim in this prompt. You and target code never
write retained artifacts. If promotion is unavailable or fails for decisive evidence,
return needs_validation with the exact promotion blocker.
Never stress availability, invoke a live target, use a real credential, publish an
artifact, or continue past the minimum observed effect.

A deployment, browser, provider, broker, OS, proxy, package, secret, or identity fact
outside source is not proof either way. If one such fact is decisive, return a
needs_validation record with the exact missing observation and safe owner-observed check.
```

#### Promotion procedure — copy this promotion procedure verbatim into every hunter prompt

```text
Artifact promotion procedure (trusted parent-side code only):
Reference only for you: the parent performs these steps; you never perform them.

Before execution, the parent opens and retains trusted, non-inheritable directory
descriptors for the agent's scratch/ and artifacts/ roots, and records an allowlist
of expected scratch-relative artifact files plus explicit per-file and cumulative
byte limits. Never pass those descriptors to the agent or sandbox. After the sandbox
and all its processes terminate, trusted parent-side code promotes each allowlisted
file separately:

1. Validate the declared relative path: reject absolute, empty, `.`, `..`, or
   symlinked components.
2. Walk each parent component from the retained scratch-root descriptor with
   no-follow directory-relative operations; never reopen by path.
3. Open the leaf no-follow and nonblocking.
4. Verify with `fstat` that it is a regular file with link count exactly one and
   within the recorded per-file and cumulative byte limits.
5. Enforce those limits again while reading from that descriptor.
6. Copy exactly the verified size, repeat `fstat`, and reject a changed identity,
   type, link count, or size.
7. For the destination, walk every parent component from the retained
   artifacts-root descriptor with no-follow directory-relative operations; require
   each existing component to be a real directory, and create any missing directory
   exclusively before reopening and verifying it no-follow.
8. Create the leaf exclusively without following links, verify that the opened
   destination is a regular file with link count exactly one, and copy from the
   verified source descriptor without reopening either path.
9. Use equivalent race-safe APIs on non-POSIX systems.
10. Never recursively copy or glob scratch, extract an archive into artifacts, or
    open or promote a symlink, FIFO, socket, device, directory, hard-linked file,
    changing file, or file that exceeds its bound.
11. If any check is unavailable, cannot be enforced, or fails, discard the scratch
    entry; if it is decisive evidence, retain `needs_validation` with the exact
    promotion blocker.
```

#### Core validation rules — include in every hunter prompt

```text
## Candidate gate

1. A candidate needs a complete repository-relative source trace and evidence for the
   claimed root cause, including the strongest source-visible control.
2. A proposed confirmed record needs a bounded local observed result, meaningful impact
   across a stated boundary, complete conditions, and no visible preventing layer.
3. Do not strengthen a crash into code execution, ordinary work into shared availability,
   or a same-principal action into privilege gain.
4. If a required fact is not source-visible or locally observable, use
   needs_validation. Name exact blockers; do not give it severity or speculative completion.
5. A missing best practice with no affected principal/resource is excluded or hardening,
   not a finding. A candidate disproved by source is not needs_validation.
6. Use the same source-derived fingerprint for the same root cause in every state.
   It must match `^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$` and must not include a line,
   wave, agent, severity, or verdict.
7. Return an empty candidate array when nothing survives these gates.
```

## Local validation boundaries

Local execution is for confirmation. It is not for impact expansion:

- **Allowed only in the required OS sandbox:**
  - offline builds with the dependencies that are present;
  - isolated-loopback processes that use dummy state;
  - unit and integration tests;
  - small fixture processing;
  - sanitizers;
  - bounded fuzz and regression tests;
  - deterministic concurrency checks;
  - local browser and emulator tests with dummy accounts;
  - rendered manifests and policy evaluation with dummy identities;
  - mocked external or paid calls.
- **Disallowed:**
  - live or deployed traffic;
  - requests to services that you did not start for this isolated check;
  - network installation of dependencies;
  - real accounts or credentials;
  - production data;
  - shared queues, cloud resources, runners, registries, signing or release services;
  - publication;
  - stress, saturation, or cost generation;
  - any work after the minimum dummy-data boundary result.

The sandbox starts with an empty environment. It gives target code no external network and no writable host path. It enforces explicit low resource and time limits for every check, not only for checks that are expected to be expensive. Scratch output stays target-controlled after exit. Promote it only with the host procedure in `SKILL.md`. That procedure is no-follow, path-confined, regular-file, and bounded-size. A missing sandbox or promotion capability does not erase a source-grounded candidate. Represent the exact blocker in `needs_validation`.

## Structured hunter result

Return exactly one JSON object, with no surrounding prose:

```json
{
  "units": [
    {
      "coverage_id": "one assigned ID",
      "disposition": "covered|candidate|blocked",
      "reviewed_paths": ["repo/relative/path"],
      "checks": [
        {
          "agent_id": "canonical owner of this check",
          "reviewed_paths": ["repo/relative/path owned by this check"],
          "invariant": "specific control checked for this unit",
          "method": "source|local",
          "result": "what source or the bounded check established",
          "artifact": "agents/<agent-id>/artifacts/file for local, null for source"
        }
      ],
      "candidate_fingerprints": [],
      "unresolved": []
    }
  ],
  "candidates": [],
  "hardening": ["concrete non-finding note"],
  "uncovered": [
    {
      "surface": "...",
      "boundary": "...",
      "subsystem": "...",
      "attack_class": "...",
      "starting_paths": ["repo/relative/path"],
      "reason": "why this needs its own deterministic coverage unit"
    }
  ]
}
```

Each `candidates` entry has the shape of the schema, except that it uses `proposed_verdict` in place of `verdict`:

- `proposed_verdict: "confirmed"`: include every field that the `confirmed` branch of `report-schema.json` requires, other than `verdict`. These fields are `fingerprint`, title, description, `root_cause`, `intended_behavior`, ordered `trace`, `evidence`, `conditions`, target-neutral `execution`, `remediation`, `severity`, and `confidence`. The execution instructions describe only the bounded local check that you already performed. `payloads` holds the minimum test input, fixture, or native invocation. `observed_result` records the actual local output. The overall severity must not exceed the observed impact.
- `proposed_verdict: "needs_validation"`: include every field that that schema branch requires, other than `verdict`. These fields are `fingerprint`, title, description, `claimed_root_cause`, ordered `trace`, `evidence`, nonempty `blockers`, and `validation_plan` with at least one applicable `local` or `deployment` step. Do not invent an inapplicable context. Do not include severity, execution, remediation, reason, or a confirmed `root_cause`. `deployment` is an owner-observed check. It is not a request to probe a live target.

Every assigned coverage ID appears exactly once in `units`. A `covered` unit needs an owner, nonempty `reviewed_paths` and `checks`, no unresolved fact, and no candidate. A `candidate` unit has the same owned evidence. It is the only state that carries linked fingerprints. A `blocked` unit is an owned partial review. It has nonempty paths, checks, and unresolved facts, but no fingerprint.

All source paths are repository-relative. They are never absolute or traversal paths. A trace with several entries begins at `entrypoint` and ends at `sink`. It labels the intermediate steps `propagation`.

Every check has its own canonical lowercase `agent_id` and nonempty `reviewed_paths`. The unit-level list is exactly the union of those owned paths. A `source` check uses `artifact: null`. A `local` check uses one regular file that the parent successfully promoted beneath `agents/<check.agent_id>/artifacts/`. This permits a verifier to add independently owned evidence without taking ownership from the hunter. Never link scratch, an output-root file, or an artifact of another check owner.

## Parent consolidation and ledger update

The parent validates each unit result and maps it to exactly one assigned `coverage_id`. It updates only that ledger unit. Reject duplicate or absent IDs and unsafe unit or check agent IDs. Also reject source checks with artifacts. Also reject local artifacts that trusted parent-side code did not promote into the artifacts subtree of the check owner. Copy the `reviewed_paths` of the unit into the ledger. Copy its `checks` into the `local_checks` of the unit. Copy the linked artifact paths, candidate fingerprints, and unresolved facts. Retain the `hardening` list of each hunter in a parent bookkeeping field on the relevant units. This field is outside the semantic fields. Phase 6 can then report it.

A failed, malformed, or unsupported conclusion leaves that unit `planned` for reassignment. Untouched units that the budget or profile excludes become unassigned `deferred` units with empty evidence and a reason. Do not hide partial evidence in `deferred`. Run `validate-coverage-ledger.cjs` after the update. An invalid ledger cannot drive another assignment. This per-unit contract allows one hunter to close one unit and to return a candidate or blocker for another unit.

Consolidate candidate entries by fingerprint and then by root cause. One root cause that exposes several entry paths or effects is one candidate with the strongest complete trace. Related but independent missing controls use separate fingerprints. Record duplicate fingerprints in the relevant ledger unit. Do not send duplicate candidates to validation.

## Coverage-critic waves

Immediately after each hunter wave, spend the reserved invocation on one fresh `research` post-wave coverage critic. The critic receives `architecture.md`, the full coverage ledger with each assignment block map, the current candidate fingerprints and states, and the prior-ledger gap summary. It reads the source. It does not write or run targets. Require exactly this JSON:

```json
{
  "missing_units": [
    {
      "surface": "...",
      "boundary": "...",
      "subsystem": "...",
      "attack_class": "...",
      "starting_paths": ["repo/relative/path"],
      "selected_companion_blocks": ["FILE.md#section"],
      "excluded_blocks": [{"block": "FILE.md#section", "reason": "..."}],
      "reason": "source-backed coverage gap"
    }
  ],
  "reassign_ids": ["existing-id-that-did-not-close"],
  "resolved_prior_leads": ["fingerprint"],
  "stop": false
}
```

The critic checks for these items:

- unmapped entry points;
- unchecked parallel paths;
- missing lifecycle modes;
- selected companion classes without a unit;
- unjustified exclusions;
- units closed without paths or checks;
- prior `needs_validation` or changed-source gaps that no unit addresses.

It proposes coverage, not findings. `stop` is the own assessment of the critic. It is `true` only when the critic accepts no `missing_units` and no `reassign_ids`. The loop condition below decides whether another wave runs. `stop` alone does not decide this. For each fingerprint in `resolved_prior_leads`, the parent marks the linked unit or prior-lead entry resolved. The parent records the source-backed reason of the critic.

The parent rejects proposed units that are outside the review scope or the source/local boundary. It derives canonical IDs for accepted units and deduplicates them against the current units. A prior same-source completed unit can supply evidence. Prior `deferred`, `blocked`, `out_of_scope`, or changed-source units become current work. They never suppress an accepted unit. Fail on a canonical ID collision. Do not merge it. For each legitimate `reassign_id` with live `blocked`, `covered`, or `candidate` evidence, append that exact terminal record to the `attempts` of the unit, with the source-backed `reassignment_reason` of the critic. Preserve its owner, checks, artifacts, fingerprints, and unresolved facts in that archive. Increment the live `wave`.

The next hunter must be a fresh owner and receives an `in_progress` unit with empty live evidence. The terminal result of the hunter writes only its new evidence into the live fields. Never copy the checks or artifacts of an archived owner into the new live attempt. Sort the IDs and validate the ledger before another assignment.

In `standard` and `deep`, suppose the post-wave critic reports no accepted `missing_units` or legitimate `reassign_ids`, and no `planned` units remain. Then spend the separately reserved invocation on a distinct final-clean critic. Coverage is complete only when that critic also returns no accepted work. If it finds work, queue the work. Then repeat the wave, the post-wave critic, and the final-clean process.

If time or resources force an early stop, mark every untouched unit `deferred`. Preserve the reason of the critic and disclose the gap in the report. Never use a silent wave or agent cap as evidence of complete coverage.

The run profile bounds this loop. A `quick` run has exactly one hunter wave followed by exactly one final critic pass. Add each accepted `missing_unit` to the current ledger and mark it `deferred` with reason `quick_profile_final_critic`. For each legitimate evidence-bearing `reassign_id`, archive the live terminal state in `attempts` and increment `wave`. Then set the live state to unassigned `deferred` with empty evidence and reason `quick_profile_final_critic`. Do not launch a second hunter wave or another critic. In a scoped run, the critic still reports the out-of-scope gaps that it notices. The parent records them as `out_of_scope` with the reason of the critic. It does not assign them. The early-stop rule above is the same mechanism. `quick` is a pre-declared early stop. It is not evidence of complete coverage.

A budget bounds the loop in the same way. Before the parent assigns each wave, it compares the remaining budget with these items: the hunter count, the validation reserve, the immediate post-wave critic, and the retained final-clean critic (`quick` reserves only its single final post-wave critic). Make the hunter wave smaller to fit, and take units in priority order. If those mandatory reserves do not fit, launch no hunter from that wave. Mark its planned units `deferred` with reason `budget_cannot_reserve_critics_and_validation`. Units that the critic proposes enter the same ranked queue. They do not extend the budget.

Surviving candidates can exceed the validation reserve. In that case, follow the incomplete-run rule in `SKILL.md`. Stop hunting and validate in fingerprint order. Retain unvalidated units as unresolved candidates. Never present them as findings.
