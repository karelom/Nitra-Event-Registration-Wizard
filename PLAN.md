# PLAN.md

## Time Log

| Date       | Duration | Activity                                                                                                                          |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-15 | ~2h  | Forked repo to personal GitHub; set up dev environment (Node 22.17.0 via nvm, Yarn 4.6.0 via Corepack); configured Figma MCP integration for design reference |
| 2026-06-17 | ~0.5h | Built main wizard structure (`RegistrationWizard.vue`, step stubs, `registration.ts` store); added TypeScript support (`typescript`, `tsconfig.json`, `shims-vue.d.ts`); adopted `as const` enum pattern for step names |
| 2026-06-17 | ~1h | Reviewed Figma (Steps 1–3) and mock data; designed Zod schema layer (`src/schemas/`); installed `zod` v4; created `Step1AttendeeInfo.ts`, `Step2SessionSelection.ts`, `Step3Addons.ts`, `index.ts` with cross-step `superRefine`; flattened registration store to match schema shape; resolved Zod v4 deprecations (`.merge()` → `.extend()`, `z.string().email()` → `z.email()`, string message params → `{ error }` objects) |

## Dependencies

| Package | Version | Type | Justification |
| ------- | ------- | ---- | ------------- |
| `typescript` | `^6.0.3` | devDependency | Type safety for all new source files; enables `as const` enums, typed reactive state, and typed component props/emits |
| `zod` | `^4.4.3` | dependency | Runtime schema validation and TypeScript type inference for all wizard steps; drives cross-step rules (shipping address conditional) via `.superRefine()`; alternative was manual validation which would require hand-writing equivalent logic with no type inference benefit |

## AI Usage Notes

This project is being built with assistance from Claude Code (Anthropic), used for:

- Repository setup (remote configuration, pushing to personal GitHub)
- Dev environment setup: installing Node `22.17.0` via nvm (matching `engines`), enabling Corepack so Yarn `4.6.0` is used per the `packageManager` field
- Configuring a local Figma MCP integration (`figma-developer-mcp`, via `.mcp.json` + a personal access token) to read design specs, tokens, and assets directly from the provided Figma file during implementation
- Implementation/code assistance for the registration wizard (Steps 1-4), to be detailed further as work progresses

## Design Reference

Figma file: `Nitra FE Assessment - v2` (fileKey `6Jl8Jyv7bETcHg2carNi6d`)

| Frame ID    | Name                                          |
| ----------- | --------------------------------------------- |
| `1069:968`  | Step 1 — Attendee Info                        |
| `1072:912`  | Step 2 — Session Selection                    |
| `1073:899`  | Step 3 — Add-ons                              |
| `1149:565`  | Step 3 — Add-ons (Merchandise variant)        |
| `1074:897`  | Step 4 — Review & Submit                      |
| `1075:903`  | Success State                                 |
| `1076:935`  | Review — Attendee (Error variant)             |

Note: design data comes from the Figma REST API (raw fills/positions), not Dev Mode's Code Connect — colors and spacing will need to be manually mapped to the semantic tokens in `src/unocss/semantic.js` rather than coming pre-mapped.

## Approach / Architecture

### Core requirements

- 4-step wizard: Attendee Info → Session Selection → Add-ons → Review & Submit
- Free backward/forward navigation with all data preserved across steps
- **Validation is deferred to Step 4 submit time** — no inline per-step validation
  - Exception: sessions disabled when sold out; workshops marked unavailable when time-conflicting with selected sessions (real-time in Step 3)
- Unified submit validates all steps at once; per-step error indicators let the user jump to the offending step

### Business rules

| Rule | Detail |
| ---- | ------ |
| Sold-out sessions | `registered >= capacity` → disabled, cannot select |
| Session time conflicts | Detected at Step 4 submit; Step 2 gets an error indicator |
| Workshop conflicts | Overlap with any selected session → shown as unavailable in Step 3 (real-time, computed) |
| VIP discount | 10% off all workshop add-ons when `ticketId === 'vip'` |
| Shipping address | Optional by default; **required** if any `merchandise` item is in `selectedAddons` |
| Currency format | `$X,XXX.XX` (e.g. `$1,234.00`) |

### State management

Module-level Vue `reactive()` singleton exported from `src/stores/registration.ts`, consumed as `useRegistration()`. Chosen over Pinia to avoid an additional dependency. State shape is derived from (`z.infer<typeof registrationSchema>`), replacing hand-written interfaces.

### Validation / Schema layer

Zod schemas split by step, file names match their corresponding component:

| Schema file | Validates |
| --- | --- |
| `src/schemas/Step1AttendeeInfo.ts` | `ticketId`, all attendee fields |
| `src/schemas/Step2SessionSelection.ts` | `selectedSessionIds` (min 1) |
| `src/schemas/Step3Addons.ts` | `selectedAddons[]` (`id`, `category`, `size?`, `quantity`) |
| `src/schemas/index.ts` | Merged schema + cross-step rules via `.superRefine()` |

Cross-step rules in `registrationSchema.superRefine()`:
- `shippingAddress` required when any addon has `category === 'merchandise'`
- No overlapping time slots in `selectedSessionIds`

`AddonSelection` carries `category` so cross-step rules work without referencing the addon catalog at validation time.

### Component structure

```
src/
  components/
    RegistrationWizard.vue     — stepper state, navigation, submit handler
    SuccessState.vue
    steps/
      Step1AttendeeInfo.vue
      Step2SessionSelection.vue
      Step3Addons.vue
      Step4Review.vue
  schemas/
    Step1AttendeeInfo.ts
    Step2SessionSelection.ts
    Step3Addons.ts
    index.ts                   — merged registrationSchema + superRefine
  stores/
    registration.ts            — useRegistration() reactive singleton
  mocks/
    event.js · sessions.js · addons.js
```

### Key Vue patterns (per evaluation rubric)

- **Composable**: `useRegistration()` for cross-step state
- **Computed over watch**: running total, capacity status, time-conflict flags are all computed properties
- **`defineModel`**: used in child input components that expose a bindable value to their parent
- **JSDoc**: added to all exported functions in schemas, store, and utility helpers (graded criterion)
