# Roadmap

## v0.1 — implemented starter
- Projects and categorized boards, spatial canvas cards, status borders, custom status labels/colors, inspector, editable custom fields, directional arrows.
- Drag/drop image import, on-device blob storage, search/filter, source/storage paths as metadata, backup/restore, native domain tests and CI config.

## v0.2.0 — delivered production workflow slice (2026-11-03)
- [x] Switchable canvas and table views over one data model; inline status editing and owner/deadline overview.
- [x] Select all visible tasks or Ctrl/Cmd+click to multi-select; bulk status/category/move operations.
- [x] Add tasks before an image exists; export CSV reports with custom metadata and formula protection.
- [x] Bounded session Undo/Redo for metadata changes and canvas drags; blob-retaining removal permits session recovery.
- [x] Workflow progress bar and search across custom field values.
- [x] Unit and headless DOM smoke coverage for these operations.

## v0.2 — remaining production-ready local board work (highest priority)
- [ ] Persistent cross-reload undo/redo journal and trash/explicit image blob garbage collection (session-only Undo now exists).
- [ ] Move/resize/rotate cards, groups, snap, auto-layout, better navigation and full keyboard accessibility (multi-select and shortcuts partly delivered).
- [ ] Real folder ingestion with user-granted permissions, source path resolution, change detection, file relocation strategy; desktop adapter when web APIs are insufficient.
- [ ] Create/edit/delete visual connectors with labels, edge types, routing and relation metadata.
- [ ] Export board as high-resolution PNG/SVG and print-friendly storyboard PDF.
- [ ] Reliable backup with versioned migrations, file checksum, atomic import/restore and storage quota handling.
- [ ] Strong browser E2E tests including image upload, reload, custom statuses, arrows and restore; accessibility audit.
- [ ] Browser performance profiling for 100 / 1,000 / 10,000 images and automated budget.
- [ ] Language system with full Persian RTL / English UI translations.

## v0.3 — film/animation pipeline
- [ ] Shots, sequences, takes, versions, source references, reviews, approvals, assignees, due dates, priority.
- [ ] Kanban, gallery, table, timeline and dependency graph as multiple views over one entity schema.
- [ ] History/review comments, comparison between visual versions, before/after and side-by-side diff.
- [ ] Smart filters, asset grouping, saved views, bulk editing, tags, rules, checklists.
- [ ] Optional image metadata extraction, native thumbnails, EXIF/technical information (user-controlled).

## v0.4 — scalable desktop and automation
- [ ] Tauri desktop app with capability-scoped filesystem adapters and optional watched folders.
- [ ] Background thumbnail generation, safe caching, local index/search, optional SQLite storage.
- [ ] Local automation/event bus, open import/export APIs, agency/team templates.
- [ ] Optional agent/AI adapters (never enabled without user consent and clear privacy policy).

## v1.0 — team-grade visual production OS
- [ ] Explicit opt-in multi-user sync, user accounts/ACLs, audit trail and conflict handling.
- [ ] Team projects, role permissions, comments/notifications and approvals.
- [ ] Cloud or self-hosted deployments, data portability and encrypted backups.
- [ ] Integration adapters for creative tools and pipelines; no vendor lock-in.

## Definition of done for every milestone
Use-case acceptance tests pass; existing data migrations are tested; docs and AGENTS handoff are updated; no unexplained change to protected requirements; no silent remote transfer of images; product-owner approval is recorded for breaking decisions.
