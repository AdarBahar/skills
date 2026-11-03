# Cloud and Deployment Hunting

#### When to use this file

Use this file when the repository defines any of these items: cloud identity, infrastructure, containers, Kubernetes, service mesh, serverless functions, edge workers, ingress, object storage, managed services, or environment-specific configuration. This domain asks if the deployed components receive the intended identity, isolation, network reachability, secrets, and policy. Source often shows intent and not live fact. Separate the source-confirmed defects from the deployment validation needs.

Use `SUPPLY-CHAIN-AND-RELEASE.md` for build and promotion trust. Use `WEB-PROTOCOL-AND-AUTH.md` for HTTP proxy semantics. Use `DATA-ISOLATION-AND-LIFECYCLE.md` for the tenant scope of a data store.

## Core discipline (include in every agent prompt for this domain)

```
- Do not infer a live exposure from a manifest alone. Establish which environment consumes it, what defaults or overlays modify it, and whether the source path is active.
- Map each workload's identity to specific operations and resources. Broad policy is a finding only when lower-trust input can reach an unauthorized action.
- Ingress, proxies, service mesh, metadata services, and admission policy are real boundaries, but only count a control when its configuration and attachment are visible.
- Secret references are not secret disclosure. Require a lower-trust reader, output, artifact, log path, or unsafe fallback.
- Use `confirmed` for active in-repo configurations and local rendering/policy validation. Use `needs_validation` for account policy, network attachment, runtime admission, hosted metadata, or drift that needs owner observation.
```

## Workload identity and IAM attack classes (subagent_type: `general`)

**Workload identity overreach**
A workload, pod, function, edge worker, or node identity can act on tenants, accounts, resources, or APIs beyond its role. Untrusted request or job input selects that target. Review the cloud policy conditions, resource patterns, service-account attachment, namespace mapping, and fallback credentials.

**Cross-account or cross-tenant role confusion**
Role assumption, external IDs, token exchange, workload federation, or resource policies accept identity claims. These claims are not bound to the intended source account, audience, repository, namespace, or workload. Establish both the trust policy and the caller-controlled claim.

**Application authorization delegated to cloud metadata**
An app trusts caller-supplied identity headers, tags, labels, account IDs, or resource metadata. The app does not verify that they came from the cloud control plane or a trusted proxy. Cloud IAM and application authorization are separate checks.

## Ingress, network, and control-plane attack classes (subagent_type: `general`)

**Unexpected service or management-plane reachability**
An ingress, service, listener, security group, load-balancer annotation, port mapping, or server bind exposes an API to a lower-trust network. The API is an admin, debug, metrics, node, control-plane, or internal API. Missing network controls alone are `needs_validation`. A repository-controlled public route to a sensitive handler can be `confirmed`.

**Trusted-proxy and mesh identity bypass**
A backend accepts a forwarded identity, mTLS subject, or authorization metadata from peers outside the intended ingress/sidecar. Or an alternate port, health path, or legacy path bypasses the mesh. Verify the header stripping, the peer reachability, and the fail-open behavior when the proxy is absent.

**Metadata and internal-service reachability**
An untrusted URL, destination, or protocol selection reaches instance/container metadata, control-plane sockets, or internal APIs with workload credentials. Trace the URL parsing and redirect handling under `ATTACK-CLASSES.md`. In this file, establish the deployed network, metadata-version, and identity boundaries.

## Container and orchestration attack classes (subagent_type: `general`)

**Host or control-plane capability exposure**
A lower-trust workload can select privileged mode, capabilities, host namespaces, host paths, device mounts, container runtime sockets, or service-account tokens. These items cross into node or control-plane authority. The bare absence of seccomp or a read-only filesystem is hardening, unless a reachable operation crosses that boundary.

**Admission and policy path inconsistency**
One deployment route enforces image identity, namespace, resource, secret, or privilege policy. Another controller, job, upgrade, restore, or compatibility path does not. Confirm the alternate route and the resulting deployed object.

**Namespace and label trust confusion**
Network, admission, secret, or workload-identity policy relies on labels, annotations, names, or namespaces that a less-trusted principal can set. Compare who controls the selectors with the authority that the match grants.

## Configuration and secret lifecycle attack classes (subagent_type: `general`)

**Security-control precedence drift**
Development values, chart defaults, environment variables, command-line flags, feature gates, or sidecar injection can disable authentication, transport security, tenant scoping, or audit policy. Per-region overlays can do the same. This happens in a deployed environment. Render the final configuration for each maintained deployment. Do not review only the base file.

**Secret exposure across workload boundaries**
Secrets enter logs, crash reports, process arguments, shared environment, broad volumes, build outputs, service discovery, or read APIs. Another workload or tenant can access these. Check the secret type and authority. A public endpoint or key ID is not a credential.

**Credential renewal and outage fallback**
A failure to mount, refresh, rotate, or revoke a workload credential can leave stale credentials active. It can also cause an app to accept a less trusted identity mode. Review the startup, readiness, reconnect, and cached-client behavior.

## Managed storage, events, and edge attack classes (subagent_type: `general`)

**Object and signed-URL policy confusion**
Bucket/container policy, object keys, CDN origins, or signed URLs fail to bind the principal, operation, object namespace, audience, or expiry. Review the list/version operations and the write paths, as well as the reads.

**Event-source identity confusion**
A function or worker trusts event body fields as the source identity. It does not validate the provider-signed envelope, subscription/topic, account, region, and replay state. Compare the push, pull, retry, and dead-letter paths.

**Edge/runtime boundary mismatch**
An edge or serverless runtime assumes a secret, API, filesystem, isolation, or tenant policy that differs from the origin runtime. A fallback to the origin then changes the authority or cache behavior. Confirm which configuration selects each path.

## Universal moves (apply across the above)

- Render every maintained environment. Make a matrix of external port, workload identity, network peers, mounted secrets, and cloud resources. Each difference needs an owner or policy explanation.
- Follow a lower-trust request, object, label, or event into the cloud policy. Show which workload credential does the final operation. Show which condition should scope it.
- Diff the normal deploy, migration, restore, node maintenance, failover, and local/emulator paths. Review the behavior when the mesh, admission, identity, secret, or policy service is unavailable.

## Validation rules (apply before reporting ANY finding here)

1. Establish the active source path and the effective deployment object. If you cannot, use `needs_validation` and state which rendered manifest or owner-observed attachment is missing.
2. Name the lower-trust caller/workload, the cloud or application identity, the controllable selector, the affected resource, and the unauthorized operation or disclosure.
3. Verify the provider and orchestrator defaults at the pinned version. Do not assume a public IP, a reachable metadata service, a permissive firewall, or an absent admission attachment.
4. Local validation can render templates, evaluate policy, inspect container/user namespaces in an isolated fixture, or run an emulator with dummy identities. Do not probe live endpoints. Do not alter shared cloud resources.
5. Return `confirmed` only with a complete active source trace and a concrete boundary result. Return `needs_validation` with the exact deployed policy, identity attachment, overlay, network, or drift observation that you need.
