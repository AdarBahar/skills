# Detection patterns

Search the code in scope for these patterns. A match is a lead. Confirm it in context before you report it. If the project rulebook permits a pattern, do not report it.

Each pattern has a type:

- **Failure:** a confirmed match is a finding. It breaks the rulebook, an accessibility rule, or the layout.
- **Hygiene:** a match is a finding only when you show a failure that it causes (for example a horizontal scroll, a clip, or a failed contrast ratio). If you cannot show a failure, put the match under **Notes** in the report, one line each. A difference from a default in Step 4 is not a failure.

## Consistency

| Type | Pattern | Fix |
|---|---|---|
| Failure | Hex, `rgb(`, or `oklch(` literal in a component where a token exists | Use the role token |
| Hygiene | `bg-blue-600`, `var(--blue-600)` (primitive color) in a component | Use the semantic token that points at it |
| Failure | Arbitrary Tailwind value with no token: `p-[13px]`, `w-[343px]`, `text-[#...]` | The nearest token. Ask if the rounding is more than 2px. |
| Failure | A new button, input, or card component when one exists in the shared library | Use the shared component |
| Failure | `font-family` that is not in the rulebook | Use a rulebook font |
| Failure | A spacing value outside the spacing scale | The nearest step |

## Accessibility

| Type | Pattern | Fix |
|---|---|---|
| Failure | `outline: none` or `outline-none` with no `focus-visible` style | Restore the browser ring or add a ring with 3:1 contrast |
| Failure | `<div onClick` or `<span onClick` (not a backdrop) | `<button>`, or `<a href>` for navigation |
| Failure | `role="button"` with no `onKeyDown` | Use `<button>` |
| Failure | A positive `tabindex` | Correct the DOM order and use `0` |
| Hygiene | `disabled={!isValid}` on a submit button | Keep it enabled. Validate on submit. |
| Failure | An `<img` with no `alt` | `alt=""` if decorative, else a description of the purpose |
| Failure | An icon-only `<button>` with no `aria-label` | Add `aria-label` |
| Failure | `<input>` with no `<label>` (only a placeholder) | Add a `<label>` |
| Failure | `maximum-scale=1` or `user-scalable=no` | Remove it |
| Hygiene | `aria-live="assertive"` on a success toast | `role="status"` |

## Layout

| Type | Pattern | Fix |
|---|---|---|
| Hygiene | `width: 100vw` | `width: 100%` |
| Hygiene | `height: 100vh` on a full-height mobile pane | `100dvh` |
| Hygiene | A fixed `height` on a box with text | `min-height` |
| Failure | A flex or grid child with long text that overflows | `min-width: 0`, or `minmax(0, 1fr)` |
| Failure | `left` / `right`, `ml-` / `mr-` on a page that uses RTL | Logical properties: `ms-`, `me-`, `inset-inline-start` |
| Hygiene | A sticky header with no `scroll-padding-top` | Set it to the header height |

## Typography

| Type | Pattern | Fix |
|---|---|---|
| Hygiene | A price, counter, timer, or number column with no `tabular-nums` | `font-variant-numeric: tabular-nums` |
| Failure | `<input>`, `<textarea>`, or `<select>` under 16px on mobile, with zoom permitted | 16px on mobile |
| Hygiene | `line-height` in `px` | A unitless value |
| Hygiene | `font-light` or weight 100–300 on text under 18px | 400 or heavier |
| Hygiene | `...` in UI text | `…` |

## Surfaces and motion

| Type | Pattern | Fix |
|---|---|---|
| Hygiene | A parent and a child with padding that use the same `rounded-*` | Outer radius = inner radius + padding |
| Hygiene | `transition-all` or `transition: all` | Name the properties that change |
| Hygiene | `animation:` on `:hover` or a toggled class | A transition |
| Failure | A `translate`, `scale`, slide, or `motion.*` animation with no reduced-motion guard, or a guard that a more specific selector overrides | Add `motion-safe:` or a `prefers-reduced-motion` rule that covers each selector |
| Hygiene | `hover:` effects that are not in `@media (hover: hover)` | Put them in the query (Tailwind 4 does this automatically) |
| Hygiene | `fill="#..."` or `stroke="#..."` in an icon SVG | `currentColor` |
| Hygiene | `overflow-y-auto` on a modal or drawer with no `overscroll-behavior` | `overscroll-behavior: contain` |
| Hygiene | `text-white` on a Tailwind `500` fill | Measure the contrast. A failed ratio is a Failure. |
