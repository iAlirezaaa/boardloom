# Implementation Architecture (v0.1)

## Technology and constraints
- Native browser modules (ESM), vanilla JS, DOM, SVG, CSS. No build step, npm dependencies or external JavaScript.
- Node.js native HTTP file server for development. Strict content security policy (except necessary inline element styling).
- `localStorage` for compact workspace JSON, `IndexedDB` for raw image blobs, object URLs for image rendering.
- GitHub Actions: node 22 -> `npm run check` (syntax + core tests).

## Model
```ts
type Workspace = {
  version: 1;
  activeProjectId: string; activeBoardId: string;
  projects: Project[];
};
type Project = {
  id: string; name: string; description: string; createdAt: string;
  statuses: {id: string; name: string; color: string}[];
  fields: {id: string; name: string; type: 'text'|'number'|'date'|'url'}[];
  boards: {id: string; name: string; category: string; storagePath: string; createdAt: string}[];
  assets: Asset[]; edges: Edge[];
};
type Asset = {
  id: string; boardId: string; name: string; description: string;
  statusId: string; category: string; sourcePath: string; tags: string[];
  custom: Record<string, string>; position: {x:number; y:number};
  imageKey?: string; sample?: string; createdAt: string;
};
type Edge = {id: string; boardId: string; from: string; to: string; label: string};
```

## Event paths
- `app.mjs` delegates controls to actions (`data-click`) and change handlers (`data-change`). The DOM is regenerated after most mutations.
- Node drag updates DOM coordinates and SVG arrows directly; writes metadata at drag-end.
- SVG links are rendered inside the transformed canvas coordinate system.
- Image files -> validated MIME -> Blob into IndexedDB -> metadata into workspace -> object URL on render.
- Backup -> workspace snapshot + `Blob` => base64 `data:` image entries in JSON.
- Restore -> verify manifest references -> restore images -> write metadata -> re-render.

## Data integrity expectations
- Status deletion reassigns affected assets to first remaining status; last status cannot be deleted.
- Board deletion removes only its images and arrows; last board cannot be deleted.
- Moving an asset to another board removes cross-board arrow references.
- Connections require two distinct nodes belonging to the same board; duplicate directed edges are rejected.
- User input rendered into HTML attributes or text must be escaped; do not introduce unsanitized `innerHTML` inputs.
- Versioned snapshots are validated before import and on routine saves; version migrations are needed before changing the model.

## Known architectural debt
1. `localStorage` write failures must be surfaced and handling should become transactionally consistent with image storage.
2. Deleting a board removes image blobs in a best-effort non-atomic loop. Replace with a journal/transaction approach.
3. For thousands of cards, use incremental rendering, asset virtualization, image thumbnails and quadtree indexing.
4. Board assets currently have fixed 306 px card width; future variable sizing, nesting and rendering LOD require geometry updates.
5. Huge JSON backups are memory-expensive. Prefer streaming a zipped archive with a manifest and checksum.
6. Image metadata `sourcePath` and `storagePath` do **not** grant access to user files. Desktop FS support needs explicit permissions.
7. Browser test tooling and E2E tests are not yet included; implement with Playwright when a browser execution environment is available.
8. Snapshot schema validation covers references and core required collections; add stricter type bounds and collision detection for untrusted imports.
9. The canvas currently uses a 6000×6000 SVG world and clamps coordinates nonnegative; a true unbounded canvas needs origin rebasing.
10. Account sync must include explicit encryption/key management, merge semantics, permissions and audit trails.

## Upgrade strategy
Keep domain and storage independent of UI. Canvas renderer can be replaced behind a stable adapter with React Flow (`@xyflow/react`, MIT), Konva, a custom Canvas2D/WebGL path, or a measured solution. Evaluate dependencies, licenses, node count, hit-testing, keyboard accessibility and export capabilities before choosing. Never rewrite to an incompatible data format without versioned migration tests.


## v0.2 production utilities (backwards compatible)
- `src/history.mjs`: in-memory metadata snapshots bounded to 35 entries; every successful `commit()` records a change, Undo/Redo re-save validated workspace state. Browser reload clears the undo stack.
- `src/core.mjs`: `batchUpdateAssets` validates the **entire** selection and requested operation before mutation; cross-board moves remove affected connection edges, preserving invariants. `exportBoardCsv` generates a UTF-8 BOM CSV with escaped custom fields and spreadsheet formula protection.
- `src/app.mjs`: two views share **the same entities**. The table and canvas both edit status via the domain model; multi-selection is temporary UI state only. Empty-image tasks use the existing no-image asset representation.
- Image blobs are not immediately deleted when an asset/board is removed, so session Undo can recover images. An explicit, safe, future orphan-blob cleanup flow is necessary before calling deletion permanent. Do not silently clear IndexedDB or change this without a recovery design.
- No database schema bump or migration is required; existing version-1 backups remain valid.
