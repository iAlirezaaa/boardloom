# Agent Handoff — 2026-11-03 (v0.2.0)

## Product goal and protected features
Read `AGENTS.md`, `docs/PRODUCT_VISION.md`, `docs/DECISIONS.md` first. Preserve user-defined status border colors, boards, free canvas, editable custom fields, explicit paths and directional image links. Do not silently discard prior ideas.

## Delivered and verified in this update
- Shared-data canvas/table switch with inline table status editing, status progress indicator.
- Image-less tasks (+ Task) so shots can be planned before concepts exist.
- Ctrl/Cmd+click and Ctrl/Cmd+A multi-selection with bulk status/category edits and cross-board moves.
- Bounded session-only Undo/Redo of workspace metadata (Ctrl/Cmd+Z, Shift+Ctrl/Cmd+Z, Ctrl/Cmd+Y) and button controls.
- CSV export of current board metadata, including custom fields with safe escaping and spreadsheet formula mitigation.
- Search now includes custom metadata values.
- `npm run check`: **13/13** tests passed (including table smoke with DOM stubs). HTTP server serves the app locally; full interactive browser E2E was not verified in this environment due Chromium runner hanging.

## Important behaviors / caveats
- No data migration: `version: 1` remains valid. All previous v0.1 workspaces and backups are compatible.
- Undo/Redo is **session-only**; reload clears history. Images stay in IndexedDB on delete, so Undo can recover them. This can accumulate orphaned blobs over time; implement explicit backup-aware cleanup before promising secure/permanent deletion.
- Cross-board bulk move removes affected arrows and can be reversed with Undo. No unapproved filesystem access or server sync is introduced.
- CSV covers **metadata**, not embedded image files. Use existing Backup for complete portable workspaces.

## Next high-value steps
1. Real browser automation for image upload/reload/multi-select/table/Undo and accessibility; fix any discovered DOM regressions.
2. Persistent trash/recovery, safe blob GC and storage quota experience.
3. Labels/removal for connections, stable arrow routing and drag grouping.
4. Multi-card resize and layout presets; shot template setup / CSV import with reviewed schema.
5. Tauri desktop adapter, only with capability-scoped user-granted directories.

## Test and release
```bash
npm run check
npm run dev
```
GitHub path: `https://github.com/iAlirezaaa/boardloom`. Merge/change policy: never rewrite protected concepts without user approval and a before/after + rollback plan.
