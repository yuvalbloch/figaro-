# Figaro — Progress Tracker

Last updated: 2026-05-06

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

## Phase 2 — Canvas + grid [ ]

**Goal:** User can create a session, see the grid, merge cells, resize tracks.

- [ ] `NewSessionDialog` — canvas preset + rows/cols + live preview
- [ ] Canvas surface renders at real proportions with drop shadow + neutral bg
- [ ] N×M panel grid render (`Panel`, `EmptyPanel`)
- [ ] Panel selection (2px accent outline, hairline on hover)
- [ ] Cell-merge mode toolbar + click-two-cells flow + rectangle validation
- [ ] `GridDivider` track resizer (drag, snap, min size)
- [ ] Auto-labeling: `PanelLabel` in reading order (A/B/C…)
- [ ] Per-panel label override (`label.auto = false`)
- [ ] Canvas zoom-to-fit button

## Phase 3 — Data manager + image panels [ ]

**Goal:** User can upload data and drag it onto a panel.

- [ ] `DataManager` add-dataset flow via PapaParse (CSV) and JSON parser
- [ ] `DatasetCard` shows column count, row count, type chips
- [ ] `ColumnPicker` reusable component
- [ ] dnd-kit: dataset → panel
- [ ] Image panel path (SVG/PNG via file picker, `object-fit: contain`)
- [ ] Image controls: alt text, background, border

## Phase 4 — Plot engine + simple charts [ ]

**Goal:** Five chart types render with the full styling control panel.

- [ ] `PlotEngine` interface + Plotly mounting
- [ ] Chart renderers: bar, histogram, pie, heatmap, scatter
- [ ] Per-chart parameter schemas
- [ ] Control panel renders schemas dynamically (slider, color, font, select…)
- [ ] Apply / Reset draft model
- [ ] Overflow rules (`engine/overflow.js`)
- [ ] Shared X / Shared Y linking within row/column

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

- [ ] `public/examples/` with 3 example CSVs + "Load example" button
- [ ] Walk through every acceptance criterion in spec §14
- [ ] Performance pass on 10k-row dataset
- [ ] Sweep code for `TODO(v2)` markers on out-of-scope items

---

## Out of scope for v1 (per spec §13)

Undo/redo, keyboard shortcuts, live preview, data transforms, free-form label
positioning, decorative overlay layer, custom font upload, JSON power-editor,
mobile/tablet, RTL/i18n, CMYK PDF, LaTeX in labels, embedded data in session,
schema migrations, JSON compression, multi-page figures.
