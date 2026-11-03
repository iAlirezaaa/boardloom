# Boardloom — Agent Instructions

## Mission
Build a reliable, intuitive, extensible **image-first production management system** combining a PureRef-style free canvas, project control, and a creative canvas workflow. Do not quietly reduce it to a moodboard, task-list clone, or static gallery.

## Mandatory reading order
1. `docs/PRODUCT_VISION.md` — user intent and non-negotiable use cases.
2. `docs/DECISIONS.md` — protected product principles and architecture decisions.
3. `docs/ARCHITECTURE.md` — actual data model and module responsibilities.
4. `docs/ROADMAP.md` — priorities and definitions of done.
5. `docs/AGENT_HANDOFF.md` — current implementation, tests, next steps, blockers.

## Execution rules
- Before any change, check actual code and run `npm run check`.
- **Never discard a user-provided requirement**, rename/erase fundamental concepts, or migrate/destroy data without explaining *what changes, why, before/after behavior, migration plan, rollback plan, and risks*; obtain explicit user approval for materially destructive changes.
- Preserve **board => image asset => status/custom fields/paths => connections** in all new implementations.
- Keep the UI highly legible, minimalist, desktop-efficient, keyboard accessible, with strong status-color affordances. Dark styling is the current design baseline, not a data model requirement.
- Keep model logic independent of the renderer; do not introduce a framework only to rewrite a working MVP. Evaluate licensing and performance before adopting external canvas libraries.
- Treat project media as private by default: never add uploads, telemetry, AI calls, remote thumbnails, network sharing, or automatic path scans without opt-in and a documented threat model.
- Preserve image blobs through backup/migration. Never confuse metadata paths with filesystem access rights.
- Add tests for every new core mutation or data migration. Keep npm scripts `dev` and `check` working.
- Update README, roadmap, handoff and decision log when architecture or feature behavior changes.
- On each PR, document: objective, scope, files changed, tests, data/schema impact, security/privacy, remaining work, rollout/rollback, and any owner approvals needed.

## Architecture and naming
- `src/core.mjs`: pure domain and validation.
- `src/storage.mjs`: local metadata, blob persistence, backup.
- `src/app.mjs`: runtime interaction and UI.
- `src/styles.css`: current design system.
- `docs/`: authoritative decisions and product scope; keep in English for consistency. Persian overview lives in `README.fa.md`.

## Safe first issues
Prioritize automated browser interaction tests, scalable image rendering, robust storage/quota handling, a desktop file-system adapter, improved accessible controls, undo/redo, and user-created relation labels. See `docs/ROADMAP.md`.
