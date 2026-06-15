# PLAN.md

## Time Log

| Date       | Duration | Activity                                                                                                                          |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-15 | ~2h      | Forked repo to personal GitHub; set up dev environment (Node 22.17.0 via nvm, Yarn 4.6.0 via Corepack); configured Figma MCP integration for design reference |

## Dependencies

No additional dependencies added yet beyond the project scaffold. Each new dependency introduced during implementation will be listed here with a short justification.

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

_(to be filled in after reviewing the Figma file and spec)_
