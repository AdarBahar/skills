# Client-Side and Browser Hunting

#### When to use this file

Use this file when a browser makes important trust decisions or renders untrusted content. This applies to single-page apps, browser extensions, embedded webviews, service workers, and offline applications. It also applies to code that renders attacker-influenced content into the DOM, receives cross-window messages, or uses browser storage. These paths include sources that the server never sees. Examples are URL fragments, `window.name`, `postMessage`, and previously cached content.

Use this file together with `ATTACK-CLASSES.md`. This file covers browser sources and sinks, origin boundaries, browser persistence, and cross-site state oracles. Use `DESKTOP-MOBILE-AND-LOCAL-IPC.md` for the native side of a webview bridge. Use `WEB-PROTOCOL-AND-AUTH.md` for server-side CSRF, sessions, and auth callbacks.

## Core discipline (include in every agent prompt for this domain)

```
- A client-side candidate needs a controllable source and an executing or disclosing sink. Name both and show attacker-influenced data reaching the sink.
- The impact must reach a victim's session, another origin, or shared persistence. Self-injection and disclosure of the attacker's own data are not findings.
- Framework escaping, browser same-origin policy, CSP, COOP/CORP, service-worker scope, and modern noopener defaults are real controls. Verify them before assigning impact.
- Browser storage and caches are shared by origin and may outlive login state. Identify who writes, who reads, and which account, tenant, or worker lifecycle clears each record.
- Use `confirmed` only for complete source evidence plus bounded local browser tests. Use `needs_validation` when renderer, extension permission, deployed header, or browser-policy behavior is required but unavailable.
```

## DOM and object-state attack classes (subagent_type: `general`)

**DOM-based XSS**
Trace these sources into a sink: `location` fields, `document.referrer`, `window.name`, message data, storage, and browser-controlled document state. These are the sinks: `innerHTML`, `outerHTML`, `document.write`, string-evaluating APIs, executable URLs, jQuery HTML APIs, and framework escape hatches. Interpolation that the framework escapes is not a finding.

**DOM clobbering**
Attacker-injected `id` or `name` attributes shadow a global, a form property, a configuration object, or an initialization flag. Later, the code trusts that value. Require two things. First, a markup path must keep the attribute. Second, the code must use the clobbered value in a security-relevant way.

**Prototype pollution and gadget chain**
An attacker-controlled key reaches a recursive write, such as a deep merge or a path assignment, and changes prototype state. Then a reachable gadget uses the polluted property to change authorization, execution, navigation, or rendering. `JSON.parse`, a shallow copy, or pollution without a gadget is not enough.

## Cross-origin messaging and network attack classes (subagent_type: `general`)

**`postMessage` origin and source trust**
A handler performs a sensitive action with `event.data`. It has no exact origin allowlist. Where multiple frames share an origin, it also does not check the expected `event.source`. On the send side, the code sends sensitive data to `*`, and an unintended embedder receives it. A weak match is not an origin check. Weak matches are substring, prefix, suffix, and unanchored-regex origin matches.

**Cross-site WebSocket request use**
A WebSocket upgrade accepts ambient cookies from an untrusted origin. It has no `Origin` check and no channel-specific token. The session of the victim then reads or changes data. Confirm the upgrade behavior. Also confirm a security-relevant message handler.

**Credentialed CORS trust**
The server reflects `Origin` or matches it weakly. The server also allows credentials and returns sensitive responses. Browsers reject a bare wildcard with credentials. Report only the actual reflected or allowed origin path and the cross-origin data or change.

## Service-worker and browser-storage attack classes (subagent_type: `general`)

**Service-worker registration and scope takeover**
Attacker-influenceable content can become the registered worker script. It can also control a path that receives an over-broad `Service-Worker-Allowed` scope. It can also change update imports when no integrity control exists. Verify the final script URL, the response MIME type, the origin, and the scope. Verify who controls every imported script. A normal same-origin worker with the intended scope is not a defect.

**Service-worker cache and identity confusion**
The worker caches personalized responses. Its policy does not include the account, the tenant, the authorization state, or the request mode. The worker then serves these responses after an account switch or a logout. Review fetch-event routing, cache names and keys, navigation fallbacks, and cache cleanup. Also check if the error and offline paths return the prior response of another user.

**Browser-storage disclosure and stale authorization**
Tokens, private responses, draft data, or authorization decisions stay in `localStorage`, `sessionStorage`, IndexedDB, Cache Storage, extension storage, or client state. Then another account or a less-trusted same-origin component can read them. Storage of a token alone is not a finding. Require a realistic reader with less authority. Alternatively, require continued use after revocation or logout.

**Cross-context storage and broadcast confusion**
`storage` events, `BroadcastChannel`, shared workers, or origin-wide caches carry identity or commands between tabs. They do not bind these to the current session. Check account switches, private and public windows, and tenant changes. Also check stale tabs that can overwrite a newer auth state.

## Cross-site information leak classes (subagent_type: `general`)

**XS-Leaks and cross-origin state oracles**
An attacker page can tell protected cross-origin state apart while the browser attaches the victim credentials. The attacker page uses resource load and error events, frame or window state, redirect behavior, timing, cache state, or response size. Require one concrete secret-bearing predicate. An example is whether a private object, role, or account exists. Generic timing variance or the availability of a public resource is not a finding.

**Window and opener state disclosure**
The permitted metadata or navigation result of a cross-origin window reveals protected state. Alternatively, a retained opener or named-window relationship lets an attacker-controlled page influence a privileged navigation. Check COOP, frame protections, `noopener`, and the exact origin. Also check if the observable state is confidential.

## UI-redress and navigation attack classes (subagent_type: `general`)

**Clickjacking**
A framed, state-changing action has no effective `frame-ancestors`, `X-Frame-Options`, or equivalent UI isolation. Require the sensitive action. Confirm that the action can complete in the framed state. Missing headers on read-only content are hardening notes.

**Client-side navigation confusion**
A client source controls a redirect or a navigation, and no scheme and destination policy exists. This includes executable `javascript:` or `data:` destinations. Reverse tabnabbing applies only in these cases. The code explicitly keeps `window.opener`. The code uses `window.open` without isolation. The code supports a browser without implicit `noopener`.

## Universal moves (apply across the above)

- Start from the DOM, navigation, worker, message, and storage sinks. Then trace backward to the browser-only sources and the server-controlled sources. Record the browser policy that should stop the path.
- Test account switch, logout, worker update, offline fallback, and stale-tab state. Use a local test origin and dummy accounts. Do not use production users, origins, or shared services.
- For XS-Leaks, list only the predicates that the source and the local browser behavior prove. Then identify the response headers or the rendering choice that remove the oracle.

## Validation rules (apply before reporting ANY finding here)

1. Cite the source, the sink, the browser policy, the affected origin or session, and the observable change or disclosure.
2. For prototype pollution, prove the recursive write and a security-relevant gadget. For DOM clobbering, prove that the markup stays and that the code uses the shadowed value.
3. For service workers and storage, prove that the lifecycle is reachable. An attacker-controlled write or cache entry must reach a different account, a different tenant, or a later authorization state.
4. For messaging, CORS, WebSocket, and XS-Leaks, show the exact origin and source validation. Show the protected state or action that the code exposes. Confirm that CSP, COOP/CORP, cookies, and SameSite policy do not already block it.
5. Return `confirmed` findings only with a complete client path and bounded local evidence. Return `needs_validation` with the precise deployed header, extension permission, browser version, or renderer behavior that an owner must verify.
