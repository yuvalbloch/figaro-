# Figaro — Progress Tracker

Last updated: 2026-05-14 (Phase 9 styling features)

## Run the app

```
npm run dev
```

Then open http://localhost:5173 in your browser.

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

## Phase 5 — Stacked bar + themes/palettes/fonts [x]

- [x] `stackedBar` renderer (grouped + normalized variants)
- [x] Theme switcher applies defaults to new plots
- [x] Custom palette swatch row
- [x] Font dropdown wired to bundled fonts (still loaded via Google Fonts at this stage)

## Phase 6 — Persistence [x]

- [x] `exportSession.js` writes `.figaro.json` matching schema
- [x] `importSession.js` parses + validates
- [x] `LocateFilesDialog` walks datasets/imageRefs and rebinds files
- [x] Round-trip test (save → reopen → relocate → identical render)

## Phase 7 — Exports [x]

Order: SVG → PNG → HTML → PDF.

- [x] SVG export (composed master SVG with auto-labels as `<text>`)
- [x] PNG export (offscreen canvas at 2× DPI)
- [x] HTML export (self-contained with Plotly inline)
- [x] PDF export — jsPDF + svg2pdf.js + `<foreignObject>` fallback note in dialog
- [x] Export dialog with format tabs + PNG resolution selector

## Phase 8 — Network chart [x]

- [x] Edges dataset picker in control panel
- [x] d3-force layout (force-directed + circular fallback)
- [x] Plotly traces: nodes (scatter) + edges (lines)
- [x] Re-layout button + cached positions
- [x] Node label toggle, sizing, edge opacity

## Phase 9 — Polish [~]

- [x] `public/examples/` with 3 example CSVs + "Load example" button (delivered in Phase 3)
- [x] Per-element font size sliders — title, axis labels, tick labels, legend each have an independent size slider; null = auto (scales from base font size)
- [x] Title position slider — horizontal drag-to-position slider (0 = left, 1 = right); also saved automatically when Plotly fires a relayout event
- [x] Legend drag & save — drag the legend anywhere on the chart; position is persisted in the plot style and restored on re-render
- [x] Click-to-highlight — clicking a plot element (title, axis label, ticks, legend) highlights the relevant Inspector controls with a ring and scrolls to them
- [x] 4-style visual font picker — 2×2 button grid showing "Aa" in Inter (Sans), Merriweather (Serif), IBM Plex Mono (Mono), Lato (Round)
- [x] Inner plot border toggle — "Plot border" checkbox draws a box frame around the plot area via Plotly `mirror` axes
- [x] Logo updated — replaced figaro_logo.svg with figaro_logo2.png at 60 px height in a 72 px top bar
- [ ] Walk through every acceptance criterion in spec §14
- [ ] Performance pass on 10k-row dataset
- [ ] Sweep code for `TODO(v2)` markers on out-of-scope items

---

## Phase R1 — Vite: R-package build mode [x]

- [x] Add `VITE_BASE_PATH` env var to `vite.config.js` (relative base for R server)
- [x] Install `cross-env` dev dependency (works on Mac/Linux/Windows)
- [x] Add `build:r` npm script → outputs to `dist-r/` with `base: './'`

## Phase R2 — Web app: initial session injection [x]

- [x] Add `window.__FIGARO_INITIAL_SESSION__` hook to `src/App.jsx`
- [x] `window.__FIGARO_R_SERVER__` injected by R server for `/restyle` endpoint
- [x] `RPlotStyleInspector` wired into `ControlPanel` for image panels with `rPlot: true`
- [x] `npm run build:r` → `dist-r/` copied to `figaro-r/inst/www/`

## Phase R3 — R package [x]

- [x] `figaro-r/` package scaffold: `DESCRIPTION`, `NAMESPACE`, `R/`, `inst/www/`, `tests/`
- [x] `R/utils.R`: `new_id()`, `iso_now()`, `infer_col_type()`, `classify_input()`, `file_to_data_url()` (PNG/JPEG/WebP/PDF), `plot_to_data_url()` (ggplot2 + base R), `df_to_rows()`
- [x] `R/session.R`: `build_session()` — data frames, ggplot2 (native extraction with image fallback), recordedPlot, file paths; `ggplot_to_figaro()` extractor; `figaro_save()`; `build_loaded()`
- [x] `R/server.R`: `start_server()`, MIME helper, `/restyle` POST endpoint, `r_plots` in-memory store
- [x] `R/figaro.R`: `figaro()`, `figaro_stop()`, `.figaro_env`
- [x] `src/components/controls/RPlotStyleInspector.jsx`: title, axis labels, font size, legend position, width/height sliders; calls `/restyle` and updates panel image in-place

## Phase R4 — Tests [ ]

- [ ] Unit tests: session schema, column types, round-trip JSON
- [ ] Unit tests: simple ggplot2 → native plot extraction (xCol/yCol/title/fontSize)
- [ ] Unit tests: complex multi-layer ggplot → image fallback
- [ ] Unit tests: mixed data frame + ggplot → empty + plot panels
- [ ] Integration test: server starts, index.html contains injection
- [ ] Manual tests (see plan for full checklist)
- [ ] R CMD check passes (0 errors, 0 warnings)

---

## Out of scope for v1 (per spec §13)

Undo/redo, keyboard shortcuts, live preview, data transforms, free-form label
positioning, decorative overlay layer, custom font upload, JSON power-editor,
mobile/tablet, RTL/i18n, CMYK PDF, LaTeX in labels, embedded data in session,
schema migrations, JSON compression, multi-page figures.
