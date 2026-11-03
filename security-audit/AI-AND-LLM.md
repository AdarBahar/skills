# AI, LLM, and Agent Hunting

#### When to use this file

Use this file when a language model takes part in a trust-sensitive decision. Examples are chatbots and assistants, RAG pipelines, persistent agent memory, agent and tool-calling loops, and MCP servers and clients. Also use it for code that builds prompts from untrusted input, and for code that uses model output to take action. The important data flow is *untrusted content → model or memory → capability, authority, or sink*.

Use this file with `ATTACK-CLASSES.md`. Do not use it instead of that file. Transport, access control, query construction, filesystem use, and output rendering remain ordinary trust boundaries. This file covers the delegation layer that is specific to models. Split large targets by retrieval, memory, tool dispatch, MCP, and output handling.

## Core discipline (include in every agent prompt for this domain)

```
- Prompt injection alone is not a finding. Require a code-level boundary failure: content reaches another principal's context, invokes authority the requester lacks, discloses data they cannot read, or drives a sink they cannot reach directly.
- Model output, memory, tool descriptions, and MCP responses are untrusted inputs. Point to the code that grants authority, trusts output, writes durable state, or feeds a sink.
- A guardrail prompt is not a security boundary. Count only deterministic checks, resource-scoped authorization, isolation, binding, and constrained credentials.
- State the attacker, affected principal, effective execution identity, resource, exact action, authority used, and observable impact. An intentional direct request to use the requester's existing authority is not a delegation defect merely because a model executes it.
- Authorization and action binding are separate controls. Attacker-controlled content that causes an action under an affected principal's valid authority is an action-binding failure when that principal did not intentionally request or approve the exact action.
- Classify every candidate as `confirmed` only after source evidence and bounded local validation establish the boundary and result. Use `needs_validation` when a required provider, deployment, model, renderer, or identity behavior is not observable locally.
```

## Context, retrieval, and memory attack classes (subagent_type: `general`)

**Indirect injection through retrieved or ingested content**
An attacker can write a RAG document, an indexed page, a file, an email, an issue body, a tool response, or metadata. That content enters the model context of a different principal. Trace who can write each source. Trace how retrieval scopes it. Trace whose session uses it, and which capability that session enables. Check isolation, resource authorization, and binding to the intent of the consuming principal separately. The defect is a missing deterministic control. Persuasive text by itself is not a defect.

**Cross-session or cross-tenant context bleed**
Conversation history, embeddings, retrieval results, or prompt caches use keys that are too broad. Verify the tenant and ACL filters in the query itself and in every cache key. A tenant field that the code stores on an object is not enforcement. An alternate query, a shared cache, or a batch path can omit it.

**Persistent memory poisoning**
The code writes attacker-controlled content or model summaries into memory. That memory later shapes another task, another user, or a privileged session. Review these points. Who may create, update, merge, and delete memory? What are its provenance and tenant scope? Do low-trust observations become durable instructions or facts? Does retrieval distinguish user preferences from tool policy? Memory that a user saves intentionally is not a cross-boundary finding when the system uses it only for the intentional, allowed requests of that user.

**Prompt role and provenance confusion**
Prompt assembly lets untrusted text impersonate a system message, a prior turn, a tool result, a policy, or a memory record. Look for string concatenation, untyped history, caller-controlled role fields, and serialization round trips that lose source labels. Confirm that the forged provenance changes a deterministic trust decision or reaches a meaningful capability.

## Tool and action attack classes (subagent_type: `general`)

**Tool-argument injection into a downstream sink**
Model-produced arguments reach SQL, shell, file, URL-fetch, or privileged APIs. The handler does not validate them. Treat the tool schema as input parsing. Follow each field from the decoded call to the sink. Structured output narrows the shape. It does not establish authorization, safe paths, safe URLs, or query semantics.

**Excessive agency and confused-deputy authority**
The agent uses a service identity or a broad credential. The tool handler does not check again the permission of the requesting principal on the named resource. Verify the effective identity. Verify if the caller could do that exact operation through the normal product interface. A shared credential with an enforced per-user query scope is not a defect.

**Action-confirmation and approval binding**
A user approves one described action, but the execution can use changed arguments, a different resource, a different principal, or a later model turn. An action-binding defect also exists in this case. Attacker-controlled content causes a side effect under the valid authority of a victim. The victim did not intentionally request or approve it. This applies even if generic authorization permits the victim to do the action. Review if intent or confirmation binds these items: the normalized tool name, the complete argument object, the requester, the target, the amount, the expiry, and the batch membership. Check retries and resumed sessions. An approval must not authorize a changed or duplicate side effect.

**Tool-schema and dispatcher disagreement**
The schema accepts aliases, extra fields, duplicate keys, coercions, nested free-form objects, or out-of-range values. The dispatcher or the handler interprets them differently. Compare the schema validation, the canonicalization, the generated bindings, and the handler defaults. Validate again where values become resource selectors or security-relevant options.

**Unbounded delegated action loops**
A bounded request can queue repeated spend, send, mutation, or external API work. This is a defect if no per-request budget, per-action authorization, cancellation, or idempotency control exists. Confirm the impact on shared cost, quotas, other users, or durable state. Do not test by exhaustion of a service. Use code-level accounting and a locally bounded loop.

## MCP and sub-agent trust classes (subagent_type: `general`)

**Sub-agent and MCP trust inheritance**
A delegated task receives the full session, credentials, memory, or capabilities. It does not receive only the least authority that it needs. Check the principal and tenant that each call carries. Check the narrowing of capabilities and the credential audience. Check if the code treats delegated results as untrusted when they return.

**MCP server and tool identity confusion**
The code routes calls or results by server names, tool names, request IDs, resource URIs, or model-selected aliases that an attacker can influence. The code does not use the authenticated connection and the outstanding request. Check if two servers can claim the same tool or resource identity. Check if a reconnect changes the binding. Check if a response from one server can satisfy the pending call of another server.

**MCP metadata and schema as policy**
The code trusts tool descriptions, resource metadata, prompts, completion hints, or schemas from an MCP peer as policy or authorization. These fields can guide the model, but they cannot grant capability. Find the deterministic allowlist, the server identity check, and the handler authorization. These controls stay authoritative when metadata conflicts.

## Output and disclosure attack classes (subagent_type: `general`)

**Insecure output rendering**
Model output reaches an executing HTML, Markdown, template, URL, or command sink. The required encoding and policy of the sink are missing. For browser rendering, verify the auto-loaded resources and the CSP or sanitization in `CLIENT-SIDE.md`. If the renderer behavior is outside the repository, the candidate is `needs_validation`.

**Sensitive context extraction**
The assembled context contains credentials, data of another user, private source, or policy values that grant access. User-influenced output exposes them. Read the prompt assembly code and the data-fetch code. Disclosure of generic instructions is not a finding. Disclosure of behavior that does not cross a data boundary is not a finding.

## Universal moves (apply across the above)

- First, draw four maps. Draw each execution identity, each capability, every writable context or memory source, and each output destination. Then connect the principal at the start to the authority at the end.
- Start at the side-effecting tools and work backward. Go through the dispatcher, the schema, the confirmation, the model context, the retrieval, and the ingestion. Start at durable memory reads and trace every writer.
- Compare the direct, queued, retry, resume, batch, and delegated paths for the same action. The strongest gate must apply after the arguments are final and before every side effect.

## Validation rules (apply before reporting ANY finding here)

1. Name the crossed boundary and the observable result. Name the attacker, the affected principal or shared resource, the execution identity, the target, and the unauthorized or unrequested action or disclosure.
2. For confused-deputy authority claims, prove that the tool lacks requester-and-resource authorization. Also prove that the attacker cannot do the same action normally. For action-binding claims, prove this instead: attacker-controlled content caused an action under the authority of the affected principal. The principal did not intentionally request or approve that action. Valid generic authorization does not establish that intent.
3. For memory or retrieval claims, cite both the attacker-controlled write and the later cross-principal read or privileged decision. A shared record without a reachable consumer is not enough.
4. For action binding, establish the intentional request or the normalized approved object, if any. Compare it with the object that the handler uses. Confirm an unrequested action, mutation, duplicate, or authority change that you can observe locally. Do not extend the test into harmful execution. For schema disagreement, compare the normalized validated object with the object of the handler.
5. For MCP identity claims, verify the authenticated connection, the request correlation, the tool namespace, and the effective credential. Mark `needs_validation` if the identity of an external server or the deployment routing is required.
6. Return `confirmed` findings only with a complete source trace and a meaningful result. Return `needs_validation` for a specific unresolved boundary fact. State the bounded local or owner-observed check that resolves it.
