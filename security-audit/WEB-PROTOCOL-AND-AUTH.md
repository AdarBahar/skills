# HTTP-Protocol and Authentication Hunting

#### When to use this file

Use this file when the target speaks HTTP at a parsing, cache, browser-authentication, or identity boundary. Examples are web applications, APIs, reverse proxies, CDNs, gateways, and custom HTTP servers. Also use it for services that implement sessions, JWT, OAuth/OIDC, SAML, password recovery, MFA, passkeys, API keys, or mTLS. Use this file with `ATTACK-CLASSES.md`. Access-control review asks if a principal may perform an operation. This file asks if the HTTP layer or the identity layer can confuse which principal, request, assurance level, or token owns the operation.

Pick classes from Phase 1. Split a large target into these parts: request framing and cache policy, browser authentication, federated identity, strong authentication and recovery, service credentials, and session lifecycle. A single server behind an unobserved managed proxy has little smuggling surface that the source can confirm. A proxy or a custom parser has much more.

## Core discipline (include in every agent prompt for this domain)

```
- Framing and cache findings require two interpretations of the same request, response, or key. Name both components and the exact normalized value on each side.
- For every credential, find the signature or secret verification and every binding required for its role: issuer, audience, origin, RP, client, session, principal, resource, assurance, expiry, and one-time state.
- Host, Forwarded, X-Forwarded-*, Origin, Referer, redirect targets, callback state, and request-derived URLs are trust decisions. Trace each to the affected identity or response.
- A missing header, cookie attribute, MFA prompt, or rate limit is not a finding alone. Require an accepted invalid request, cross-principal impact, assurance downgrade, or credential disclosure.
- Classify `confirmed` only from complete source evidence and bounded local request/token tests. Use `needs_validation` when proxy, IdP, browser, certificate, secret, or deployed configuration is required but not visible.
```

## HTTP framing and cache attack classes (subagent_type: `general`)

**Request framing and desynchronization**
The front end and the back end disagree on the request length or on the header normalization. Review these items: multiple `Content-Length` values, `Transfer-Encoding`, HTTP/2 or HTTP/3 downgrade, header-name normalization, forbidden connection headers, and CR/LF conversion. Confirm which bytes one component assigns to a request. Confirm which bytes its peer assigns to the next request.

**Web cache poisoning through unkeyed input**
A request value changes the cached content or the security-relevant headers, but the cache key does not include it. Compare the construction of the cache key with every response variant. Variants include the forwarded host and scheme, selected cookies, query normalization, language and device headers, and authorization state.

**Cache deception and private-response caching**
The cache routing treats a private dynamic path as a public static asset. Alternatively, the cache stores a response, and the policy does not include the identity and authorization inputs of that response. Compare the edge cacheability with the route parsing of the application. Also compare it with the suffix and path-parameter normalization and the response cache directives.

**Host and forwarded-header trust**
Untrusted host or proxy metadata determines one of these: absolute URLs, tenant routing, callbacks, reset links, cache keys, or the client address that authorization uses. Confirm who can supply the header. Confirm if the trusted ingress removes the client-provided copies.

**Response-header injection**
Untrusted data reaches `Location`, `Set-Cookie`, CSP, or another response header with unsafe control characters or normalization. Verify if the framework rejects the data before you report. Require a security-relevant change in the response.

## Browser-session attack classes (subagent_type: `general`)

**Ordinary CSRF**
A browser sends ambient credentials to a state-changing endpoint. The endpoint accepts a cross-site request and has no effective anti-CSRF token, no same-site request binding, and no strict Origin/Referer validation. Make an inventory of every cookie-authenticated mutation. Include form, JSON-like, multipart, method-override, and legacy routes. SameSite is effective only for the cookie and the browser contexts that the code actually uses. Login CSRF and cross-site subresource requests can have different requirements.

**Session fixation and invalidation**
The code does not rotate session identifiers on login, account switch, MFA completion, impersonation, or other privilege changes. Alternatively, session identifiers stay valid after logout, password change, revocation, and account disable. Check server sessions, refresh tokens, signed cookies, websocket state, cache copies, and fallback endpoints.

**Cookie scope and transport**
A sensitive cookie has an over-broad `Domain` or `Path`. Alternatively, it can cross an insecure transport, or it conflicts with a sibling cookie that another component selects differently. Missing flags alone remain hardening notes. They become findings only if a realistic less-trusted origin, network position, or browser path can gain or replace the credential.

## Federated-identity attack classes (subagent_type: `general`)

First, establish the role. Controls of the authorization server do not belong to a relying-party client. Examples are redirect allowlists and the issue of codes. Verification and binding defects belong to the component that consumes the artifact.

**JWT verification and claim binding**
Check the signature verification, the algorithm that the server pins, and the key source. Then check `exp`, `nbf`, `aud`, and `iss`. Review `kid`, `jku`, and `x5u` as untrusted key selectors. Also review duplicate and header normalization and the paths that decode without verification. A valid token for another service is invalid here, even when a trusted issuer signed it.

**OAuth/OIDC request and callback binding**
Validate these items. Validate the exact `redirect_uri` ownership where the target is the authorization server. Validate the `state` that is bound to the session. Validate PKCE and the authorization-code binding where they apply. Validate the issuer, audience, signature, and nonce of the ID token. Validate the selected-IdP binding in multi-provider flows. Compare the initial callback, retry, mobile and deep-link, and account-link routes.

**SAML signed-object and assertion binding**
Make sure that the element with the validated signature is the element that the code uses as identity. Review the unsigned and fallback paths, the safe XML parser configuration, and the canonicalization differences. Review the freshness and binding fields. These are the validity windows, the audience and recipient, the request correlation, and the replay state.

## MFA, passkey, and account-transition attack classes (subagent_type: `general`)

**MFA enrollment and assurance downgrade**
Enrollment, replacement, disablement, recovery-code generation, trusted-device creation, and fallback login require the intended prior assurance. Check that a valid first factor cannot enroll or replace the second factor. This applies when policy requires fresh authentication. Also check that disabled or stale factors no longer authorize sessions.

**Step-up binding and bypass**
A successful challenge upgrades the wrong session, account, tenant, action, or API request. Alternatively, an alternate route omits the assurance check. Bind the challenge to these items: the principal, the current session, the assurance target, the operation or resource when required, the expiry, and the one-time completion. Compare the UI, API, batch, recovery, and resumed-flow paths.

**WebAuthn and passkey verification**
At registration, bind these items to the session that starts the registration: the challenge, the RP ID, the expected origin, the credential, the user and userHandle, the algorithm, and the user verification that the policy requires. At authentication, verify the challenge, the RP and origin, the credential membership, the signature, and the intended user presence or verification. Check the account-discovery and linking flows for userHandle or credential-to-account confusion. Handling of the signature counter is meaningful only when the product treats regressions as a clone signal.

**Account linking and identity collision**
The code adds one of these to an existing account:
- an IdP
- a passkey
- an email
- a phone
- a device
- an external account

This action must require all of these:
- a current authenticated session
- verified ownership of the new identity
- the step-up that policy requires
- callback state that is bound to the account that starts the linking

Review the unlink, relink, and invite-acceptance paths for collisions of verified identifiers or tenants.

**Password reset and broader recovery**
These recovery paths often become the weakest authentication path:
- recovery tokens
- support and admin recovery
- backup codes
- device migration
- email or phone change

Verify these items:
- the token randomness
- the user and action binding
- the expiry
- the one-time state
- the rate and accounting controls
- the trust of the delivery URL

Also verify that the code invalidates prior tokens and sessions. Different responses that only reveal public account existence are not automatically security findings.

## API-key and mTLS attack classes (subagent_type: `general`)

**API-key scope and resource binding**
A key authenticates to more tenants, resources, actions, or environments than its server-side record grants. Alternatively, request parameters override those bindings. Review the key lookup and the prefix and full-secret verification. Review the type confusion between publishable and secret keys. Review the scope checks, rotation, revocation caches, and bulk endpoints.

**API-key exposure and unsafe transport**
Keys appear in client bundles, URLs, redirects, logs, error paths, build artifacts, or responses that a lower-trust principal can access. A public identifier that is called a key is not a secret. Confirm the key type and the authority that the disclosure gives.

**mTLS peer and application-identity confusion**
One of these faults exists. A process trusts client-certificate identity headers from any network peer. A process verifies a chain but maps attacker-influenceable subject text to an account incorrectly. A process accepts a certificate for the wrong trust domain, extended usage, audience, or validity policy. A trusted proxy can terminate mTLS. In that case, verify only these points: only that proxy can connect, it removes incoming identity headers, and the backend binds the sanitized identity to the request.

**Certificate lifecycle fallback**
Expired, revoked, missing, or renewal-failed certificates cause a silent fallback to bearer-only or anonymous operation. Alternatively, long-lived pooled connections keep their authorization after revocation. If deployment revocation data is missing, the result is `needs_validation`. The source can confirm a fail-open branch in the repository.

## Universal moves (apply across the above)

- Follow this path for every credential and challenge: issue, store, transmit, consume, refresh, revoke. Compare the normal, error, retry, migration, legacy, and account-switch paths.
- List every door to the same identity and every route to the same sensitive operation. The effective policy is the weakest parallel path. It is not the most polished UI.
- Compare the normalization of the parser, proxy, router, cache, and application side by side. For local validation, give identical bounded request fixtures to each component. Do not send traffic to a live deployment.
- For recovery and linking, draw the account graph before and after. Each edge must name the current principal, the proof of the new identity, the required assurance, the callback and session binding, and the revocation effect.

## Validation rules (apply before reporting ANY finding here)

1. Apply a source-visibility gate. These items can be outside the repository: proxy chains, edge cache keys, IdP policy, certificate trust, browser cookie behavior, secrets, and deployed auth modes. Record a precise `needs_validation` candidate. Do not assert the behavior of missing infrastructure.
2. For framing and cache findings, name both components and the divergent parse or key. Confirm the cross-request, cross-user, or private-response impact with bounded local fixtures.
3. For token, MFA, passkey, account-link, recovery, API-key, and mTLS findings, cite the verification line. Also cite the missing principal, session, resource, origin, audience, action, or assurance binding. Prove that the server accepts the invalid transition or credential.
4. For CSRF, name the ambient credential, the state-changing route, the accepted cross-site request shape, the browser cookie policy, and the missing effective check. Read-only actions do not qualify. Routes that require a non-ambient bearer token do not qualify.
5. Verify the defaults of the framework and the library. If the version or the configuration is unknown, use `needs_validation`. Do not turn an unverified critical claim into a confirmed finding with a lower severity.
6. Return `confirmed` only with a complete source trace and an observable unauthorized identity, state, or disclosure. For `needs_validation`, name the missing fact. Also name the safe local or owner-observed check that resolves it.
