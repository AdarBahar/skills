# Supply Chain and Release Hunting

#### When to use this file

Use this file when the target does one of these actions: resolves dependencies, builds from untrusted contributions, runs CI, creates release artifacts, signs or promotes builds, loads plugins, or updates deployed software. This domain covers the trust handoffs from source and dependency to the artifact that a user runs. Use `MEMORY-SAFETY-AND-BINARY.md` for flaws inside a local binary loader. Use `CLOUD-AND-DEPLOYMENT.md` for the authority of a runtime workload.

Split a large target into dependency resolution, CI isolation, artifact provenance, release authorization, and updater/plugin trust.

## Core discipline (include in every agent prompt for this domain)

```
- A mutable or known-vulnerable dependency is not a finding by itself. Show who can influence resolution, which build consumes it, and what execution or release boundary follows.
- Follow integrity across every handoff: source identity, resolved inputs, build worker, artifact identity, test result, signature/attestation, promotion, and update consumer.
- CI configuration is authorization code. Establish which event triggered a workflow, whose code runs, which secrets and tokens exist, and what it may publish or mutate.
- A checksum fetched from the same untrusted location as the artifact does not establish independent integrity. Identify the trusted root and failure behavior.
- Use `confirmed` for in-repo control-flow failures with bounded local validation. Use `needs_validation` for branch protection, hosted-runner, registry, signing-service, or production promotion facts that are not observable.
```

## Dependency and build-input attack classes (subagent_type: `general`)

**Dependency source and namespace confusion**
The resolver configuration can select an unintended public or private namespace, fallback registry, mirror, repository, or source URL. Review the package names, source priority, lockfile use, checksum use, and alternate build files. Also review platform-specific resolution and the difference between first-install and update behavior.

**Mutable and unbound build inputs**
A build can consume branches, tags, unverified submodules, downloaded tools, generated assets, remote includes, floating CI actions, or container tags. The content of these inputs can change without source review. Require a lower-trust writer and a path into the trusted build output. Reproducibility alone does not prove authenticity.

**Generated-source and codegen provenance gaps**
Schemas, vendored archives, generated clients, localization, documentation examples, or binary blobs can produce executable or shipped content. These items can lack the review and integrity gate that source has. Compare local regeneration with the committed output. Verify who controls the input and the generator.

**Build-context inclusion**
Secrets, local configuration, repository metadata, test fixtures, or developer artifacts can enter a package or image. This occurs when the build context and ignore rules are larger than the intended release inputs. Confirm that the resulting artifact exposes a real credential, private data, or privileged configuration.

## CI and automation attack classes (subagent_type: `general`)

**Untrusted code in a privileged workflow**
A pull request, issue comment, fork, dependency update, or external event runs contributor-controlled code. The code runs with protected secrets, write tokens, deployment authority, or a trusted runner. Compare the trigger type, checkout ref, approval gate, environment protection, and permission narrowing. Do not assume repository-host defaults that are not in the source.

**Workflow command and expression confusion**
Attacker-controlled branch names, commit messages, issue fields, artifact names, matrix values, or generated output can enter some targets. These targets are shell commands, template expressions, paths, or privileged workflow inputs. This happens without canonical validation.

**Cache, artifact, and workspace trust mixing**
A lower-trust job can populate a cache, artifact, shared workspace, or output. A higher-trust job later restores that item and executes or releases it. Review the cache keys and namespaces, the artifact producer identity, the digest binding, and the retention. Also check if promotion resolves the item again by a mutable name.

**Automation identity overreach**
CI jobs receive more permissions than the operation, repository, environment, or duration needs. Untrusted job inputs can select the affected resource. Missing least privilege alone is hardening. Require a reachable privileged action.

## Release and update attack classes (subagent_type: `general`)

**Build-to-promotion substitution**
Tests, review, signature, and publication refer to mutable tags, filenames, channels, or artifact IDs. They do not refer to the same immutable digest. Check every copy, repack, architecture merge, and provenance step between build and release.

**Release authorization and signing-policy gaps**
A release or signature is accepted from the wrong workflow, repository, branch, environment, key role, or threshold. Review the identity claims inside attestations. Verify that the consumer validates these claims and does not only check for a valid signature. Rotation, expiry, and revocation must fail closed where policy requires it.

**Update metadata and rollback confusion**
An updater authenticates the payload bytes but not the version, product, platform, channel, target path, expiry, or rollback state. Or the updater accepts metadata and payload from different authorized transactions. Verify the atomic installation and the recovery behavior. A signature API call without policy binding is incomplete.

**Plugin and extension trust expansion**
An extension package gains host authority beyond its declared scope. Or a lower-trust publisher can replace the identity of another publisher. Or install/update hooks run before the authenticity and capability checks. The intended installation of arbitrary same-user plugins is not a privilege boundary.

## Universal moves (apply across the above)

- Walk backward from a released digest or installed update. Find every source, generated input, credential, worker, cache, test result, and authorization decision.
- Compare untrusted and protected workflow events side by side. Mark each persisted channel that crosses between them. Require an immutable identity and producer trust.
- Review the paths for a revoked key, failed download, missing attestation, partial platform release, rollback, and registry outage. The failure policy is part of release integrity.

## Validation rules (apply before reporting ANY finding here)

1. Name the lower-trust actor, the controllable source/cache/artifact/metadata, and the consuming trusted job or updater. Name the resulting unauthorized publication, code inclusion, secret disclosure, or privileged execution.
2. Prove the artifact identity across the broken handoff. A different mutable name or an unbound digest must reach a real consumer.
3. Verify the built-in package-manager, repository-host, registry, and signing defaults for the pinned version. Unknown hosted controls require `needs_validation`.
4. Keep local validation bounded. Use a harmless fixture repository, a dummy credential marker, a local registry/config, and a non-production artifact namespace. Do not publish or alter a real release.
5. Return `confirmed` only with a complete source-visible handoff and a meaningful result. Return `needs_validation` with the precise branch, runner, registry, signing, or deployment fact that an owner must observe.
