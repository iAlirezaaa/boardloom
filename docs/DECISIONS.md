# Decisions and Protected Concepts

A single source of truth for foundational product decisions. Agents must append, not silently rewrite history.

| ID | Date | Decision | Rationale | Change gate |
|---|---|---|---|---|
| D-001 | 2026-11-03 | Image objects carry production states shown by colored borders | The canvas must communicate actionable work state at a glance | Product-owner approval |
| D-002 | 2026-11-03 | Statuses and custom fields are user-defined per project | No fixed pipeline should constrain users | Product-owner approval |
| D-003 | 2026-11-03 | Free spatial canvas and directional links are first-class | References must express order, relationships and dependencies | Product-owner approval |
| D-004 | 2026-11-03 | Projects contain multiple categorized boards and source paths | Support projects with multiple scenes, teams and outputs | Product-owner approval |
| D-005 | 2026-11-03 | v0.1 is local-first, with offline media blobs and full backups | Privacy, quick prototyping and no backend setup | Review before enabling remote services |
| D-006 | 2026-11-03 | v0.1 uses native DOM + SVG rather than a third-party canvas framework | Zero-dependency executable starter; external renderer can replace it later | Engineering proposal and regression tests |
| D-007 | 2026-11-03 | Do not use tldraw SDK in production without resolving its license obligations | Separate commercial production licensing | License review |
| D-008 | 2026-11-03 | Existing data must be migrated, never silently discarded | Production users cannot lose boards or metadata | Migration + backup + owner approval |

## Required change proposal template
1. Current behavior and proposed behavior (before -> after).
2. Which protected requirements or object types change and why.
3. Benefits and drawbacks, licensing, security, privacy, performance, accessibility.
4. Data migration and backup/restore approach.
5. Test plan and measurable acceptance criteria.
6. Rollback plan and compatibility impact.
7. Explicit user approval before destructive or material product-direction changes.

| D-009 | 2026-11-03 | Implement undo/redo as bounded session-only workspace snapshots; keep metadata schema version 1 | Reversible edits without a risky storage migration | Upgrade journal persistence only with recovery tests |
| D-010 | 2026-11-03 | Provide local CSV export with formula injection protection | Production reporting without automatic external data sharing | Review if export format or privacy changes |
| D-011 | 2026-11-03 | Retain media blobs during asset/board removal so Undo remains possible | Protect production images against immediate data loss | Explicit approval and safe backup before cleanup policy |
