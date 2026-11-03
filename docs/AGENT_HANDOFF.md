# Agent Handoff — 2026-11-03

## Current state
Boardloom v0.1 is a **working local, zero-runtime-dependency browser starter**. It is not yet a hosted or shared production service. The complete runnable source and tests are in this project directory.

## What was built
- Domain operations and invariant tests in `src/core.mjs`, `tests/core.test.mjs`.
- Responsive desktop-first dark UI with sidebar, image canvas, inspector, settings, and zoom/pan/drag in `src/app.mjs` and `src/styles.css`.
- Image storage and complete backup/restore in `src/storage.mjs`.
- A secure-ish local HTTP server in `server.mjs`, plus sample illustrations and a CI workflow.
- English and Persian READMEs, protected product decisions, product spec and development roadmap.

## Test evidence
At handoff: `npm run check` passed **7/7** Node domain/render-smoke tests and syntax checks. HTTP file server returned HTTP 200 with CSP headers. Full browser E2E was **not verified** because the execution environment blocks headless Chromium navigation with `ERR_BLOCKED_BY_ADMINISTRATOR` even when requests are locally intercepted. Treat browser testing as an immediate next action, not as a passed test.

## Known first fixes
1. Run an actual browser UX test in a normal development environment. Verify initial display, sample images, card selection, drag/pan, status settings, multi-file upload, IndexedDB persistence, image backup/restore and keyboard controls. Fix defects before adding features.
2. Implement true unbounded canvas coordinates and replace SVG fixed 6000×6000 space if large/many boards are expected.
3. Tighten import schema validation, collisions and storage quotas; make image-import and restore atomic.
4. Add card size control, manual arrow removal/labels, selection/undo/redo and safer trash.
5. Build full localization (`fa` RTL + `en`) and Tauri desktop path/folder support.
6. Evaluate React Flow MIT as a plugin/adapted renderer, retaining core/domain data definitions.
7. Review and execute v0.2 roadmap, one tested PR at a time.

## Repo publication limitation
The available GitHub connector in this session supports **writing files and commits inside existing repositories** but **does not expose creating a new repository**. The requested `iAlirezaaa/boardloom` repository was checked and was **not found** on 2026-11-03. Therefore these project sources are prepared for upload, but not published to GitHub in this handoff. Do not claim a GitHub repository or remote commit exists without verifying it. After the owner creates an empty repo and grants the existing GitHub connector access, publish the prepared files, preserving `AGENTS.md`, docs and CI.

## Publish sequence
```bash
cd boardloom
git init
git branch -M main
git add .
git commit -m "feat: initialize Boardloom visual production workspace"
git remote add origin https://github.com/iAlirezaaa/boardloom.git
git push -u origin main
```

Create an empty GitHub repo of that name first; these commands assume that the user has Git and GitHub authentication configured. No user credentials should be embedded in code, docs or scripts.

## Engineering cautions
- User-generated path strings do not mean the browser can read local files automatically.
- Protect image privacy: don't introduce remote APIs, analytics, uploads or automatic AI processing by default.
- Image URLs and blob lifetimes must be managed carefully; revoke object URLs after removal.
- Preserve sample assets or replace them with appropriately licensed self-authored media.
- Text fields and imported JSON are untrusted. Escape rendered strings, validate URIs and refuse potentially active image formats.
- Follow change-gating requirements documented in `AGENTS.md` and `docs/DECISIONS.md`.

## Product intent to preserve
Status-colored image border; user-defined statuses and custom fields; boards with categories and storage paths; image detail inspector; free visual layout; arrows/relationships; scalable project management. Future extensions must build on these rather than replacing them.
