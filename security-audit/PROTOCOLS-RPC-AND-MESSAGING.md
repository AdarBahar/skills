# Protocols, RPC, and Messaging Hunting

#### When to use this file

Use this file when the target uses gRPC, GraphQL transports, Cap'n Proto, Thrift, Protobuf, custom binary protocols, streaming RPC, webhooks, brokers, queues, pub/sub, or event buses.

This file covers peer identity, logical message interpretation, routing, replay, ordering, and delivery semantics. Use `MEMORY-SAFETY-AND-BINARY.md` for parser memory safety. Use `WEB-PROTOCOL-AND-AUTH.md` for HTTP framing. Use `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` for availability impact.

Split a large system by producer/consumer pair, external/internal peer role, synchronous RPC, streaming, and asynchronous message path.

## Core discipline (include in every agent prompt for this domain)

```
- "Internal" is not authentication. Name the peer identity at every hop and show how it becomes the application principal used for authorization.
- Schema validation proves message shape, not provenance, resource authority, ordering, or safe values. Follow decoded fields to policy and side effects.
- Broker guarantees and application guarantees differ. Write down retry, ordering, acknowledgement, deduplication, and transaction behavior before evaluating state changes.
- Parser disagreement requires two concrete consumers, schema versions, or wire representations and one security-relevant divergent value.
- Use `confirmed` for source-complete paths plus bounded local producer/consumer tests. Use `needs_validation` for broker ACL, service-mesh identity, topic attachment, or compatibility behavior outside the repository.
```

## Framing, schema, and interpretation attack classes (subagent_type: `general`)

**Message boundary and canonicalization disagreement**
Components disagree on length, compression, duplicate fields, unknown fields, encoding, numeric width, normalization, or envelope/body precedence. Compare the generated and custom parsers, gateways, language bindings, and version converters. Confirm which principal, resource, or operation differs after decoding.

**Union, enum, and default confusion**
Unknown variants, missing discriminators, zero values, default privileges, or compatibility mappings reach code that assumes a validated case. Review the exhaustive dispatch and the default branches. Review how old consumers interpret newly added fields.

**Envelope and payload identity mismatch**
Authorization uses routing or envelope metadata that looks trusted. The handler acts on a conflicting tenant, account, subject, object, or sender in the body. Identify which source is authoritative. Make sure that clients cannot override it.

## RPC identity and authorization attack classes (subagent_type: `general`)

**Interceptor and method-path inconsistency**
An authn/authz interceptor applies to unary methods but not to streams, reflection, health, gateway-transcoded paths, compatibility services, or individual stream messages. Compare every registration and route to the same operation.

**Peer identity to application-principal confusion**
mTLS, workload identity, bearer metadata, forwarded identity, or broker credentials authenticate a channel. A caller-controlled field then selects the user or tenant. A deterministic policy must bind the channel identity and the claimed principal.

**Per-item and streaming authorization gaps**
A stream, subscription, batch, or bulk message is authorized one time. Later items then name different resources, or continue after the revocation of a role, membership, or token. Check again where the scope can change. Bind subscriptions to their original principal.

**Callback and reply-correlation confusion**
Correlation IDs that are predictable, reused, or cross-tenant let a response, webhook, cancellation, or acknowledgment satisfy the pending operation of another caller. Bind each outstanding request to the authenticated peer, tenant, operation, and lifecycle.

## Broker and queue isolation attack classes (subagent_type: `general`)

**Topic, routing-key, and subscription scope gaps**
A publisher or subscriber can select the topic, wildcard, consumer group, partition, reply queue, or dead-letter route of another tenant. Check the broker-enforced ACLs where visible. Check the application-side namespace construction. Tenant text inside a payload is not isolation.

**Dead-letter, retry, and diagnostic disclosure**
Messages sent to dead-letter queues, error topics, traces, or operator views contain secrets or cross-tenant payloads. A lower-trust consumer can access these. Review the policy and redaction at the failure path, and not only at normal delivery.

**Untrusted producer treated as control plane**
A message body can declare itself an admin event, provider callback, replication record, or migration instruction. The consumer does not independently authenticate the producer and event type. Verify the signatures and the source/account/audience binding before privileged handling.

## Replay, ordering, and transaction attack classes (subagent_type: `general`)

**Duplicate delivery and idempotency gaps**
Retries or redelivery repeat a side effect. The cause is that deduplication is absent, occurs after the mutation, or uses a key that collides across tenants or operations. Confirm the delivery model of the broker. Confirm the side effect that is not naturally idempotent.

**Out-of-order and stale message acceptance**
Older state, revoked membership, canceled work, or authorization from before a step-up arrives after newer state and overwrites it. Review the sequence/version checks, tombstones, partition changes, and restore/replay workflows.

**Acknowledgment/commit ordering defects**
Acknowledgment occurs before the durable commit and loses security-relevant work. Or the commit happens before an unreliable acknowledgment and duplicates a mutation. Evaluate the transactional outbox/inbox behavior and the failure recovery.

**Partial multi-consumer transitions**
Several consumers together implement one authorization or business transition. Retries and partial failure then leave only a subset committed. Identify the invariants that must become durable atomically or must compensate with current authorization.

## Universal moves (apply across the above)

- Draw producer → broker/transport → gateway → consumer → storage for each message family. At each hop, record the authenticated peer, the authoritative tenant/resource fields, the validation, and the side effect.
- Feed the same small fixture to every in-repo schema version or language binding. Test duplicate, missing, unknown, boundary, replayed, and reordered messages. Do not produce load.
- Compare the normal, retry, dead-letter, replay, migration, reflection, stream, and gateway-transcoded routes. Security policy must survive transport changes.

## Validation rules (apply before reporting ANY finding here)

1. Name the realistic producer or peer, the accepted message, the authenticated channel identity, and the affected principal/resource. Name the unauthorized mutation or disclosure.
2. For disagreement claims, cite both parsers/consumers and the divergent decoded value. If either side rejects the message safely, you cannot confirm the claim.
3. For replay/order claims, establish the actual delivery guarantees. Reproduce the invariant failure with a bounded local/in-memory transport.
4. For authorization and isolation, verify all interceptor, broker ACL, gateway, and consumer layers that are visible in source. External attachments make the candidate `needs_validation`.
5. Return `confirmed` only with the complete message lifecycle and an observed meaningful result. Return `needs_validation` with the exact broker, service identity, route, or delivery fact that you need.
