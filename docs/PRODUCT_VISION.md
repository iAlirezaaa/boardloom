# Product Vision — Boardloom

## North star
**Turn every production image into an actionable, searchable, connected project item without sacrificing the freedom of an image canvas.**

Boardloom is not simply a gallery, Kanban board or image viewer. It is the shared visual context connecting creative work, status tracking, production notes and dependencies. The visual board should feel as immediate as moving reference pictures on a desk and as useful as a project control tool.

## Target users
Animation directors, storyboard artists, layout/lighting supervisors, AI video production teams, concept artists, agencies, art directors, producers, independent creators, and teams dealing with many visual iterations.

## Protected user requirements (do not drop)
1. Images have **visible configurable status-colored borders**.
2. Status definitions can be **added, removed, renamed, and recolored**; status changes apply consistently.
3. Images live on **free-positioned boards** and may be grouped, categorized, searched, and associated with a project.
4. Clicking an image opens **all associated information**, with an extendable set of editable **custom field names and values**.
5. Boards and images can store explicit **paths and source references**.
6. Users can draw **vectors/arrows or directional relations between images/items**.
7. Interface must remain obvious, refined, uncluttered and fast even with large visual sets.
8. Expandable design: board navigation should eventually support pipeline, gallery, list, timeline, approvals, history and team collaboration without requiring a new data ontology.

## Key object hierarchy
`Workspace -> Project -> Board -> Visual Asset`;
`Project -> Status Definitions + Custom Field Definitions`;
`Visual Asset -> Properties + Blob/External Reference + Board Position`;
`Board -> Directed Connections between Visual Assets`.

A visual asset is a flexible entity. Future typed entities can include shots, sequences, characters, concepts, locations, prompts, version outputs, annotations, materials, asset collections and action items.

## Example workflows
**Animation production:** One board per sequence. Each shot thumbnail has status, shot ID, assignee, due date, notes and linked predecessor/successor. Supervisors use frame colors to spot blocked/review-needed shots instantly.

**AI image/video iteration:** Import generated images, branch iterations with arrow connections, record prompts/model/settings in custom fields, flag approvals or revisions, and trace a selected output to its references.

**Art direction/reference:** Freely assemble a set of references, classify by category, mark selected/approved, and link references to downstream shots.

## Design principles
- Image-first: images are primary; tables are optional views rather than the primary structure.
- Immediate and reversible: autosave, undo/redo, explicit destructive confirmations, durable backups.
- Rich inside / calm outside: power in the inspector; minimal chrome over the canvas.
- Scalable: virtualization, thumbnails and incremental updates for thousands of assets in later releases.
- Transparent statuses: a border must communicate color while keeping labels readable and accessible.
- Local-first by default, opt-in collaboration and external integrations.
- Extensibility: schema/versioned migrations, plugin/import adapters, programmable automation in future releases.

## Explicit non-goals of v0.1
Native filesystem watching, sync and shared collaboration, workspaces with accounts, AI generation, prompt execution, professional RAW/video preview support, controlled external directory writes, file indexing and a native installable desktop app. These are planned capabilities, not claims about the current build.

## Acceptance criteria — core experience
- User can import image -> sees it on canvas -> changes status -> border updates -> reopens after refresh with state and image intact.
- User can add a new workflow color/name, assign it to images, rename it, and remove it with safe reassignment.
- User can create and rename a board, categorize it and save a path; image detail fields can be defined and edited.
- User can link two visual assets with an arrow and delete an asset without leaving broken links.
- User can back up and restore the entire workspace including imported images.
