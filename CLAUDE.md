# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:5173/figaro-/
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
```

No test runner or lint command is configured.

## Architecture

**Figaro** is a React 18 + Vite web app for composing multi-panel scientific figures. Users build a grid of panels, assign chart/image types to each, load CSV/JSON data, style the output, and export as SVG/PNG/HTML/PDF.

### State (Zustand)

The single store (`src/store/index.js`) has five conceptual slices merged at the root level:

| Slice | Key state |
|---|---|
| `canvasSlice` | Paper size, DPI, background color |
| `layoutSlice` | Grid rows/cols, region spans, panel types/labels |
| `dataSlice` | Datasets (parsed columns + `_loaded` in-memory rows) and image refs |
| `plotsSlice` | Per-plot config: chart type, datasetId, params, style, axis linking |
| `uiSlice` | Selection, open dialogs, `draft` (pending Apply state) |

`_loaded` cache (parsed rows, Blob URLs) lives only in memory and is never serialized.

### Engine

`src/engine/` handles all rendering and export logic, isolated from React components:

- **`PlotEngine.jsx`** — React wrapper that mounts/updates Plotly.js instances per panel
- **`registry.js`** — Maps chart type strings → `{ schema, render }` objects
- **`charts/`** — One file per chart type (bar, scatter, histogram, pie, heatmap, network, stacked bar); each exports a render function that returns a Plotly `{ data, layout }` object
- **`layout.js`** — Builds the base Plotly layout from canvas theme/font settings
- **`commonStyle.js`** — Shared style parameter schema used across chart types
- **`axisLinking.js`** — Computes shared X/Y axis ranges within a row/column
- **`export/`** — `toSvg.js` composes the master SVG; `toPng.js`, `toPdf.js`, `toHtml.js` wrap it

### Key patterns

- **Draft mode:** `ui.draft` holds uncommitted plot params/style edits. "Apply" writes them to `plotsSlice`; "Reset" discards.
- **IDs:** ULID-style with prefix (`ds_`, `plot_`, `region_`, etc.) generated in `src/lib/id.js`.
- **Grid geometry:** CSS Grid with `fr` units; resize dividers are absolutely-positioned DOM elements with mouse listeners.
- **Auto-labels:** `src/lib/labels.js` sorts regions by reading order (rowStart → colStart) and formats A/B/C-style labels; individual panels can opt out.
- **Persistence:** `exportSession()` / `importSession()` in `src/persistence/schema.js` serialize/deserialize the store as a `.figaro.json` v1.0.0 file. `LocateFilesDialog` re-binds file paths on load.

### Vite config

- Base path is `/figaro-/` — all asset references are relative to that prefix.
- Alias `@` resolves to `./src`.

### User manual

`MANUAL.md` is the end-user documentation for the app. **Any change to the UI — new controls, renamed options, added or removed chart types, changed dialog behavior, etc. — must be reflected in `MANUAL.md` before the task is considered complete.**

### Scope limits (per spec §13)

Not implemented and out of scope: undo/redo, keyboard shortcuts, data transforms, free-form text labels, mobile/tablet layouts, RTL/i18n, LaTeX, multi-page export.
