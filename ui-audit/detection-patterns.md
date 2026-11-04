# Detection patterns

Search the code in scope for each pattern ID. A match is a lead. Confirm it in context before you report it. If the project rulebook permits a pattern, do not report it.

Each pattern has a type:

- **Failure:** a confirmed match is a finding. It breaks the rulebook, an accessibility rule, or the layout.
- **Hygiene:** a match is a finding only when you show a failure that it causes (for example a horizontal scroll, a clip, or a failed contrast ratio). If you cannot show a failure, put the match under **Notes** in the report, one line each. A difference from a default in Step 4 is not a failure.

The **Search** column is a starting point for `grep -rnE`. Change it to fit the stack (CSS, Tailwind classes, JSX, Vue). Search the style files and the component files. In the tables, `\|` means `|` (the Markdown table needs the backslash).

## Consistency

| ID | Type | Pattern | Search | Fix |
|---|---|---|---|---|
| C1 | Failure | Hex, `rgb(`, or `oklch(` literal in a component or style rule where a token exists | `#[0-9a-fA-F]{3,8}\b\|rgba?\(\|oklch\(` outside the token block | Use the role token |
| C2 | Hygiene | Primitive color in a component: `bg-blue-600`, `var(--blue-600)` | `(bg\|text\|border)-[a-z]+-[0-9]{2,3}\|var\(--[a-z]+-[0-9]{2,3}\)` | Use the semantic token that points at it |
| C3 | Failure | Arbitrary Tailwind value with no token: `p-[13px]`, `w-[343px]`, `text-[#...]` | `-\[[^]]+\]` | The nearest token. Ask if the rounding is more than 2px. |
| C4 | Failure | A new button, input, or card component when one exists in the shared library | New files or local components named `*Button*`, `*Input*`, `*Card*` | Use the shared component |
| C5 | Failure | `font-family` that is not in the rulebook | `font-family:\|font-\[` | Use a rulebook font |
| C6 | Failure | A spacing value outside the spacing scale | `(margin\|padding\|gap)[^:]*:\s*[0-9]+px` | The nearest step |

## Accessibility

| ID | Type | Pattern | Search | Fix |
|---|---|---|---|---|
| A1 | Failure | `outline: none` or `outline-none` with no `focus-visible` style | `outline:\s*(none\|0)\|outline-none` | Restore the browser ring or add a ring with 3:1 contrast |
| A2 | Failure | `<div onClick` or `<span onClick` (not a backdrop) | `<(div\|span)[^>]*onClick` | `<button>`, or `<a href>` for navigation |
| A3 | Failure | `role="button"` or `role="tab"` with no keyboard handler or no full pattern | `role="(button\|tab\|tablist)"` | Use `<button>`, or the full ARIA pattern |
| A4 | Failure | A positive `tabindex` | `tab[iI]ndex=\{?"?[1-9]` | Correct the DOM order and use `0` |
| A5 | Hygiene | `disabled={!isValid}` on a submit button | `disabled=\{!` | Keep it enabled. Validate on submit. |
| A6 | Failure | An `<img` with no `alt` | `<img(?![^>]*alt=)` (or read each `<img`) | `alt=""` if decorative, else a description of the purpose |
| A7 | Failure | An icon-only `<button>` with no `aria-label` | `<button` with only an icon child | Add `aria-label` |
| A8 | Failure | `<input>` with no `<label>` (only a placeholder) | `<input`, `<textarea`, `<select` | Add a `<label>` |
| A9 | Failure | `maximum-scale=1` or `user-scalable=no` | `maximum-scale\|user-scalable` | Remove it |
| A10 | Hygiene | `aria-live="assertive"` on a success toast | `aria-live="assertive"` | `role="status"` |
| A11 | Failure | An interactive element with a fixed size under 24px, or under 44px with no `pointer: coarse` rule | `(width\|height\|min-width\|min-height):\s*(1[0-9]\|2[0-9]\|3[0-9]\|4[0-3])px` on button, icon-button, link, or input rules; `pointer:\s*coarse` | `min-width` and `min-height: 44px` under `@media (pointer: coarse)` |

## Layout

| ID | Type | Pattern | Search | Fix |
|---|---|---|---|---|
| L1 | Hygiene | `width: 100vw` | `100vw` | `width: 100%` |
| L2 | Hygiene | `height: 100vh` on a full-height mobile pane | `100vh\|h-screen` | `100dvh` |
| L3 | Hygiene | A fixed `height` on a box with text | `[^-]height:\s*[0-9]+px` | `min-height` |
| L4 | Failure | A flex or grid child with long text that overflows | `1fr`, `flex: 1` with no `min-width: 0` | `min-width: 0`, or `minmax(0, 1fr)` |
| L5 | Failure | `left` / `right`, `ml-` / `mr-` on a page that uses RTL | `margin-(left\|right)\|\b(ml\|mr\|pl\|pr)-` | Logical properties: `ms-`, `me-`, `inset-inline-start` |
| L6 | Hygiene | A sticky header with no `scroll-padding-top` | `position:\s*sticky\|sticky` | Set it to the header height |

## Typography

| ID | Type | Pattern | Search | Fix |
|---|---|---|---|---|
| T1 | Hygiene | A price, counter, timer, or number column with no `tabular-nums` | `tabular-nums` (then read number columns) | `font-variant-numeric: tabular-nums` |
| T2 | Failure | `<input>`, `<textarea>`, or `<select>` under 16px on mobile, with zoom permitted | Root `font-size`, input `font-size`, `text-sm` on inputs | 16px on mobile |
| T3 | Hygiene | `line-height` in `px` | `line-height:\s*[0-9]+px` | A unitless value |
| T4 | Hygiene | `font-light` or weight 100–300 on text under 18px | `font-weight:\s*[1-3]00\|font-(thin\|extralight\|light)` | 400 or heavier |
| T5 | Hygiene | `...` in UI text | `\.\.\.` in strings | `…` |

## Surfaces and motion

| ID | Type | Pattern | Search | Fix |
|---|---|---|---|---|
| S1 | Hygiene | A parent and a child with padding that use the same `rounded-*` | `border-radius\|rounded-` | Outer radius = inner radius + padding |
| S2 | Hygiene | `transition-all` or `transition: all` | `transition(-all\|:\s*all)` | Name the properties that change |
| S3 | Hygiene | `animation:` on `:hover` or a toggled class | `animation:` | A transition |
| S4 | Failure | A `translate`, `scale`, slide, or `motion.*` animation with no reduced-motion guard, or a guard that a more specific selector overrides | `@keyframes\|animation:\|translate\|motion\.` and `prefers-reduced-motion` | Add `motion-safe:` or a `prefers-reduced-motion` rule that covers each selector |
| S5 | Hygiene | `hover:` effects that are not in `@media (hover: hover)` | `:hover\|hover:` | Put them in the query (Tailwind 4 does this automatically) |
| S6 | Hygiene | `fill="#..."` or `stroke="#..."` in an icon SVG | `(fill\|stroke)="#` | `currentColor` |
| S7 | Hygiene | `overflow-y-auto` on a modal or drawer with no `overscroll-behavior` | `overflow(-y)?(-auto\|:\s*auto)` | `overscroll-behavior: contain` |
| S8 | Hygiene | `text-white` on a Tailwind `500` fill | `text-white` | Measure the contrast. A failed ratio is a Failure. |
| S9 | Failure | Smooth scroll in code with no reduced-motion check | `behavior:\s*['"]smooth\|scroll-behavior:\s*smooth` | Use `auto` when `prefers-reduced-motion: reduce` matches |
