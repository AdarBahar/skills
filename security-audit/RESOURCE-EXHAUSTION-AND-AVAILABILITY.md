# Resource Exhaustion and Availability Hunting

#### When to use this file

Use this file when untrusted requests, messages, files, tenant state, or agent work can consume CPU, memory, disk, connections, worker slots, paid APIs, or queue capacity. Also use it when such input can deadlock or crash a shared service. This domain distinguishes a source-reviewable availability vulnerability from a general performance issue. Never validate by stress on a shared or live service.

Use `MEMORY-SAFETY-AND-BINARY.md` for memory-integrity defects. Use `PROTOCOLS-RPC-AND-MESSAGING.md` for broker delivery logic. A reachable fatal error belongs here for shared impact, even when another file covers the underlying parser.

## Core discipline (include in every agent prompt for this domain)

```
- Require an input-to-cost path, a missing effective bound, and impact on another user, shared service, safety function, or operator-owned spend. Self-limiting work in the requester's own process is not a service vulnerability.
- A missing rate limit is not enough. Check body/message/file caps, concurrency, queues, deadlines, database constraints, upstream gateways, and per-tenant quotas before calling a path unbounded.
- Do not run stress, saturation, or production tests. Use asymptotic analysis, small boundary fixtures, mocked paid calls, strict local resource limits, and deterministic cancellation tests.
- State attacker cost, service work, persistence, scope, and recovery. One bounded input with superlinear or persistent shared effect is materially different from sustained volume.
- Use `confirmed` for source-visible bounds failures demonstrated safely. Use `needs_validation` when upstream caps, deployed topology, autoscaling, paid quota, or recovery behavior is outside the repository.
```

## Computational amplification attack classes (subagent_type: `general`)

**Superlinear parsing, matching, or evaluation**
A small accepted input drives catastrophic regex backtracking, nested parsing, recursive validation, symbolic evaluation, graph traversal, template expansion, or adversarial sort/hash behavior. Derive the accepted depth/cardinality and the complexity. Then demonstrate a bounded growth curve locally.

**Decompression and representation amplification**
Compressed, sparse, nested, aliased, or encoded input expands far beyond the checked transfer size or file size. Verify the limits after every expansion and across parser stages. This includes archives, images, fonts, structured documents, and protocol compression tables.

**Database and downstream query amplification**
A small request creates broad scans, pathological joins, fan-out, unbounded sort/aggregation, or many downstream calls. The cause is that query depth, filter cardinality, pagination, or expansion fields are not bounded. Confirm that authorization does not intentionally permit the same resource scope.

## Resource accumulation attack classes (subagent_type: `general`)

**Unbounded buffering and cardinality**
Bodies, out-of-order streams, uploads, sessions, unique cache keys, metrics labels, log fields, subscriptions, or pending jobs accumulate without per-item and aggregate limits. Find the cleanup and expiration on disconnect, timeout, cancellation, and partial parse.

**File descriptor, handle, and temporary-resource leaks**
Malformed or canceled work misses cleanup. It then retains sockets, files, database cursors, timers, subprocesses, temporary files, or object references. Confirm that the leak repeats through bounded local iterations and affects a shared pool.

**Detached work after cancellation**
A client timeout, disconnect, canceled job, or failed authorization returns control but leaves database, model, network, or worker work in progress. Trace the cancellation and deadline propagation through every layer.

## Quota and scheduling attack classes (subagent_type: `general`)

**Pre-authentication work imbalance**
Expensive parsing, key lookup, cryptography, decompression, or external requests happen before authentication and before the earliest size/rate gate. Compare the minimal effort of the requester with the cost to the shared service. Check the upstream limits.

**Quota-accounting scope and reset gaps**
Accounting uses an IP, route, tenant, key prefix, task ID, or other dimension that an attacker can influence. This lets the work of one principal escape its intended budget or consume the allocation of another principal. Review integer overflow, distributed races, retries, reconnects, and account switching.

**Worker, pool, and priority starvation**
Low-priority or attacker-controlled jobs hold shared locks, workers, database pools, event-loop turns, or scheduler priority that unrelated users need. Require a path that bypasses queue/concurrency fairness or retains a slot beyond its deadline.

## Failure and recovery attack classes (subagent_type: `general`)

**Reachable fatal error or deadlock**
An untrusted input reaches `panic`, abort, fatal assertion, unhandled exception, process exit, lock cycle, or infinite loop in a shared process. Confirm the supervisor scope. Confirm if one worker or the whole service becomes unavailable. A restarted isolated worker can reduce the impact but does not remove the defect.

**Retry storm and fail-open amplification**
Timeouts, dependency errors, partially processed messages, or health-check failures cause synchronized or unbounded retries. The retries have no jitter, ceilings, circuit breaking, or deduplication. Verify that one bounded failure source can create persistent aggregate work.

**Poison-record and head-of-line blocking**
One malformed record or message fails repeatedly at the front of a shared queue, partition, startup scan, migration, or recovery loop. Review the skip/quarantine policy and the offsets. Check if other tenants share the blocked unit.

**Unsafe recovery and capacity rollback**
A restart, restore, fallback, or cleanup path rebuilds unbounded state, ignores current quotas, or restores the input that immediately repeats the failure. The correctness of recovery is part of availability.

## Universal moves (apply across the above)

- Build an input-to-resource table. Include the earliest accepted size/cardinality, work before auth, downstream fan-out, persistence, shared pool, limit and cleanup owner, and recovery.
- Compare aggregate limits with per-object limits. Ten thousand valid one-byte items can evade a per-message cap and still exhaust tenant-wide or process-wide state.
- Validate only in an isolated fixture with strict CPU/memory/time limits and small growth points. Mock external and paid calls. Stop when the missing bound or cancellation is observable.

## Validation rules (apply before reporting ANY finding here)

1. Name the untrusted input, the work of the requester, the service amplification or retained resource, the shared blast radius, and the recovery. Missing limits without concrete shared impact are hardening.
2. Confirm that no source-visible upstream, parser, queue, tenant, or framework bound prevents the path. Unknown deployed controls require `needs_validation`.
3. For superlinear behavior, establish the accepted complexity and the bounded local growth. For leaks, show repeatable retention after the point where cleanup should occur. For fatal paths, identify the process/supervisor isolation.
4. Prioritize by low requester work, unauthenticated reachability, cross-tenant scope, persistence, and poor recovery. Do not validate with availability impact.
5. Return `confirmed` only with safe local proof and a meaningful shared effect. Return `needs_validation` with the exact upstream limit, topology, quota, or recovery observation that an owner must check.
