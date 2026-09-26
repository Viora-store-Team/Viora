# Viora design system

## Direction
Arabic-first fashion marketplace. Retain Viora's burgundy identity, use quiet white surfaces and clear Cairo typography, and let real product photography lead. The existing customer API and commerce flows remain the source of truth.

## Foundations
The single token source is `src/app/globals.css`; Tailwind v4 exposes semantic utilities through `@theme inline`.

| Role | Utility | Value |
| --- | --- | --- |
| Primary action | `bg-brand`, `text-brand` | #7d1d29 |
| Hover | `bg-brand-hover` | #58131f |
| Subtle brand surface | `bg-brand-soft` | #f8edf0 |
| Page | `bg-canvas` | #fcfaf9 |
| Card | `bg-surface` | #ffffff |
| Heading | `text-ink` | #281d22 |
| Body | `text-copy` | #54484e |
| Secondary text | `text-muted` | #74666d |
| Border | `border-line` | #e9e0e3 |
| Strong border | `border-line-strong` | #d0bec5 |
| Accent | `text-gold` | #93652f |

Use existing success/danger tokens for status, never the brand color to imply success. Keep white text on solid burgundy actions. Do not add new local hex values when a semantic role already exists. Existing specialist artwork and status colors are intentionally separate.

## Typography and spacing
- Cairo is the actual `font-sans` family, including form controls.
- Body: 16px; interactive labels: 14px; secondary metadata: 12px.
- Headings use 700–800 weight and generous Arabic line-height; avoid letter-spacing on Arabic text.
- Work in 4px increments; typical control gaps 8–12px, card padding 16–24px, section gaps 40px mobile / 64px desktop.
- Content max width: 1216px. Gutters: 16px mobile / 24px desktop.
- Corner roles: `rounded-control` 12px, `rounded-card` 16px, `rounded-panel` 24px.
- Reserve `shadow-card` for elevated/hover states rather than every element.

## Shared patterns
- `v-button`: primary anchor/button; add `v-button-secondary` for an outlined action.
- `SectionHeading`: reusable section title, optional eyebrow and description, optional navigation link.
- `v-container`: shared responsive content width.
- `v-empty`: honest empty/error states with a relevant next action.
- `ProductCard`: shared across home, catalog, offers, favorites and store details. Supports image fallback, stock, discount, favorite state and price.
- `StoreCard`: shared store identity, verification, category and navigation.
- `CategoryCards`: links or pressed-state filter buttons with horizontal scrolling.
- Header: understated active underline, shared account actions and collapsible mobile navigation.

## Accessibility and responsive behavior
Use visible keyboard focus, descriptive button labels, pressed/expanded states, and the skip-to-content link. Reduced-motion preferences are respected globally. Use logical inline spacing where possible, preserve RTL reading order, and isolate numerical prices with `ltr-nums`. Make labels wrap rather than clipping meaningful names. Do not invent products, reviews or stock to fill a layout.

## Scope
Core brand colors have been migrated to semantic utilities throughout the existing pages. The home page and shared navigation, product/store cards, categories and guest callout received structural styling updates. This is not a rewrite of checkout, authentication or backend behavior. Older route-specific typography and specialty surfaces can be migrated incrementally using these foundations.

## Hosting
The existing project uses the standard Next.js server build. Sites requires a Cloudflare-compatible Worker entrypoint or a static export. Neither is produced by the current build. Registration is retained in `.openai/hosting.json`; no successful online deployment is claimed. A compatible deployment adapter needs to be configured and validated before publishing the complete application to Sites.
