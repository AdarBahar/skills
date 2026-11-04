# Upstream

This folder is a copy of `skills/react-best-practices` from [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills). The license is MIT (see the `license` field in `SKILL.md`). The author is Vercel.

Do not edit the files in this folder, except this one. A GitHub Actions workflow, `.github/workflows/sync-react-best-practices.yml`, copies the upstream folder once a week. If the copy differs, the workflow opens a pull request. Read the diff, then merge it. A local edit is lost at the next sync.

The sync keeps this file. It removes every other file that upstream no longer has.

## Known issues in the upstream copy

A review of this repository on 2026-11-04 (at commit `0094864`) found these problems in the upstream files. They are not corrected here, because a local edit is lost at the next sync. When you use a rule below, apply the correction yourself. When a sync PR changes one of these files, check if upstream corrected the problem, and remove its row.

Findings 9 and 10 were compared with the upstream `main` branch on 2026-11-04. Both upstream files were the same as this copy. Nothing was reported to the upstream repository.

| Priority | File | Problem | Correction |
|---|---|---|---|
| P2 | `rules/bundle-defer-third-party.md:34–39` | The root layout calls `dynamic(..., { ssr: false })`. A root layout is a Server Component, so Next.js gives a build error. | Put the dynamic import in a separate component with `"use client"`, and render that component from the layout. |
| P2 | `rules/async-api-routes.md:27–32` | `fetchConfig()` starts before `auth()` is awaited, but its rejection handler is attached only later. If `auth()` fails, the config rejection is unhandled. | Attach a handler to each started promise at once, for example `Promise.all([auth().then(s => fetchData(s.user.id)), fetchConfig()])`. |
| P2 | `rules/server-after-nonblocking.md:44–49` | The `after` callback calls `logUserAction` with no `await`. The callback ends while the log write is still pending, so the write can be lost. | `await logUserAction(...)`, or return its promise from the callback. |
| P2 | `rules/rerender-lazy-state-init.md:45–50` | A `useState` initializer that reads `localStorage` still runs during server rendering, and it throws. | Read storage only in a client-only mount, or use an SSR-safe pattern with a server snapshot. |
| P2 | `rules/rendering-hydration-no-flicker.md:59–69` | The script sets a class before hydration, but the first client render has no `className`, so React reports a hydration mismatch. | Make the initial attributes match the theme, or use a narrow `suppressHydrationWarning` on a managed theme boundary. |
| P2 | `rules/rendering-usetransition-loading.md:51–55, 73` | A transition does not cancel earlier requests. An older response can replace newer results. Line 73 says that it cancels. | Add a request ID or an abort, and ignore stale responses. Wrap the update after `await` in `startTransition` again. |
| P2 | `rules/js-flatmap-filter.md:25–27, 40–42` | The `flatMap` version keeps falsy values that `.filter(Boolean)` removed, so the result changes. | Keep the truthiness check on the mapped value. |
| P2 | `rules/js-cache-storage.md:48–50` | `c.split('=')` cuts a cookie value at every `=`. `abc=def==` becomes `abc`. | Split each cookie only at the first `=`. Split pairs on `;` and trim spaces. |
| P2 | `rules/client-swr-dedup.md:48` | `import { useSWRMutation } from 'swr/mutation'`. The hook is the default export. | `import useSWRMutation from 'swr/mutation'`. |
| P3 | `AGENTS.md:3746–3763` | The compiled guide drops six code examples from the rule files, for example the `useRef` version in `rules/advanced-event-handler-refs.md` that works with React 18. | Read the rule file in `rules/` when `AGENTS.md` and the rule do not agree. |
