<p align="center">
  <img src="public/figaro_logo_v2.png" alt="Figaro logo" height="250">
</p>

**Live app:** https://yuvalbloch.github.io/figaro-/

**User manual:** [MANUAL.md](MANUAL.md) · **R integration:** [R_INTEGRATION.md](R_INTEGRATION.md)

A browser-based editor for composing multi-panel scientific figures. Build a grid layout, assign chart or image types to each panel, load your data, style the output, and export — all without leaving the browser.

---

## Getting started 

### Use the hosted app

Open **https://yuvalbloch.github.io/figaro-/** in any modern browser — no installation required.

### Run locally

```bash
git clone https://github.com/yuvalbloch/figaro-.git
cd figaro-
npm install
npm run dev
```

The dev server starts at `http://localhost:5173/figaro-/`.

To build and preview the production bundle:

```bash
npm run build
npm run preview
```

---

## R package installation

The `figaro` R package is bundled in this repository (not on CRAN). Installation requires cloning the repo first:

```bash
git clone https://github.com/yuvalbloch/figaro-.git
```

Then from an R console with the working directory set to the cloned folder:

```r
source("install.R")
```

The script installs required dependencies and the `figaro` package from source. After it finishes:</p>

```r
library(figaro)
figaro(my_data = my_df)
```

See [R_INTEGRATION.md](R_INTEGRATION.md) for the complete guide including ggplot2 support, base-R plots, and image inputs.

---

## Technical overview

### Stack

| Concern | Library |
|---|---|
| UI framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 + Radix UI primitives |
| State management | Zustand 4 |
| Charting | Plotly.js (dist-min build) |
| Drag & drop | dnd-kit |
| Data parsing | PapaParse (CSV/TSV), native JSON |
| Export | jsPDF + svg2pdf.js |
| Deployment | GitHub Pages via GitHub Actions |

### Project structure

```
src/
├── components/       # React UI, organized by feature area
│   ├── controls/     # Right-panel plot inspector and form fields
│   ├── data/         # Dataset manager cards
│   ├── dialogs/      # New session, file locator, export modals
│   ├── editor/       # Canvas, panels, grid resize dividers
│   └── topbar/       # Top navigation bar
├── engine/           # Rendering and export — no React dependencies
│   ├── charts/       # One file per chart type (render fn → Plotly trace)
│   ├── export/       # toSvg / toPng / toHtml / toPdf
│   ├── PlotEngine.jsx
│   └── registry.js   # Chart type → { schema, render } map
├── store/            # Zustand slices: canvas, layout, data, plots, ui
├── themes/           # Built-in themes and color palettes
├── persistence/      # Session schema and import/export logic
└── lib/              # Stateless utilities (IDs, labels, geometry, CSV)
```

### State model

The Zustand store is a flat object composed from five slices. Key concepts:

- **Layout** — a CSS Grid of regions; each region holds a panel of type `empty`, `plot`, or `image`.
- **Plots** — per-panel config: chart type, bound dataset, params, style, and axis-linking flags.
- **Datasets** — metadata (columns, row count) lives in the store; parsed rows are cached in `_loaded` in memory only and never serialized.
- **Draft** — `ui.draft` holds uncommitted edits to a plot's params/style. Clicking *Apply* writes them to the plots slice; *Reset* discards them.

### Session persistence

Saving produces a `.figaro.json` file (schema v1.0.0). On load, if the session references data files that have moved, a *Locate Files* dialog lets the user rebind them without re-configuring the charts.

### Export pipeline

All exports start from a single SVG composition (`engine/export/toSvg.js`) that renders each Plotly chart to an SVG image and assembles the full canvas. PNG and PDF are derived from that SVG; the HTML export bundles an inline copy of Plotly so the figure is self-contained.

