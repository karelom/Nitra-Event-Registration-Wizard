# PLAN.md

## Time Log

| Date       | Duration | Activity                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-15 | ~2h      | Forked repo to personal GitHub; set up dev environment (Node 22.17.0 via nvm, Yarn 4.6.0 via Corepack); configured Figma MCP integration for design reference                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-06-17 | ~0.5h    | Built main wizard structure (`RegistrationWizard.vue`, step stubs, `registration.ts` store); added TypeScript support (`typescript`, `tsconfig.json`, `shims-vue.d.ts`); adopted `as const` enum pattern for step names                                                                                                                                                                                                                                                                                                                                                   |
| 2026-06-17 | ~1h      | Reviewed Figma (Steps 1–3) and mock data; designed Zod schema layer (`src/schemas/`); installed `zod` v4; created `Step1AttendeeInfo.ts`, `Step2SessionSelection.ts`, `Step3Addons.ts`, `index.ts` with cross-step `superRefine`; flattened registration store to match schema shape; resolved Zod v4 deprecations (`.merge()` → `.extend()`, `z.string().email()` → `z.email()`, string message params → `{ error }` objects)                                                                                                                                            |
| 2026-06-17 | ~0.8h    | Implemented `Step1AttendeeInfo.vue` (ticket cards + attendee form); created `src/components/shared/AppInput.vue` with `defineModel`; introduced `src/api/` layer (`event.ts`, `sessions.ts`, `addons.ts`, `index.ts`) wrapping mocks as async functions; added `allowJs: true` to `tsconfig.json`; refactored `RegistrationWizard.vue` with shared header (logo + event name) and shared footer (`#navigation` slot with Back/Next/Submit); removed per-step action bars; replaced `justify-between` + empty spacer `<div v-else />` with `ml-auto` on the primary button; restructured components into `RegistrationWizard/` feature folder with `steps/` subfolder; moved `SuccessState.vue` to `shared/` |
| 2026-06-18 | ~0.5h    | Implemented `Step2SessionSelection.vue` (date tabs, session grid, sold-out disabling, selected counter); extracted `SessionCard.vue` from grid; moved `formatTime()` and `formatTimeRange()` to `src/lib/utils.ts`; applied `<ComponentName>Props` naming convention across all components (`AppInputProps`, `SessionCardProps`) |
| 2026-06-18 | ~1.6h   | Implemented `Step3Addons.vue` with category tabs (workshops/meals/merchandise), order summary sidebar (ticket + addons + VIP 10% discount + total), and workshop time-conflict detection (real-time computed against selected sessions); created `AddonCard.vue` — single component handling all three addon types: workshop (time range, spots, sold-out/conflict), meal (toggle), merchandise (size dropdown, quantity stepper, "max N" label, "✓ Added to order"); created `AppTabs.vue` shared tab component (used by Step2 + Step3); added `formatWorkshopTime()` and `formatCurrency()` to `src/lib/utils.ts`; added promise-based caching with `{ refresh }` option to all API functions (`fetchEvent`, `fetchSessions`, `fetchAddons`); refactored Step2 to use `AppTabs`; replaced `watch` with writable `computed` for default-tab initialization; derived tab options from API data (not hardcoded); documented Figma frame data in `docs/figma-data.md` to preserve API quota |
| 2026-06-18 | ~0.5h   | Refactored Step2 + Step3 for consistency and data-driven rendering: made `AddonCard` fully category-agnostic (renders sections based on field presence — `date`/`endDate` for time slots, `capacity`/`registered` for availability, `maxQuantity` for quantity controls, `sizes` for size picker); removed all category string checks from `AddonCard` and `Step3Addons` logic (conflict detection, VIP discount, shipping banner, `×N` suffix); moved `ADDON_CATEGORY_LABELS` to `src/api/addons.ts` as typed `Record<AddonCategory, string>`; separated `tabOptions` from grouping computed in both steps; unified naming across Step2 + Step3 (`activeTab`, `activeItems`, `tabOptions`) |
| 2026-06-18 | ~0.6h   | Implemented `Step4Review.vue` (review sections, pricing summary, Figma-accurate error states) and `SuccessState.vue`; added unified Zod validation + session time-conflict detection in `RegistrationWizard.onSubmit()`; error banner with step-prefixed bullet points; per-section error indicators (red border-2, red title, "— (required)" placeholders); stepper `:error` prop on `q-step`; submit button disabled styling (opacity-50) on validation failure; shipping address 3-state field (`AppInput` `error` prop, dynamic label in Step1, `shippingError` prop from wizard); fetched Figma frames `1074:897` (Review), `1075:903` (Success), `1076:904` (Error variant), `1203:587` (Shipping Address States) and documented in `docs/figma-data.md` |
| 2026-06-18 | ~1.5h   | Decoupled validation from `RegistrationWizard` into `useValidation()` in `src/stores/registration.ts` — reactive computed validation gated by `hasAttemptedSubmit` flag (errors update in real-time as user fixes fields after first submit); restructured state shape to `{ attendeeInfo: {...}, selectedSessionIds, selectedAddons }` eliminating `STEP1_FIELDS` set (step errors now use simple `path[0]` check); `fieldError(...path)` accepts rest args for nested paths; components self-serve validation via `useValidation()` (no props drilling); added `TICKET_ID` enum object and exported `isVip` computed from store; inline validation errors on all Step1 fields + ticket cards + session cards; `conflictingSessionIds` marks only overlapping sessions with red borders in Step2 |
| 2026-06-19 | ~1h     | UI polish: fixed header/footer layout (content area scrolls independently via flex + `overflow-y: auto` on `.q-stepper__content`); added `border-solid` globally to fix browser default `inset` border style on inputs, cards, and sidebars; thinned input fields (`py-2.5` → `py-2`, `border-2` → `border`); replaced `rounded-[8px]` → `rounded-lg` and `rounded-[6px]` → `rounded-md` for consistency; changed stepper icons to sequential numbers via `prefix` prop; shipping banner now only shows on Merchandise tab when items are selected; added `error-icon="error"` for red circle error indicator on q-step |
| 2026-06-19 | ~0.5h   | Refactored codebase: extracted `createCachedFetcher<T>()` generic cache helper (replaced identical 10-line pattern in 3 API files); extracted `useOrderSummary()` composable (shared order calculations between Step3 and Step4); extracted `useDefaultTab()` composable (writable computed with lazy default); added `hasTimeOverlap()` and `groupBy()` utilities to `src/lib/utils.ts`; reduced Step4Review attendee fields from 5 repetitive blocks to a single `v-for`; updated CLAUDE.md Pattern Registry |
| 2026-06-19 | ~0.2h   | Workshop conflict auto-removal: moved `toggleSession` into a store action that removes conflicting timed addons when a session is selected; replaced initial `watch`-based approach with imperative action for cleaner reactivity (no side-effect watchers) |
| 2026-06-19 | ~0.4h   | Validation & bug fixes: added size validation for merchandise addons (required when addon has `sizes`); red border on size dropdown on error; replaced hex `bg-[#15B471]` with `bg-success-emphasis-rest`; made submit button truly disabled via `:disable` prop; added JSDoc to 4 store functions (`fieldError`, `setCachedSessions`, `setCachedAddons`, `attemptSubmit`); fixed `setSize` losing value when selected before quantity increment |

## Dependencies

| Package      | Version  | Type          | Justification                                                                                                                                                                                                                                                                 |
| ------------ | -------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript` | `^6.0.3` | devDependency | Type safety for all new source files; enables `as const` enums, typed reactive state, and typed component props/emits                                                                                                                                                         |
| `zod`        | `^4.4.3` | dependency    | Runtime schema validation and TypeScript type inference for all wizard steps; drives cross-step rules (shipping address conditional) via `.superRefine()`; alternative was manual validation which would require hand-writing equivalent logic with no type inference benefit |

## AI-Assisted Development Journey

This project was built with Claude Code (Anthropic's CLI agent) as a pair-programming partner throughout. Below documents the full development process, covering planning, decisions, tool usage, challenges, and retrospective.

### How I planned and broke down the task

1. **Schema-first design** — Before writing any UI, I designed Zod schemas for each step (`Step1AttendeeInfo.ts`, `Step2SessionSelection.ts`, `Step3Addons.ts`) and a merged schema with cross-step `superRefine()` rules. This gave me TypeScript types for free (`z.infer<>`) and ensured validation logic was defined before the components that depended on it.

2. **Step-by-step implementation order** — Built in dependency order: store → schemas → API layer → Step1 → Step2 → Step3 → Step4 → validation wiring → UI polish → refactoring. Each step was self-contained and testable before moving to the next.

3. **CLAUDE.md as a living contract** — Created project-level instructions (`CLAUDE.md`) with a Pattern Registry, logic placement rules, and naming conventions. This served as guardrails for Claude Code, ensuring every new composable, utility, or store was checked against existing implementations before creation — preventing duplicate logic across sessions.

4. **Figma-driven implementation** — Used the Figma MCP integration to fetch design frame data for each step before implementing it, mapping raw fill colors and positions to the project's semantic design tokens (`src/unocss/semantic.js`).

### Key decisions and why

| Decision | Why | Alternative considered |
|----------|-----|----------------------|
| Vue `reactive()` singleton over Pinia | Single-page wizard with one shared state — Pinia's module system adds overhead with no benefit here | Pinia (`@pinia/nuxt`): would add a dependency and boilerplate for a use case that doesn't need devtools or plugin ecosystem |
| Zod v4 for validation | Schema = single source of truth for runtime validation + TypeScript types; `superRefine()` handles cross-step rules (shipping address, session conflicts) cleanly | Manual validation: would require hand-writing the same rules + separate TypeScript interfaces with no inference |
| Deferred validation (submit-time only) | Matches the Figma design — no per-step blocking; users can freely navigate back/forward. Real-time inline errors activate only after first submit attempt, then update reactively | Per-step validation gates: would block navigation and add complexity for a UX the design doesn't call for |
| Category-agnostic `AddonCard` | Renders based on field presence (`date`/`endDate` for time slots, `capacity` for availability, `maxQuantity` for qty controls) rather than category string checks — extensible without touching the component if new addon types share the same fields | Separate components per category: more components, more duplication, harder to maintain |
| `as const` enum pattern | `const TICKET_ID = { GENERAL: 'general', VIP: 'vip' } as const` — tree-shakeable, no runtime enum object, works naturally with Zod's `z.enum()` | Native TypeScript `enum`: generates runtime code, doesn't tree-shake, awkward with Zod |
| CSS-only fixed header/footer | Keeps the Quasar `QStepper` DOM structure intact; only adds flex + overflow CSS via `:deep()` scoped styles | Restructuring the stepper DOM: would fight Quasar's internal `hMergeSlot` rendering and require maintaining custom stepper logic |
| `src/api/` abstraction layer | Wraps mocks with async interface + promise caching; when a real backend is ready, swap the mock import — components are unchanged | Direct mock imports in components: couples UI to data source, makes migration to real API a multi-file change |

### How I used AI tools

**Tool:** Claude Code (Anthropic CLI) with Figma MCP server integration

**Workflow pattern:**
- Described desired behavior in natural language (often with screenshots for UI work) → Claude proposed implementation → iterative refinement via corrections and follow-up instructions
- Used Claude's `/plan` mode for complex tasks (fixed header/footer layout, codebase refactoring) to align on approach before writing code
- Used `CLAUDE.md` to persist project conventions across sessions so Claude maintained consistency without re-explaining rules

**Figma MCP integration:**
- Configured `figma-developer-mcp` server via `.mcp.json` with a personal access token
- Fetched 7 design frames via Figma REST API to extract colors, spacing, and layout specs
- **Quota management:** Free plan allows ~6 API fetches/month, so all fetched frame data was documented in `docs/figma-data.md` to avoid re-fetching. Claude was instructed to warn and confirm before any Figma fetch.

**What worked well:**
- **Reading Quasar source code** (`node_modules/quasar/src/components/stepper/`) to understand internal DOM structure — this let us solve the fixed header/footer layout with CSS only, without fighting the framework
- **Schema-first design** with Claude — defining validation schemas before UI ensured type safety flowed naturally through the whole codebase
- **Systematic codebase-wide changes** — Claude's ability to grep across all files and apply consistent patterns (e.g., adding `border-solid` to every card/input, renaming rounded values) made global polish efficient
- **Refactoring with confidence** — Claude reviewed the entire codebase, identified 6 duplication patterns, and extracted shared utilities/composables in one pass with TypeScript verification

**What didn't work well:**
- **Misdiagnosed input border issue** — Claude initially assumed a gradient border was caused by an undefined CSS variable; the user corrected that it was actually the browser's default `border-style: inset`. Required user domain knowledge to fix.
- **Empty stepper dots** — After removing the `icon` prop from `q-step`, Claude didn't know that Quasar doesn't auto-number steps. Needed to read Quasar's `StepHeader.js` source to discover the `prefix` prop.
- **Figma data mapping** — Raw Figma API returns fill colors as RGBA and positions as absolute coordinates, not semantic tokens. Manual mapping to the project's UnoCSS semantic tokens was required for every frame.

### Challenges encountered and how they were solved

| Challenge | How it was solved |
|-----------|-------------------|
| **Zod v4 breaking changes** — `.merge()` removed, `z.string().email()` → `z.email()`, string message params → `{ error }` objects | Read Zod v4 migration notes; updated all schema files to use `.extend()`, new API |
| **Quasar `#navigation` slot renders as siblings** — `hMergeSlot(slots.navigation, getContent())` merges footer at the stepper root, not inside `.q-stepper__content` | Read `QStepper.js` source; confirmed footer is a flex sibling → CSS-only solution works (footer stays fixed naturally) |
| **Browser default `border-style: inset`** on `<input>` and `<select>` elements — creates darker top/left edges that look like a gradient | Added `border-solid` class to all input and card elements globally |
| **Quasar step dots empty after removing `icon` prop** — Quasar doesn't auto-number steps | Read `StepHeader.js` source, found `prefix` prop (line 48: `hasPrefix` computed); added `prefix="1"` through `prefix="4"` |
| **Flexbox `min-height: auto`** — flex children don't shrink below content size by default, preventing scroll containment | Applied `min-h-0` on flex containers + `overflow-y: auto` on the content area |
| **Duplicated business logic across Step3 and Step4** — order calculations (ticket price, addon totals, VIP discount) maintained in two places | Extracted `useOrderSummary()` composable during refactoring pass |

### What I would improve given more time

- **Mock server with MSW** — Replace `setTimeout(150)` wrappers with Mock Service Worker for realistic network simulation, request/response inspection, and error scenario testing
- **Custom stepper header** — Replace Quasar's default step progress bar with the Figma design (custom component with numbered circles and connecting lines)
- **Unit tests** — Test Zod schemas (valid/invalid inputs, cross-step rules), composables (`useOrderSummary`, `useDefaultTab`), and utility functions (`hasTimeOverlap`, `groupBy`, `formatCurrency`)
- **Accessibility** — ARIA labels on interactive elements, keyboard navigation for cards and tabs, focus management on step transitions, screen reader announcements for validation errors
- **Responsive design** — Current layout assumes desktop viewport; would add breakpoints for tablet/mobile (stack sidebar below content, single-column session grid, full-width cards)
- **E2E tests** — Cypress or Playwright tests covering the full wizard flow: happy path, validation errors, edge cases (sold-out sessions, time conflicts, empty addons)

## Design Reference

Figma file: `Nitra FE Assessment - v2` (fileKey `6Jl8Jyv7bETcHg2carNi6d`)

| Frame ID   | Name                                   |
| ---------- | -------------------------------------- |
| `1069:968` | Step 1 — Attendee Info                 |
| `1072:912` | Step 2 — Session Selection             |
| `1073:899` | Step 3 — Add-ons                       |
| `1149:565` | Step 3 — Add-ons (Merchandise variant) |
| `1074:897` | Step 4 — Review & Submit               |
| `1075:903` | Success State                          |
| `1076:935` | Review — Attendee (Error variant)      |

Note: design data comes from the Figma REST API (raw fills/positions), not Dev Mode's Code Connect — colors and spacing will need to be manually mapped to the semantic tokens in `src/unocss/semantic.js` rather than coming pre-mapped.

## Approach / Architecture

### Core requirements

- 4-step wizard: Attendee Info → Session Selection → Add-ons → Review & Submit
- Free backward/forward navigation with all data preserved across steps
- **Validation is deferred to Step 4 submit time** — no inline per-step validation
  - Exception: sessions disabled when sold out; workshops marked unavailable when time-conflicting with selected sessions (real-time in Step 3)
- Unified submit validates all steps at once; per-step error indicators let the user jump to the offending step

### Business rules

| Rule                   | Detail                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| Sold-out sessions      | `registered >= capacity` → disabled, cannot select                                       |
| Session time conflicts | Detected at Step 4 submit; Step 2 gets an error indicator                                |
| Workshop conflicts     | Overlap with any selected session → shown as unavailable in Step 3 (real-time, computed) |
| VIP discount           | 10% off all workshop add-ons when `ticketId === 'vip'`                                   |
| Shipping address       | Optional by default; **required** if any `merchandise` item is in `selectedAddons`       |
| Currency format        | `$X,XXX.XX` (e.g. `$1,234.00`)                                                           |

### State management

Module-level Vue `reactive()` singleton exported from `src/stores/registration.ts`, consumed as `useRegistration()`. Chosen over Pinia to avoid an additional dependency. State shape is derived from (`z.infer<typeof registrationSchema>`), replacing hand-written interfaces.

### Validation / Schema layer

Zod schemas split by step, file names match their corresponding component:

| Schema file                            | Validates                                                  |
| -------------------------------------- | ---------------------------------------------------------- |
| `src/schemas/Step1AttendeeInfo.ts`     | `ticketId`, all attendee fields                            |
| `src/schemas/Step2SessionSelection.ts` | `selectedSessionIds` (min 1)                               |
| `src/schemas/Step3Addons.ts`           | `selectedAddons[]` (`id`, `category`, `size?`, `quantity`) |
| `src/schemas/index.ts`                 | Merged schema + cross-step rules via `.superRefine()`      |

**API layer pattern:** `src/api/` wraps each mock with a 150 ms simulated delay, typed return values, and **promise-based caching** (with `{ refresh: true }` to force re-fetch). Components import from `src/api/` only — never from `src/mocks/` directly. Swap the mock `import` for a real `fetch` call when the backend is ready; component code is unchanged.

**Wizard layout:** `RegistrationWizard.vue` owns the page frame — header (logo + event name) and footer (`#navigation` slot with Back/Next/Submit). Step components render content only. Back button uses `v-if` (not `v-show` — `display:none` breaks flex layout); Next/Submit uses `ml-auto` rather than `justify-between` + an empty spacer element.

Cross-step rules in `registrationSchema.superRefine()`:

- `shippingAddress` required when any addon has `category === 'merchandise'`
- No overlapping time slots in `selectedSessionIds`

`AddonSelection` carries `category` so cross-step rules work without referencing the addon catalog at validation time.

### Component structure

```
src/
  api/
    event.ts                   — fetchEvent(): Promise<Event>
    sessions.ts                — fetchSessions(): Promise<Session[]>
    addons.ts                  — fetchAddons(): Promise<Addon[]>
    index.ts                   — re-exports all functions + types
  components/
    RegistrationWizard/        — feature folder; singleton, instantiated once in IndexPage
      RegistrationWizard.vue   — shared header, stepper, shared footer (Back/Next/Submit)
      steps/
        Step1AttendeeInfo.vue
        Step2SessionSelection.vue
        SessionCard.vue          — session card (track badge, checkbox, capacity bar); <ComponentName>Props convention
        Step3Addons.vue          — category tabs, addon cards, order summary sidebar, workshop conflict detection
        AddonCard.vue            — addon card for all categories: workshop (time/spots), meal (toggle), merchandise (size dropdown, qty stepper)
        Step4Review.vue
    shared/
      AppInput.vue             — label + input, uses defineModel<string>
      AppTabs.vue              — reusable pill-tab bar; v-model + options[]; used by Step2 + Step3
      SuccessState.vue
  schemas/
    Step1AttendeeInfo.ts
    Step2SessionSelection.ts
    Step3Addons.ts
    index.ts                   — merged registrationSchema + superRefine
  stores/
    registration.ts            — useRegistration() reactive singleton
  lib/
    utils.ts                 — shared pure helpers: formatTime(), formatTimeRange(), formatWorkshopTime(), formatCurrency()
  mocks/
    event.js · sessions.js · addons.js   — source data; only accessed via src/api/
```

### Key Vue patterns (per evaluation rubric)

- **Composable**: `useRegistration()` for cross-step state
- **Computed over watch**: running total, capacity status, time-conflict flags are all computed properties
- **`defineModel`**: used in child input components that expose a bindable value to their parent
- **JSDoc**: added to all exported functions in schemas, store, and utility helpers (graded criterion)
