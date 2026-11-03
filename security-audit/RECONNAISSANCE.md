# Reconnaissance

### Phase 1: Map the source and plan coverage

The parent initializes `run-metadata.json`. Then the parent applies the strict pre-reconnaissance budget gate in `SKILL.md`. Then the parent creates the agent scratch roots and the shared ledger before hunting. If the gate fails, record the incomplete status in the metadata and launch no reconnaissance agent. Reconnaissance reads only the target and the locally available build and configuration state. It does not contact deployed endpoints, external identity providers, registries, brokers, cloud APIs, or other shared services.

Launch several `research` agents in parallel. They return structured facts to the parent. They do not write files.

**Agent 1a: Product, stack, and local operation**

```text
Read the target at <target>. Do not use network access. Return:
1. Product type, users, operators, and ordinary trust-sensitive actions.
2. Languages, frameworks, build system, runtimes, and locally visible deployment models.
3. Repository-relative entry points and subsystem boundaries.
4. Exact build and test commands that could run offline with local dependencies, their expected write locations, and the target-controlled inputs they process. Do not run them during reconnaissance.
5. Comparable software or protocol visible from local documentation and dependencies. If no useful comparison is source-grounded, say so.
6. Missing local toolchains or runtime facts that limit bounded execution.
Return only source facts with repository-relative file:line references.
```

**Agent 1b: Principals, authority, and controls**

```text
Read all source that establishes identity, authorization, isolation, and privilege. Map:
1. Each lower-trust principal and the actions it has by design.
2. Authentication or peer identity at each entry surface.
3. Per-resource authorization and tenant/owner scope.
4. Process, browser, workload, CI, plugin, model/tool, device, or local-IPC authority.
5. Privilege changes, confirmation, revocation, recovery, and fallback paths.
6. Which controls are source-visible and which depend on an unobserved deployment fact.
Return trust boundaries and control locations with repository-relative file:line references. Do not infer live reachability.
```

**Agent 1c: Entry surfaces, copies, and sinks**

```text
Inventory every source-visible place external or lower-trust input enters:
- HTTP/browser, RPC/message/protocol, files/archive/document, CLI/env/config, plugins/dependencies/CI, cloud events/IAM selectors, model context/tool arguments, mobile/deep-link/webview, and local IPC.
For each surface, follow major transformations, stored or derived copies, and security-relevant sinks. Record source-visible limits and parallel paths to the same effect.
Return repository-relative paths and line numbers. Be complete, but do not execute or send inputs.
```

**Agent 1d: Local execution and deployment visibility**

```text
Read tests, build definitions, manifests, packaging, and maintained environment overlays. Return:
1. Small offline tests or existing fixtures that could validate trust boundaries with dummy data inside the required OS-enforced sandbox.
2. Processes that could use an isolated loopback network namespace without external or shared dependencies.
3. Commands that would fetch dependencies, publish artifacts, contact paid/provider APIs, or affect shared state; mark them prohibited for this run.
4. Deployed controls and attachments that source cannot establish and therefore require needs_validation if decisive.
5. The final active source path for each deployment mode only where the repository selects it deterministically.
6. Whether the local platform can enforce an empty allowlisted environment, no external network, read-only target/toolchain mounts, scratch-only writes, and explicit CPU, memory, process, file-size, disk, and wall-clock limits. Missing controls block target-controlled execution.
7. Whether trusted parent-side code can promote predeclared scratch files with path-confined no-follow descriptor traversal, nonblocking regular-file checks, no-follow traversal of every destination parent, exclusive regular-file destination creation, and explicit per-file and cumulative size bounds. Missing promotion controls block use of scratch files as evidence.
```

Add focused reconnaissance agents for materially distinct deployment modes or subsystems that these four agents do not map. Do not silently omit them. Suppose the budget gate in `SKILL.md` blocks a focused agent. Then launch nothing for it. Seed the unmapped area as a `deferred` ledger unit with reason `budget_cannot_reserve_critics_and_validation`. Disclose the gap in the report.

## Prior-run input

Before the parent selects work, it reads every available prior `coverage-ledger.json` and `findings.json` for the same repo:

- Compare the source locations, controls, conditions, and source-derived identity of every prior record and unit with the current source.
- Carry an unchanged prior `confirmed` record into the current candidate set, with the same fingerprint, only when its relevant source, conditions, and qualifying evidence still apply. Link it to a current `planned` unit with `prior_status: "prior_confirmed_same_source"`. Put only that root cause on the hunter exclusion list. The Phase 3 verifier that re-verifies the carried record becomes the assignment owner of that unit. Its source re-check is the first check of the unit and moves the unit to `candidate` with the carried fingerprint.
- Build a current planned `prior_confirmed_changed_source` revalidation unit when any relevant source or condition changed. Do not exclude that root cause from hunting. Do not assume that the prior verdict still applies.
- Build current work units for every prior `needs_validation`, `deferred`, `blocked`, `out_of_scope`, and changed-source unit. These states are priority input. They are never keys for deduplication or suppression.
- Carry a prior `needs_validation` record that is still blocked, with the same fingerprint, only after current source supports its trace. Link it to a current `planned` unit with `prior_status: "prior_needs_validation"`. The record keeps the unresolved blocker. The Phase 3 verifier that re-checks the carried record becomes the assignment owner of that unit. Its re-check is the first check of the unit and moves the unit to `candidate` with the carried fingerprint. Include the record in the final verification.
- Treat prior rejected records as stale claims, unless current evidence changes the failed trace or the missing condition. An unchanged rejection suppresses only that exact claim. It does not suppress the review of the coverage unit.
- Record missing or incompatible ledgers. Do not treat them as empty coverage.

State the paths and source refs that you used in `run-metadata.json`. In `architecture.md`, summarize only the coverage consequences.

## Architecture summary and companion selection

The parent synthesizes `<output-dir>/architecture.md`, with a hard cap of about 1,000 words. Include these items:

1. Product, principals, normal authority, and protected resources.
2. The comparable-software baseline from Agent 1a, when one is source-grounded: the security trade-offs that the comparable software accepts. Use it to calibrate effort and severity. Never use it to dismiss a demonstrated finding. If the comparable software shares a defect pattern that has mattered in practice, that strengthens the finding. Omit this line when no meaningful comparable exists.
3. Tech stack, source-visible deployment paths, and offline build and test limits.
4. Entry surfaces and the important source-to-sink or lifecycle paths.
5. Trust boundaries and the strongest source-visible control on each boundary.
6. Repository-relative starting paths.
7. Prior coverage gaps, changed-source and blocked revalidation targets, and same-source confirmed exclusions.
8. A short summary of the companion selection, derived from [ATTACK-CLASSES.md](ATTACK-CLASSES.md): the selected files and the source-visible boundaries that require them.

Keep the assignment-level ordinary block, the selected companion blocks, and the excluded blocks with reasons in each ledger unit. Do not keep them in `architecture.md`. This keeps the architecture cap valid for large runs. It also makes the exact hunter prompt map machine-checkable.

Do not select a companion file only because the language or dependency name appears. Select it because reconnaissance found the trust-sensitive boundary that its `When to use this file` section describes. Do not exclude a visible boundary only because another agent will review a related class.

## Deterministic coverage ledger

The parent writes `<output-dir>/coverage-ledger.json` as a top-level JSON array. Derive one unit for every material combination of entry surface, trust boundary, subsystem, and applicable ordinary or companion attack class. Use the granularity that the run profile sets (`quick` uses one all-in-scope subsystem identity; `deep` adds lifecycle modes). For a scoped run, seed the in-scope surfaces for assignment. Retain discovered excluded surfaces as `out_of_scope` units, so that later full runs can turn them into current work.

Each dimension has a human label and a stable source-derived value in `canonical_refs`. Use the same canonical reference for the same source object across runs, even if its display label changes. Suitable references include a repository-relative entry path plus the exported scope and a route or message identity that the source defines. Other suitable references are the source control that defines a boundary, a repository package path, and the exact attack-class block reference. A block reference is `FILE.md#` plus the exact class name as written in bold or as a heading in that file. It is a stable identifier that is matched against the file text. It is not a rendered HTML anchor.

For companion section blocks, use the heading text before any parenthetical qualifier (for example `Core discipline`). Do not derive references by lowercasing or slugging display labels.

Derive `coverage_id` without lossy slugs:

1. Require every reference to be Unicode NFC with valid scalar values and visible content. It must have no control, format, line/paragraph separator, or default-ignorable code point, and no surrounding whitespace.
2. Encode its UTF-8 bytes with RFC 3986 percent encoding: leave only `A-Z a-z 0-9 - . _ ~` unescaped and use uppercase `%HH` for every other byte.
3. Join the encoded `surface`, `boundary`, `subsystem`, and `attack_class` references with `::`; append the encoded `lifecycle` when present.

Use the fixed canonical value `profile/quick/all-in-scope-subsystems` for the coarser subsystem dimension of the quick profile. Do not include a wave number, agent, verdict, severity, or line number in a reference or ID.

Sort units lexicographically by `coverage_id` before each assignment. Fail on every duplicate ID. If duplicate IDs have different semantic fields, treat that as a canonical identity collision. Never merge or silently overwrite them. The validator also rejects one semantic tuple that different canonical references represent.

Each unit records these fields:

```json
{
  "coverage_id": "...",
  "canonical_refs": {
    "surface": "src/router.ts#POST /users/:id",
    "boundary": "src/authz.ts#requireOwner",
    "subsystem": "packages/api",
    "attack_class": "ATTACK-CLASSES.md#Access control"
  },
  "surface": "...",
  "boundary": "...",
  "subsystem": "...",
  "attack_class": "...",
  "starting_paths": ["repo/relative/path"],
  "ordinary_attack_class_block": "ATTACK-CLASSES.md#Access control",
  "selected_companion_blocks": ["FILE.md#section"],
  "excluded_blocks": [{"block": "FILE.md#section", "reason": "..."}],
  "prior_status": "new|prior_confirmed_same_source|prior_confirmed_changed_source|prior_needs_validation|prior_deferred|prior_blocked|prior_out_of_scope|prior_covered_same_source|prior_covered_changed_source|prior_rejected_claim_changed|none",
  "attempts": [],
  "wave": 1,
  "status": "planned",
  "agent_id": null,
  "reviewed_paths": [],
  "local_checks": [],
  "result_fingerprints": [],
  "unresolved": []
}
```

When `lifecycle` is material, add both `canonical_refs.lifecycle` and a human `lifecycle` field. `ordinary_attack_class_block` is null only when no ordinary block applies. The selected companion list includes each applicable class and its companion `Core discipline`, `Universal moves`, and `Validation rules`. `excluded_blocks` records every block that you considered but did not select, and the source fact that excludes it.

The parent can add bookkeeping fields, but it keeps the semantic fields above stable. In `prior_status`, `new` marks a surface that is first seen in this run when compatible prior ledgers exist. `none` marks a unit that is seeded when no compatible prior ledger is available. Prior `deferred`, `blocked`, `out_of_scope`, and changed-source units initialize as current `planned` work when they are now in scope. A prior same-source covered unit stays visible in the current ledger. Assign changed source, important lifecycle paths, and exact conflicts first. Then use the coverage critic to decide whether the unit needs another pass.

`attempts` is an append-only archive for evidence-bearing assignments that a coverage critic reopens. Before reassignment, append the exact `wave`, `status`, `agent_id`, `reviewed_paths`, `local_checks`, `result_fingerprints`, and `unresolved` of the prior unit. Also append the source-backed `reassignment_reason` of the critic. Only the `blocked`, `covered`, and `candidate` states can be archived.

Archived attempts keep the same state and evidence invariants as live units. They use strictly increasing waves below the current wave. They keep their producing owners and artifacts. The next assignment increments `wave`, uses a fresh owner, and starts with empty live evidence.

If the profile or budget prevents another assignment, increment `wave` and use the live `deferred` state with a null owner, empty evidence, and the stop reason. Never copy the checks or artifacts of an archived owner into the live state. A later live terminal state contains only the evidence of the new attempt. The archive stays unchanged.

Enforce this state table exactly:

| Status | Unit `agent_id` | `reviewed_paths` / `local_checks` | `result_fingerprints` | `unresolved` |
|---|---|---|---|---|
| `planned` | null | empty | empty | empty |
| `not_applicable`, `out_of_scope`, `deferred` | null | empty | empty | nonempty reason |
| `in_progress` | canonical owner | empty | empty | empty |
| `blocked` | canonical owner | both nonempty owned partial evidence | empty | nonempty blocker |
| `covered` | canonical owner | both nonempty | empty | empty |
| `candidate` | canonical owner | both nonempty | nonempty | optional |

Canonical agent IDs match `^[a-z0-9][a-z0-9_-]{0,63}$` and are not Windows device names. Lowercase is mandatory, so one ledger cannot contain case-fold aliases. The unit `agent_id` records the assignment owner. Every check records its own `agent_id` and nonempty `reviewed_paths`. The unit-level `reviewed_paths` is exactly the union of the check paths. A source-only check uses `artifact: null`. A local check requires a regular file that only trusted parent-side code promoted under exactly `agents/<check.agent_id>/artifacts/`. This lets hunter checks and verifier checks exist in one unit. These items are not evidence: scratch paths, output-root files, symlinks, special files, and artifacts of another check owner.

The ledger is the coverage claim. An architecture summary, an agent count, or a generic "auth reviewed" sentence is not coverage evidence. Phase 2 closes units only from the paths and checks in the structured result of a hunter.

Run `node <skill-dir>/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json` after the seed, after every parent update, and before Phase 6. The validator rejects input that is larger than 5 MiB, deeper than 64 nesting levels, or larger than 10,000 units.

It also rejects more than 1,000 entries in a nested collection, or more than 500,000 traversed values. It caps the reported validation errors at 100. In practice, the 5 MiB byte limit holds roughly 2,000-5,000 realistic units, so it binds before the 10,000-unit cap. Fix every error before you assign work or make a coverage claim.
