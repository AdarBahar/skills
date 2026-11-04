# Detection patterns

Search the code in scope for these patterns. A match is a lead. Confirm it in context before you report it. If the project rulebook permits a pattern, do not report it.

## Consistency

| Pattern | Fix |
|---|---|
| Hex, `rgb(`, or `oklch(` literal in a component where a token exists | Use the role token |
| `bg-blue-600`, `var(--blue-600)` (primitive color) in a component | Use the semantic token that points at it |
| Arbitrary Tailwind value: `p-[13px]`, `w-[343px]`, `text-[#...]` | The nearest token. Ask if the rounding is more than 2px. |
| A new button, input, or card component when one exists in the shared library | Use the shared component |
| `font-family` that is not in the rulebook | Use a rulebook font |
| A spacing value outside the spacing scale | The nearest step |

## Accessibility

| Pattern | Fix |
|---|---|
| `outline: none` or `outline-none` with no `focus-visible` style | Restore the browser ring or add a ring with 3:1 contrast |
| `<div onClick` or `<span onClick` | `<button>`, or `<a href>` for navigation |
| `role="button"` with no `onKeyDown` | Use `<button>` |
| A positive `tabindex` | Correct the DOM order and use `0` |
| `disabled={!isValid}` on a submit button | Keep it enabled. Validate on submit. |
| An `<img` with no `alt` | `alt=""` if decorative, else a description of the purpose |
| An icon-only `<button>` with no `aria-label` | Add `aria-label` |
| `<input>` with no `<label>` (only a placeholder) | Add a `<label>` |
| `maximum-scale=1` or `user-scalable=no` | Remove it |
| `aria-live="assertive"` on a success toast | `role="status"` |

## Layout

| Pattern | Fix |
|---|---|
| `width: 100vw` | `width: 100%` |
| `height: 100vh` on a full-height mobile pane | `100dvh` |
| A fixed `height` on a box with text | `min-height` |
| A flex or grid child with long text that overflows | `min-width: 0`, or `minmax(0, 1fr)` |
| `left` / `right`, `ml-` / `mr-` on a page that uses RTL | Logical properties: `ms-`, `me-`, `inset-inline-start` |
| A sticky header with no `scroll-padding-top` | Set it to the header height |

## Typography

| Pattern | Fix |
|---|---|
| A price, counter, timer, or number column with no `tabular-nums` | `font-variant-numeric: tabular-nums` |
| `<input>` with `text-sm` or 14px on mobile | 16px on mobile |
| `line-height` in `px` | A unitless value |
| `font-light` or weight 100–300 on text under 18px | 400 or heavier |
| `...` in UI text | `…` |

## Surfaces and motion

| Pattern | Fix |
|---|---|
| A parent and a child with padding that use the same `rounded-*` | Outer radius = inner radius + padding |
| `transition-all` or `transition: all` | Name the properties that change |
| `animation:` on `:hover` or a toggled class | A transition |
| A `translate`, `scale`, or `motion.*` animation with no reduced-motion guard | Add `motion-safe:` or a `prefers-reduced-motion` query |
| `hover:` effects that are not in `@media (hover: hover)` | Put them in the query (Tailwind 4 does this automatically) |
| `fill="#..."` or `stroke="#..."` in an icon SVG | `currentColor` |
| `overflow-y-auto` on a modal or drawer with no `overscroll-behavior` | `overscroll-behavior: contain` |
| `text-white` on a Tailwind `500` fill | Measure the contrast. Usually change the fill to `600`. |
