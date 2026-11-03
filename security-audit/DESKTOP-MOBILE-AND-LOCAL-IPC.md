# Desktop, Mobile, and Local IPC Hunting

#### When to use this file

Use this file when the target is one of these: a desktop or mobile app, privileged helper, updater, local daemon, webview host, deep-link handler, browser native-messaging host, or local IPC client/server.

The relevant untrusted actor can be a downloaded document, remote web content, another local app, another OS user, a sandboxed process, or a lower-privilege account. State that starting capability. Do not treat all local users as equivalent.

Use `CLIENT-SIDE.md` for browser-side webview behavior. Use `MEMORY-SAFETY-AND-BINARY.md` for native memory and loader safety. Use `SUPPLY-CHAIN-AND-RELEASE.md` for update authenticity.

## Core discipline (include in every agent prompt for this domain)

```
- Establish the realistic local or remote-content attacker: another app, another OS user, a sandboxed child, an untrusted document, or a remote origin. Self-harm within the same account and authority is not a boundary violation.
- Paths, process names, bundle/package IDs, and claimed sender fields are not peer authentication. Use OS peer credentials, code identity, capability handles, or protected channel state.
- The native bridge or helper must authorize each operation and final resource after parsing. A trusted UI or broker does not make attacker-influenceable arguments trusted.
- OS sandbox, signing, entitlements, permissions, keychain ACLs, exported-component policy, and prompt behavior are real controls when pinned and visible.
- Use `confirmed` for source evidence plus bounded local/emulator tests. Use `needs_validation` when signing, manifest merge, OS version, device policy, installer ACL, or packaging is required but not observable.
```

## Deep-link, callback, and navigation attack classes (subagent_type: `general`)

**Custom-scheme and deep-link ambiguity**
Another app or page can invoke a route that mutates state, imports data, completes authentication, or selects an account. The route is not bound to a current session and a one-time callback. Review the URI normalization, duplicate query fields, scheme/host/path matching, and exported activity/handler policy. Also review stale and replayed links.

**App and account handoff confusion**
These callbacks can return to the wrong installed app, profile, tenant, or pending transaction:
- OAuth
- SSO
- Magic-link
- Invite
- Device pairing
- Passwordless
- Payment

Bind the state to these items:
- Initiating app identity
- Current session
- Account
- Provider
- Operation
- Expiry

**File-open and intent authority confusion**
An associated file, share intent, drag/drop item, pasteboard/clipboard record, notification action, or open-file event triggers a privileged operation. The app does not confirm the content type, the sender trust where applicable, the current user intent, and the final target.

## Webview and native-bridge attack classes (subagent_type: `general`)

**Navigation-origin to bridge confusion**
Remote or attacker-controlled frames can reach a JavaScript/native bridge that is only for packaged content. Validate the origin at call time and after every navigation, redirect, subframe creation, popup, and error/fallback page. URL-prefix checks and initial-load checks are not sufficient.

**Over-broad native bridge capabilities**
Web content can select arbitrary files, commands, IPC methods, credentials, or system actions through a generic bridge. Check the method allowlists, normalized arguments, user/tenant authority, gesture/confirmation requirements, and return-value disclosure.

**Webview file and universal access**
Remote content can read app-local files, privileged custom schemes, or internal origins. The cause is that file access, universal access, mixed content, debug interfaces, or custom protocol handlers join origins unexpectedly. A missing restrictive setting without reachable protected content is hardening.

## Local IPC and exported-component attack classes (subagent_type: `general`)

**IPC peer-authentication gaps**
Unix sockets, named pipes, XPC, Binder, D-Bus, native messaging, RPC, shared memory, or loopback listeners accept a lower-trust peer. They do not check OS credentials, code identity, sandbox token, or channel ownership. Require a meaningful method or disclosure behind the channel.

**Claimed principal versus channel identity**
The authenticated process/channel belongs to one app or user, but request fields select another user, tenant, profile, or capability. Bind each method and resource to the peer credential. Do not bind to an identifier that the caller declares.

**Exported service, activity, receiver, or provider overreach**
A mobile component or local automation endpoint can be invoked externally. It performs an operation that is only for the app itself. Review the final merged manifests, intent filters, permission/signature level, path grants, and alternate aliases. If the manifest status after packaging is unknown, use `needs_validation`.

**IPC lifecycle and correlation confusion**
Predictable request IDs, reused handles, stale channels, inherited descriptors, world-writable socket paths, or restart behavior can occur. Then one peer can answer, cancel, or reuse the operation of another peer. Review the creation permissions and the cleanup of socket files, locks, ports, and shared mappings.

## Privileged-helper and local-file attack classes (subagent_type: `general`)

**Privileged helper as confused deputy**
A low-privilege caller can select a privileged command, file, service, user, or system setting without per-operation authorization. Review the sudo/polkit/UAC/XPC helper rules. Make sure that the helper validates the normalized arguments independently.

**Install, update, and repair path trust**
A privileged installer/helper reads manifests, scripts, packages, symlinks, working directories, or repair state after authorization. A lower-trust actor can write to these items. Bind the authorization to immutable content and safe destination paths.

**Local file ownership and TOCTOU**
The app checks a file or path. Then it follows a replacement, symlink, mount, or case/normalization change during a privileged read or write. Use descriptor-relative operations and verify the final ownership. Use `MEMORY-SAFETY-AND-BINARY.md` for the parsing that occurs after the file is open.

**Credential-store and local-secret boundary mismatch**
A keychain/keystore item, token file, backup, log, clipboard, notification preview, or local config is readable. The reader is another app, profile, or user with less authority. Plaintext that only the same intended OS account can read is not automatically a vulnerability. State the lower-trust reader and the power of the credential.

## Application-state and device-lifecycle attack classes (subagent_type: `general`)

**Account switch, logout, and device restore leakage**
These items can survive a logout or account change:
- Cached data
- Background tasks
- Widgets
- Notifications
- Local databases
- Webview storage
- Biometric approvals

They then appear under a later account. Review the backup/restore and multi-profile behavior.

**Pending-action and user-presence confusion**
A notification, widget, shortcut, share sheet, biometric prompt, or deferred operation authorizes a different action than the one displayed. Or it runs after expiry. Or it uses the pending state of another profile. Bind the confirmation to the normalized action, resource, account, and current foreground state.

## Universal moves (apply across the above)

- List every process, app component, local endpoint, URI scheme, file association, webview origin, and helper. Record the OS identity, runtime privilege, caller, and callable operation.
- Read the final packaging inputs: merged manifest, entitlements, installer rules, native-messaging registration, protocol handlers, and ACL creation. Later steps can overwrite source declarations.
- Validate with dummy profiles and non-sensitive local fixtures on an isolated machine or emulator. Do not interact with the apps, credentials, or production services of other users.

## Validation rules (apply before reporting ANY finding here)

1. Name the starting capability of the attacker, the OS/app principal that the attack crosses, and the entry channel. Name the accepted argument or state, and the unauthorized operation or disclosure.
2. Confirm the OS sandbox, peer credential, signing, entitlement, permission, user-consent, and installer controls that apply. Unknown packaging/runtime facts require `needs_validation`.
3. For webview bridges, cite both the navigation/origin control and the privileged native sink. For IPC, cite the peer authentication and the per-resource authorization. For helpers, verify the final normalized destination.
4. Keep local tests bounded and use dummy content/accounts. Stop after you prove the boundary result. Do not extend the proof into persistence or broader system modification.
5. Return `confirmed` only with a complete source and local evidence chain. Return `needs_validation` with the exact OS, manifest, signing, ACL, or device-lifecycle fact that you need.
