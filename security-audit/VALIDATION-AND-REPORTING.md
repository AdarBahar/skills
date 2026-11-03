# Validation, Structured Output, Verification, and Reporting

### Phase 3: Independently validate every candidate

Start Phase 3 after the clean coverage-critic pass or an explicitly recorded early stop. Then consolidate the Phase 2 candidates and the carried same-source prior confirmations by stable fingerprint and root cause. Give every unique proposed `confirmed` and `needs_validation` candidate to a fresh `general` verifier that did not hunt it. A carried prior confirmation follows the same current verification path. This is true although hunters exclude that unchanged root cause.

A verifier may read hunter artifacts or prior artifacts. It must read again every cited current source location. It must independently run any decisive check that it can reproduce safely.

Assign each verifier a canonical lowercase unique ID. Also assign `<output-dir>/agents/<verifier-id>/scratch/` and parent-owned `artifacts/`. The verifier writes only to `scratch/`. The verifier never writes retained artifacts. The verifier receives only these items:
- the candidate;
- its linked coverage-unit checks and artifact paths;
- the architecture facts that it needs to interpret the path;
- the exact relevant companion validation blocks;
- the promotion procedure block below;
- the source/local execution boundary;
- the `confirmed`, `needs_validation`, and `rejected` branches of `report-schema.json`, copied verbatim;
- the prior records with the same fingerprint.

The verifier must not receive the conclusion of another verifier.

#### Candidate-verifier prompt

```text
You did not write this candidate. Try to refute it from repository source and bounded
local evidence. Do not contact deployed endpoints or external/shared services. Run
target-controlled code only inside the approved OS-enforced sandbox: no external
network, empty allowlisted environment, read-only target and tools, scratch-only
writes, and explicit low resource and wall-clock limits. If any control is unavailable,
do not execute; retain the exact missing capability as a needs_validation blocker.
Treat every scratch entry as target-controlled after execution. After the sandbox and
all its processes terminate, only trusted parent-side code may promote a predeclared
scratch-relative file, following the promotion procedure block included verbatim in
this prompt. You and target code never write retained artifacts. If promotion is
unavailable or fails, do not use that file as evidence.

1. Verify every trace and evidence file, positive line number, scope, and description.
   Confirm the first entry is a real lower-trust entrypoint and the last is the
   claimed sink or boundary effect.
2. Reconstruct the strongest source-visible validation, identity, authorization,
   normalization, lifecycle, framework, and containment controls on the path.
   Where the architecture summary names a comparable baseline, note whether it
   shares the pattern — as calibration, never as grounds to dismiss.
3. For a proposed confirmed candidate, independently reproduce the minimum observed
   result when possible. Verify inputs, interface shape, conditions, and affected
   dummy principal/resource. Do not infer a stronger result or continue after it.
4. Verify that likelihood, impact, confidence, and the proposed source fix match only
   what the evidence establishes.
5. For a proposed needs_validation candidate, decide whether the blocker is genuinely
   outside source/local observation. If source refutes the trace, reject it. If the
   missing fact remains decisive, keep needs_validation and make the local and
   owner-observed plans exact and non-destructive.
6. Preserve the fingerprint for the same source-derived root cause across every state.

Return exactly one JSON object and no surrounding prose:
{"decision": "confirmed|needs_validation|rejected", "record": { ... }}
where record exactly matches the decision's verdict branch of the schema included
in this prompt. A corrected record replaces the hunter's wording.
```

Copy this promotion procedure verbatim into every candidate-verifier prompt:

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

A verifier can promote `needs_validation` to `confirmed` only after it independently establishes the complete path and the bounded observed result. Demote a proposed confirmation to `needs_validation` when a specific deployment or runtime fact stays unknown. Use `rejected` when one of these refutes the claim: source, local behavior, a visible control, missing meaningful impact, or an impossible prerequisite. Never use `needs_validation` as a parking place for a speculative idea.

The parent checks that each verifier returned the same fingerprint, unless the verifier identified a genuinely different root cause. Merge the corrections. Record the decision in every linked coverage unit. Make sure that there is one final record for each fingerprint. Discard a malformed verifier result or a result with surrounding prose. Do not repair it. Run that candidate again with a fresh verifier when the budget permits. Otherwise, the candidate remains an unvalidated ledger candidate under the incomplete-run rule.

When verifier evidence updates a ledger check, set the `agent_id` of that check to the canonical ID of the verifier. List its nonempty repository-relative `reviewed_paths`. Keep the unit-level `reviewed_paths` equal to the union across checks. Use `method: "source"` with `artifact: null` for a review of source only. Use `method: "local"` only with a file that trusted parent-side code promoted successfully below `agents/<check.agent_id>/artifacts/`.

The unit keeps its original assignment owner. Therefore, checks from independently owned hunters and verifiers can exist together. A carried prior record has a seeded `planned` unit. That unit has no prior owner. The verifier that checks it again becomes the assignment owner of the unit. Its check is the first check of the unit. The unit moves to `candidate` with the carried fingerprint.

If a strict total-agent budget cannot cover every candidate, set the run status to incomplete. Then follow the deterministic budget rule in `SKILL.md`. An unvalidated candidate remains only in the ledger. It does not enter `findings.json` under any verdict.

### Phase 4: Write and validate `findings.json`

The parent writes all independently decided records to `<output-dir>/findings.json`, sorted by fingerprint. Include these items:

- `confirmed`: source-grounded vulnerabilities with complete local execution evidence, conditions, specific remediation, likelihood/impact/overall severity, and confidence.
- `needs_validation`: source-grounded candidates with an exact unresolved blocker and at least one applicable local or owner-observed deployment plan.
- `rejected`: source-grounded candidates that validation disproved. Keep them so that future runs do not repeat the unsupported claim without changed evidence.

Read `report-schema.json` immediately before you write. It uses `additionalProperties: false`. Do not carry hunter wrapper fields into a record. Keep these verdict contracts distinct:

- A `confirmed` record uses `root_cause`, `intended_behavior`, `conditions`, `execution`, `remediation`, `severity`, and `confidence`. It must not use `claimed_root_cause`, `blockers`, `validation_plan`, or `reason`. `execution` is target-neutral. It uses the native interface of the target: API/HTTP input, CLI call, library call, message, file fixture, browser action, rendered policy, or local harness, as applicable. `observed_result` is nonempty and factual.
- A `needs_validation` record uses `claimed_root_cause`, `trace`, `evidence`, `blockers`, and at least one nonempty `validation_plan.local` or `validation_plan.deployment` field. Include both only when both contexts can resolve distinct facts. It must not use severity, execution, remediation, reason, or confirmed root cause.
- A `rejected` record uses `claimed_root_cause`, `trace`, `evidence`, and `reason`. It must not use severity, execution, remediation, blockers, validation plan, or confirmed root cause.

Every record has a stable fingerprint, a title, a description, and repository-relative source paths. A multi-step trace begins with `entrypoint` and ends with `sink`. It uses `propagation` only between them. One-entry traces use `entrypoint` or `sink`. The overall severity cannot exceed the demonstrated impact.

Run:

```sh
node <skill-dir>/validate-findings.cjs <output-dir>/findings.json
node <skill-dir>/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json
```

Fix every structural and semantic error before you continue. The findings validator rejects input beyond 5 MiB, 1,000 top-level findings, or 64 nesting levels. It limits the reported error output to 100 messages. Validator success proves only the format and the ledger consistency.

### Phase 5: Verify the final records with fresh eyes

Start one fresh `research` verifier for each final `confirmed` and `needs_validation` record, in parallel. This verifier checks the structured record, not the hunter write-up. It stays inside the source and local boundaries.

In a `quick` run, Phase 3 and Phase 5 merge. The Phase 3 verifier also does these record checks and returns the final schema-shaped record. Each candidate then gets one fresh independent reviewer instead of two. Every other profile keeps the two passes separate. In every profile, never skip the independent review of a `confirmed` record.

For `confirmed`, require the verifier to check these items:

1. Every repository-relative trace and evidence path, line, scope, and described operation.
2. The real entry interface and the exact local input shape.
3. Every condition, parser or policy step, source-visible preventing layer, and observed local result.
4. The affected principal and resource, and the demonstrated impact.
5. The separation of severity: realistic likelihood, demonstrated impact, and an overall severity no greater than the impact.
6. The remediation strategy and any `code_changes`. Check if the fix enforces the invariant and does not only move the trust.

For `needs_validation`, require the verifier to check these items:

1. The source path is real and supports only the stated `claimed_root_cause`.
2. Every listed blocker is decisive. A local check cannot already answer it.
3. The candidate names a boundary and a possible concrete result. It is not a generic concern.
4. At least one validation-plan field is present and exact. `local` uses a bounded fixture. `deployment` asks an owner to observe a configuration, identity, route, policy, or runtime fact. Do not invent a plan for an inapplicable context. Never send audit traffic to a deployment.
5. The fingerprint matches the prior and current records for the same root cause.

Each verifier returns exactly one JSON object, with no surrounding prose. The object is `{"decision":"verified","fingerprint":"..."}` or `{"decision":"replace","reason":"...","record":{...}}`. A replacement record must match its `confirmed`, `needs_validation`, or `rejected` schema branch. Treat a malformed Phase 5 result, or a result with surrounding prose, the same way as in Phase 3. Discard it without repair. Run it again with a fresh verifier when the budget permits.

Do not apply a Phase 5 replacement as final in these cases. The replacement promotes a record to a stronger verdict, including any promotion to `confirmed`. Or the replacement materially changes the root cause, trace, execution input or observed result, demonstrated impact, or severity.

Give that complete replacement to a new independent verifier. This verifier did not hunt, did not do Phase 3 validation, and did not propose the Phase 5 replacement. The new verifier checks the current source again. It independently reproduces any decisive local result under the execution boundary. Then it returns `verified` or another replacement.

Apply a material replacement only after this fresh verification. If another material replacement results, repeat with a fresh verifier. If budget or independence is not available, take these steps. Remove the disputed record from `findings.json`. Keep its ledger unit as an unresolved candidate. Set `run_status: "incomplete"` with an exact `incomplete_reason`. You can apply non-material corrections of wording or repository lines directly, if they do not change the meaning or the evidence.

After every applied replacement, run both validators again. Update the linked ledger decisions. If a final verifier identifies a separate root cause, assign a new fingerprint. Send it through independent candidate validation before you include it. Set `run_status: "complete"` only when every ledger candidate has an independent final disposition and every retained record passes Phase 5.

Do not verify only `confirmed` records. A misleading `needs_validation` handoff wastes the time of the owner. It can also keep a false premise.

### Phase 6: Produce target-neutral reports from final records

Do this only after Phase 5 passes for every record that stays in `findings.json`. Derive the prose from the final records, the ledger, and the hunter `hardening` notes that the ledger bookkeeping keeps. An incomplete run may report independently verified records. It must identify each unresolved ledger candidate. It must not present such a candidate as a finding. The prose files never change a verdict, a severity, a blocker, or a demonstrated impact.

#### `REPORT.md`

Write these sections:

1. Run profile, scope, and budget (if set), with agents spent against planned. Also write the source ref and a statement that sandboxed execution was on source and local only. Also write the use of prior runs. Also write the explicit deferred and out-of-scope coverage. Name the carried same-source confirmations and the changed-source revalidations. A `quick`, scoped, budget-limited, or incomplete run states plainly that it is a partial pass. If candidate validation used all of a strict budget, state that the run is incomplete. List every unvalidated fingerprint and linked unit. Do not describe those candidates as findings. If the budget prevented a mandatory critic, state which critic did not run. Make no clean-coverage claim.
2. One short summary of the security posture.
3. A table of confirmed findings. Include severity, title, affected boundary, and a one-line observed result.
4. Each confirmed finding. Include the repository source location, the lower-trust principal, and the target-native bounded reproduction. Include the conditions, the actual result, and the impact. Include the priority rationale and the smallest source fix.
5. A separate `NEEDS VALIDATION` table. Give the title of each lead, the repository trace, the exact blocker, the bounded local next step, and the safe owner-observed deployment check. Do not assign severity. Do not call it a confirmed vulnerability.
6. Separate hardening notes and positive source patterns.
7. A coverage summary from the ledger: covered, candidate, blocked, and deferred counts. Add the important exclusions and the final critic result.

Do not describe rejected records as findings. Mention their fingerprints only when they explain a prior disagreement or a coverage decision.

#### `FINDINGS-DETAIL.md`

For each confirmed `medium`, `high`, or `critical` record, copy the complete source path and the target-neutral local reproduction:

- ordered repository-relative trace and evidence;
- dummy attacker/principal and affected dummy resource;
- native input, invocation, or fixture and exact bounded instructions;
- observed output and the security invariant it proves;
- conditions and containment;
- source-level remediation and regression case.

#### `NEEDS-VALIDATION.md`

For every unresolved record, copy the source trace, the verified evidence, the exact blocker, and the affected boundary. Also copy each applicable bounded local or owner-observed resolution plan. Keep these as prioritized leads without severity. Do not turn them into live test guidance. Do not assume the missing deployment fact.

HTTP is one possible native interface. It is not the default. A library finding may use a function call. A parser finding may use a fixture. A CLI finding may use a command. A desktop app finding may use an IPC or file action. An infrastructure finding may use a locally rendered policy. Do not require an endpoint, an external account, or a live environment that the target does not have.

Keep the report proportional to the evidence. A clean run may have zero confirmed records. State that result and the remaining coverage and validation limits. Do not invent LOW findings.
