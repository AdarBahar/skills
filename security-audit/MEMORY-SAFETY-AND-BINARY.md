# Memory Safety, Binary, and Kernel Hunting

#### When to use this file

Use this file when the target processes untrusted bytes in a memory-unsafe or privileged context. Examples are C/C++/Objective-C, Rust `unsafe`, FFI, kernel modules and drivers, parsers and decoders, network daemons, firmware, binary loaders, language runtimes, and JITs. Use `PROTOCOLS-RPC-AND-MESSAGING.md` for protocol authorization and state-machine logic. Use this file for process integrity, memory safety, ABI boundaries, and loader behavior.

Pick relevant classes from Phase 1. Split large targets by parser, allocator and lifetime, FFI, concurrency, loader, runtime, or privileged interface.

## Core discipline (include in every agent prompt for this domain)

```
- Re-derive every bound and lifetime from attacker-controlled inputs and all callers. Validate against the worst accepted case, not a typical test vector.
- A panic, sanitizer finding, or crash proves a defect only when a realistic untrusted input reaches it. Do not infer memory corruption, code execution, or shared availability impact from a label alone.
- Validate in a local harness with sanitizers, deterministic concurrency tests, existing fuzz targets, and debugger-assisted fault classification. Stop after proving the violated invariant and observable impact; do not develop post-corruption techniques.
- Assembly, JIT code, custom allocators, intra-object accesses, and foreign libraries can escape sanitizer coverage. Identify which relevant instructions are instrumented.
- Classify as `confirmed` only after source evidence and bounded local validation establish the defect and effect. Use `needs_validation` when ABI, allocator, architecture, feature, deployment, or reachability facts remain unknown.
```

## Bounds, integer, and representation attack classes (subagent_type: `general`)

**Out-of-bounds read or write**
A length, an offset, an index, or a terminator reaches a fixed or allocated buffer without a correct bound. Calculate the available headroom again after prefixes, alignment, padding, and terminators. Check the capacity of both the source and the destination. Also check if the code reads a short input before it trusts the declared length.

**Integer overflow, underflow, truncation, and signedness**
Review the attacker-controlled arithmetic before allocation, copy, loop, indexing, and pointer operations. These patterns often cause defects: `a - b` with `b > a`, `count * element_size`, additions near the type maximum, and negative values that become unsigned. Other patterns are 64-bit lengths that become 32-bit fields, and sentinel values such as `-1` that become a large size. Confirm which checked representation the code uses later.

**Unit and pointer-depth confusion**
The code mixes bytes, elements, code units, pages, words, wire units, or nested pointer element sizes. Compare the unit at the parse, the validation, the allocation, the API boundary, and the copy. A bounds check is still wrong if it uses the same wrong unit as the allocation.

**Uninitialized or partially initialized data**
A buffer, padding, struct field, or vector capacity is not initialized. The code returns, compares, hashes, serializes, or passes it across a trust boundary. Require an observable consumer and a realistic output length. Stack allocation by itself is not disclosure.

## Lifetime, type, and concurrency attack classes (subagent_type: `general`)

**Use-after-free, stale view, and double free**
The code releases owners. Callbacks, wait queues, timers, iterators, borrowed slices, or cached raw pointers can still use them. Review every error, cancellation, close, and realloc path. For embedded notification anchors, each free path must drain or detach all observers.

**Type confusion and invalid downcast**
The code checks a tag, a vtable, a union discriminator, an object kind, or a foreign handle. Later, the code reads a different representation than the one that it checked. Look for unchecked dynamic casts and stale tags after reuse. Also look for serialized types where the validated element differs from the element that the code uses. Confirm a wrong-type read or write locally. Do not extend the test beyond the violated invariant.

**Reference-count and ownership races**
Non-atomic retain and release can free or change an object during access. A check followed by an unlocked use can do the same. Inconsistent ownership across threads can also do the same. Compare the fast, error, shutdown, and compatibility paths for the same lock and ownership rules.

**Shared-state races and TOCTOU**
Concurrent parser streams, global caches, lazy initialization, signal handlers, and resource teardown can invalidate bounds, policy, or pointers. The code established them earlier. Verify the race with a repeatable local schedule, a barrier, or a thread sanitizer. A hypothetical interleaving without a security-relevant state transition remains `needs_validation`.

**Lock-order, deadlock, and starvation**
Externally reachable operations acquire locks in an inconsistent order. Alternatively, they hold locks across callbacks and blocking I/O. Report under availability only when bounded input can stop shared progress. Otherwise, record it as a concurrency defect for a fix.

## FFI and ABI attack classes (subagent_type: `general`)

**Pointer-length and ownership contract mismatch**
The caller and the callee disagree on these points: who allocates, frees, pins, or changes a buffer; how long a pointer stays valid; and if a length is in bytes or in elements. Trace both sides of every `extern`, CGo/JNI/Python/native binding, and generated wrapper. Check null, zero length, aliasing, and callback retention.

**Layout, alignment, and enum disagreement**
Foreign code receives a struct, a bitfield, a packed record, a callback signature, an integer width, an enum, or a calling convention. These differ by architecture or build flag. Verify `repr`, packing, alignment, endianness, and ABI-specific types. You can confirm a declaration mismatch in the repository locally. An opaque foreign implementation requires `needs_validation`.

**Unwind, exception, and thread-affinity violations**
Exceptions or panics cross an ABI that forbids unwinding. Alternatively, callbacks run after teardown. Alternatively, code calls APIs that require one runtime thread from another thread. Review the error conversion and the cancellation. Confirm if the process aborts or if the state is corrupted before you assign impact.

## Binary loading and runtime attack classes (subagent_type: `general`)

**Library, plugin, and executable search-order trust**
A privileged process loads a library, a plugin, a runtime image, or a helper from a path that a less-trusted principal can write. Alternatively, it resolves a bare name through a working directory or environment that an attacker can influence. Compare the intended installation ownership with each fallback and compatibility search path. A user who loads their own plugin into their own process is not a boundary violation.

**Missing artifact identity or signature binding**
A loader verifies one file or metadata record, but it maps a different image. The path resolution, the file replacement, the architecture slices, or the embedded resources are not bound to the check. `SUPPLY-CHAIN-AND-RELEASE.md` covers the authenticity of the supply channel. This class covers the local gap between verification and map.

**Malformed binary metadata and relocation handling**
The code trusts offsets, counts, sections, relocations, symbols, bytecode, or debug metadata before it checks range, overlap, and representation. Test parsers with bounded local fixtures and sanitizers. Separate memory corruption from a malformed file that the code rejects safely.

**JIT and generated-code consistency**
The validator, the interpreter, the optimizer, and the generated code disagree about types, bounds, side effects, or lifetime. Compare the optimized and unoptimized paths with the same local input. Confirm an effect on process integrity. Output variance that stays within the language semantics is not a finding.

**Unload, reload, and teardown safety**
Live function pointers, callbacks, worker threads, or data views stay alive after a module unload or a runtime reset. Review the shutdown and the cleanup of a failed load as closely as the startup.

## Kernel and privileged-interface attack classes (subagent_type: `general`)

**User-copy bounds and repeated reads**
A syscall, an ioctl, a driver, or a kernel parser derives a trusted fact from user memory. Then it reads the same mutable address again. Copy the full request one time, or validate the later copy again. Also audit the size, direction, and access checks at each user-copy primitive.

**Privileged object lifecycle and dispatch consistency**
Externally reachable objects have unbalanced retain and release, a teardown without observer drain, or unchecked selector or table indices. Duplicated compatibility paths can also omit a guard. Compare each dispatch path and free path side by side.

**Under-authorized powerful interfaces**
A device node, an admin socket, a helper, or a management API validates the shape but not the authority of the caller over the resource. Establish the actual interface ownership and reachability. If permissions or sandbox policy outside the repository decide the result, the candidate is `needs_validation`.

## Universal moves (apply across the above)

- Audit the fixes and the duplicated paths for the same source-to-sink shape. A check in one caller, architecture, protocol role, feature flag, or compatibility path does not protect its siblings.
- Build a table for every parser or FFI boundary. List the accepted length and type, the checked representation, the allocation owner, the consumer, the thread, and the teardown. Most native findings are one disagreement in that table.
- Use existing corpora and small, locally generated boundary fixtures. Save the exact sanitizer and runtime output and the input property that triggers it. Do not consume large amounts of resources. Do not use a live target.

## Validation rules (apply before reporting ANY finding here)

1. Establish a realistic untrusted entry and the exact operation that violates a bounds, type, lifetime, ABI, concurrency, loader, or authority invariant.
2. Classify the observable effect. The effect is one of these: invalid read, invalid write, stale alias, wrong object, uninitialized output, unauthorized image load, deadlock, or safe process termination. Do not claim a stronger effect than the effect that you observed.
3. Run the narrowest local harness, existing test, sanitizer, or fuzzer that can reproduce the effect. Verify the sanitizer coverage of the faulting operation. Record the architecture and build conditions.
4. For concurrency, use a deterministic schedule or a sanitizer trace. For binary loading, prove that the checked identity differs from the mapped identity. Name the lower-trust writer.
5. Return `confirmed` findings only with the exact input, the source trace, and the observed result. Return `needs_validation` for a specific unresolved reachability, ABI, build, deployment, or runtime fact. State the bounded check that you need.
