# Figaro — Progress Tracker

Last updated: 2026-05-06 (Phase 4 complete)

Phases follow the order agreed at session start. A phase ends when each of its
acceptance points is verifiable in the running app.

## Legend

- [x] done
- [~] in progress
- [ ] not started

---

## Phase 1 — Scaffold [x]

**Goal:** App boots to an empty shell that looks like the eventual editor.

- [x] Vite + React 18 + JS-only setup
- [x] Tailwind + shadcn CSS variables
- [x] Project directory structure (per spec §3)
- [x] Three-pane layout (TopBar / DataManager / Canvas / ControlPanel)
- [x] Zustand store with 5 slices (canvas, layout, plots, data, ui) + meta/theme/labeling
- [x] ULID-style id generator
- [x] Schema constants + structural validator
- [x] Built-in themes (3) and palettes (4) data tables
- [x] shadcn `Button` primitive (JS port)
- [x] `npm install` succeeds and `npm run build` produces a working bundle (184 kB JS gz 59 kB)
- [x] Empty shell renders with "New session" button (dialog itself lands in Phase 2)

## Phase 2 — Canvas + grid [x]

**Goal:** User can create a session, see the grid, merge cells, resize tracks.

- [x] `NewSessionDialog` — canvas preset + rows/cols + live preview
- [x] Canvas surface renders at real proportions with drop shadow + neutral bg
- [x] N×M panel grid render (`Panel`, `EmptyPanel`)
- [x] Panel selection (2px accent outline, hairline on hover)
- [x] Cell-merge mode toolbar + click-two-cells flow + rectangle validation
- [x] `GridDivider` track resizer (drag, snap, min size)
- [x] Auto-labeling: `PanelLabel` in reading order (A/B/C…)
- [x] Per-panel label override (`label.auto = false`) via Inspector when a panel is selected
- [x] Canvas zoom-to-fit button (`Fit` in `CanvasToolbar`, also auto-fits on resize)

## Phase 3 — Data manager + image panels [x]

**Goal:** User can upload data and drag it onto a panel.

- [x] `DataManager` add-dataset flow via PapaParse (CSV) and JSON parser
- [x] `DatasetCard` shows column count, row count, type chips
- [x] `ColumnPicker` reusable component
- [x] dnd-kit: dataset → panel
- [x] Image panel path (SVG/PNG via file picker, `object-fit: contain`)
- [x] Image controls: alt text, background, border
- [x] Toy example datasets in `public/examples/` + "Load examples" button (Phase 9 item delivered early)

## Phase 4 — Plot engine + simple charts [x]

**Goal:** Five chart types render with the full styling control panel.

- [x] `PlotEngine` interface + Plotly mounting
- [x] Chart renderers: bar, histogram, pie, heatmap, scatter
- [x] Per-chart parameter schemas
- [x] Control panel renders schemas dynamically (slider, color, font, select…)
- [x] Apply / Reset draft model
- [x] Overflow rules (`engine/overflow.js`)
- [x] Shared X / Shared Y linking within row/column

## Phase 5 — Stacked bar + themes/palettes/fonts [ ]

- [ ] `stackedBar` renderer (grouped + normalized variants)
- [ ] Theme switcher applies defaults to new plots
- [ ] Custom palette swatch row
- [ ] Font dropdown wired to bundled fonts (still loaded via Google Fonts at this stage)

## Phase 6 — Persistence [ ]

- [ ] `exportSession.js` writes `.figaro.json` matching schema
- [ ] `importSession.js` parses + validates
- [ ] `LocateFilesDialog` walks datasets/imageRefs and rebinds files
- [ ] Round-trip test (save → reopen → relocate → identical render)

## Phase 7 — Exports [ ]

Order: SVG → PNG → HTML → PDF.

- [ ] SVG export (composed master SVG with auto-labels as `<text>`)
- [ ] PNG export (offscreen canvas at 2× DPI)
- [ ] HTML export (self-contained with Plotly inline)
- [ ] PDF export — bundled TTFs + jsPDF + svg2pdf.js + `<foreignObject>` fallback note
- [ ] Export dialog with previews + format-specific options

## Phase 8 — Network chart [ ]

- [ ] Edges dataset picker in control panel
- [ ] d3-force layout (force-directed + circular fallback)
- [ ] Plotly traces: nodes (scatter) + edges (lines)
- [ ] Re-layout button + cached positions
- [ ] Node label toggle, sizing, edge opacity

## Phase 9 — Polish [ ]

- [x] `public/examples/` with 3 example CSVs + "Load example" button (delivered in Phase 3)
- [ ] Walk through every acceptance criterion in spec §14
- [ ] Performance pass on 10k-row dataset
- [ ] Sweep code for `TODO(v2)` markers on out-of-scope items

---

## Out of scope for v1 (per spec §13)

Undo/redo, keyboard shortcuts, live preview, data transforms, free-form label
positioning, decorative overlay layer, custom font upload, JSON power-editor,
mobile/tablet, RTL/i18n, CMYK PDF, LaTeX in labels, embedded data in session,
schema migrations, JSON compression, multi-page figures.
