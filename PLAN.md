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

## Dependencies

| Package      | Version  | Type          | Justification                                                                                                                                                                                                                                                                 |
| ------------ | -------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript` | `^6.0.3` | devDependency | Type safety for all new source files; enables `as const` enums, typed reactive state, and typed component props/emits                                                                                                                                                         |
| `zod`        | `^4.4.3` | dependency    | Runtime schema validation and TypeScript type inference for all wizard steps; drives cross-step rules (shipping address conditional) via `.superRefine()`; alternative was manual validation which would require hand-writing equivalent logic with no type inference benefit |

## AI Usage Notes

This project is being built with assistance from Claude Code (Anthropic), used for:

- Repository setup (remote configuration, pushing to personal GitHub)
- Dev environment setup: installing Node `22.17.0` via nvm (matching `engines`), enabling Corepack so Yarn `4.6.0` is used per the `packageManager` field
- Configuring a local Figma MCP integration (`figma-developer-mcp`, via `.mcp.json` + a personal access token) to read design specs, tokens, and assets directly from the provided Figma file during implementation
- Implementation/code assistance for the registration wizard (Steps 1-4), to be detailed further as work progresses

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
