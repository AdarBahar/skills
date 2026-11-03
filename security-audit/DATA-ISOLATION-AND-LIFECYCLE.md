# Data Isolation and Lifecycle Hunting

#### When to use this file

Use this file when the target stores multi-tenant or access-controlled data, derives search/index/cache/analytics copies, or issues object links. Also use it when the target exports or restores records, migrates schemas, or promises deletion, revocation, and retention behavior. This domain follows one data item through every copy and state transition. Use `ATTACK-CLASSES.md` for endpoint-level access control. Use `CLOUD-AND-DEPLOYMENT.md` for provider-level storage policy.

Split a large target by primary storage, cache/search, object/blob storage, analytics/logs, export/backup, deletion/revocation, and migration.

## Core discipline (include in every agent prompt for this domain)

```
- A tenant or owner field on a record is not isolation. Find the query, key, path, policy, or row-level control that enforces it for each read and write path.
- Trace derived copies. Sanitized primary data can become unsafe in search, cache, analytics, export, previews, logs, replicas, and backups with different ACL and retention rules.
- Deletion and revocation are lifecycle contracts. Check current, historical, cached, indexed, exported, restored, and queued copies within the product's stated boundary.
- Privacy or retention preference is not automatically a security vulnerability. Require an explicit data-access boundary or deletion/revocation guarantee and an unauthorized reader or later operation.
- Use `confirmed` for complete source-visible lineage and bounded dummy-tenant tests. Use `needs_validation` when external storage policy, retention, CDN behavior, replica lag, or backup access is unavailable.
```

## Tenant and object-isolation attack classes (subagent_type: `general`)

**Missing tenant or owner enforcement**
One of these operations identifies an object but does not bind it to the authenticated tenant/owner:
- Read
- Update
- Delete
- List
- Count
- Bulk query

Or the operation trusts body fields to supply that identity. Compare these paths:
- Direct lookup
- Nested relationship
- Background
- Admin
- Import
- Legacy

**Composite-key and namespace collision**
Cache keys, object paths, database uniqueness, search document IDs, temporary files, or deduplication keys omit the tenant or environment. Two principals can overwrite or retrieve the same logical key, even though the application records carry separate owners.

**Policy and query disagreement**
Row-level policy, ORM default scopes, authorization filters, and raw/bypass clients apply different predicates. Check joins, aggregates, aliases, views, transactions, `unscoped` clients, service clients, and error paths where the context is missing.

**Blob and signed-reference overreach**
These items can permit operations or namespaces beyond the access of the issuing principal:
- Object keys
- Attachment IDs
- Version IDs
- Shared links
- Signed URLs

Or they remain valid after the underlying ACL changes. Bind these to the reference:
- Operation
- Exact object/version
- Audience
- Expiry
- Tenant

## Derived-data and disclosure attack classes (subagent_type: `general`)

**Search, cache, and index ACL drift**
The ACL or lifecycle of a primary record changes. A searchable, cached, embedded, thumbnail, RSS, preview, or index copy is not invalidated. Validate the filter at retrieval time, as well as at document ingestion and invalidation.

**Analytics, logs, traces, and diagnostics as alternate readers**
Private content or credentials go into systems with broader access, longer retention, or tenant mixing. Confirm the data class and the realistic reader. Field names, public identifiers, and operator-only content under the intended policy are not enough.

**Enumeration and aggregate oracles**
Counts, filters, ordering, errors, unique constraints, timings, notification behavior, or existence checks disclose the state of a protected object or account. Require a concrete confidential predicate and an observable distinction. General response variance is not enough.

## Export, backup, restore, and migration attack classes (subagent_type: `general`)

**Export and backup scope expansion**
An export, snapshot, portability package, report, or backup includes other tenants, inaccessible object fields, soft-deleted data, or secret values. It can also include history above the access of the requester. Check the per-item authorization after selection. Check the authorization to download the final artifact.

**Import and restore authority expansion**
A restore or import bypasses owner, schema, ACL, uniqueness, or validation rules. Or it overwrites existing resources. Or it recreates records in a tenant that the requester cannot write to. Validate archive contents as untrusted. Authorize the resulting operation and do not trust the prior provenance.

**Migration default and ownership confusion**
Old records lack tenant, ACL, or lifecycle fields. Incompatible IDs collide. A partial rollout makes new and old readers apply different defaults. Review the backfill, dual-read/write, compatibility, rollback, and resumed-migration paths.

**Backup and replication boundary drift**
These items can have a broader identity or tenant scope than the primary data:
- Encryption keys
- Storage accounts
- Cross-region replicas
- Restoration environments
- Support snapshots

Source can confirm only the in-repo policy. Hosted access and retention require `needs_validation`.

## Deletion, revocation, and lifecycle attack classes (subagent_type: `general`)

**Soft-delete and tombstone bypass**
A direct lookup, search, relation traversal, object link, background processor, or restore ignores the lifecycle predicate. It then returns or acts on a deleted or revoked record. Check if soft-deleted identifiers can be registered again before all references are gone.

**Stale authorization and derived copy use**
A membership removal, ACL update, consent withdrawal, secret revocation, or role downgrade does not invalidate some items. These items are sessions, caches, subscriptions, jobs, or materialized data. They continue to authorize future operations.

**Retention and queued-work overrun**
Deletion completes in primary storage. Queued processors, retries, exports, analytics, or generated artifacts then recreate the data or keep it beyond the promised boundary. Find the idempotent deletion and the tombstone propagation.

**Restore reintroduces invalid state**
A backup, undo, undelete, or replica recovery restores data, credentials, memberships, or permissions that current policy no longer allows. Authorize the restored state again. Apply again the lifecycle changes that occurred after the snapshot.

## Universal moves (apply across the above)

- Pick one protected record. Draw the primary write, query, cache, index, event, export, backup, deletion, and restore paths. Mark the principal and tenant at every edge.
- Compare two dummy tenants through the same local service methods. Repeat after an ACL change, deletion, account switch, and restore. Do not use real user data.
- Start at the bypass clients, background jobs, migrations, global uniqueness, and cache keys. These paths commonly omit the request-scoped identity that interactive endpoints carry.

## Validation rules (apply before reporting ANY finding here)

1. Name the attacker or lower-trust principal, the protected data/state, and the affected owner/tenant. Name the alternate copy or operation, and the unauthorized disclosure or mutation.
2. Cite both the intended source-of-truth policy and the path that omits it or disagrees with it. Confirm that no other layer enforces the same tenant/lifecycle condition.
3. Use local dummy tenants and non-sensitive fixtures to prove cross-scope access or stale lifecycle behavior. Stop at the minimum observable record or operation.
4. If the proof needs external cache, object storage, replicas, analytics, backup, or retention policy, classify the candidate as `needs_validation`. State the check that the owner observes.
5. Return `confirmed` only with complete lineage and concrete boundary impact. Return `needs_validation` with the exact unresolved storage, ACL, invalidation, retention, or restore fact.
