# Issue Resolution Plan

Issues ordered simplest → most complex. Skip list: #14 (done), #18 (skip), #10 (skip), #20 (skip).

---

## Tier 1 — Docs only (no code)

### #17 Installation guide
**What:** Clarify in README whether cloning the repo is required to install the R package.  
**Work:** Edit README with step-by-step install instructions (clone vs. `devtools::install_github`, dependencies, etc.).  
**Effort:** ~30 min.

### #15 Utilization
**What:** Make the app accessible to users — hosted + local docs.  
**Work:**
1. Confirm/fix GitHub Pages deploy (base path `/figaro-/` is already set in Vite). it currently work
2. Add a "How to use" section to README: hosted URL, and `npm install && npm run dev` for local.  
**Effort:** ~1 h.

---

## Tier 2 — Small UI changes (1–2 files)

### #13 Session titles
**What:** Users cannot edit the figure name (`meta.name`, default `"Untitled Figure"`).  
**Where:** `setMeta` action already exists in `src/store/index.js:29`. Just need a UI input.  
**Work:** Add an editable text field (inline or in a settings dialog) that calls `setMeta({ name })`.  
**Effort:** ~1 h.

allready solved 

### #6 Reset zoom
**What:** No way to reset zoom after panning/zooming a Plotly chart.  
**Work:** Add a "Reset zoom" button per panel (or in the panel toolbar) that calls:
```js
Plotly.relayout(el, { 'xaxis.autorange': true, 'yaxis.autorange': true })
```
**Effort:** ~1 h.

### #7 Label styling
**What:** Support more label formats beyond `A B C`: e.g. `a b c`, `1 2 3`, `(A)`, `(a)`, `(1)`.  
**Where:** `src/lib/labels.js:16` — `formatLabel()` already handles all these cases. The fix is likely just exposing them in the UI dropdown.  
**Work:** Find the label style selector in the UI and add the missing format options.  
**Effort:** ~1 h.

---

## Tier 3 — Bug fixes

### #22 Merge cells issue
**What:** When merging two panels, the result depends on which panel was selected first — instead if one of them have graph inside it should be the one that merging meaining that now the graph and not the empty window will cover both of them,
**Work:** Find the merge logic (likely in `src/store/index.js` or a layout utility) and make it canonicalize the selection order (e.g. always use the top-left cell as the anchor).  
**Effort:** ~2 h.

### #24 Broken adding plot (R package)
**What:** In the R figaro package, if a plot type is unsupported by Figure, the app crashes instead of gracefully falling back.  
**Work:** Locate the R-side `add_plot()` or equivalent function, find where the type is validated, and add a proper fallback (the fall back is update it in the other format which mean it will shown it the app but will the plot will not edtible) 
**Effort:** ~2 h.

---

## Tier 4 — New features

### #16 Drag-and-drop (moving labels inside subfigures)
**What:** Users want to drag labels (and possibly other elements) freely within a panel.  
**Work:** Implement draggable label positioning on the canvas. Store per-panel label offset in `plotsSlice`. Update the SVG export to respect those offsets.  
**Effort:** ~4 h.

### #8 Global themes
**What:** Currently styling is per-panel only. Add a global style panel that applies to all panels at once.  
**Work:**
1. Add a "Global style" section to the sidebar/settings panel.
2. Add a `globalStyle` slice (or reuse `theme`) in the store.
3. When rendering, merge global style → per-panel style (per-panel overrides global).  
**Effort:** ~4 h.
I think the esiest her will be to use the allready exsiting theme but just the abilty to add new theme 
---

## Tier 5 — Complex

### #5 / #21 Undo
**What:** Both issues request an undo button for recent changes. (Note: this overrides the original spec §13 which listed undo as out-of-scope.)  
**Work:**
1. Add a history stack to the Zustand store (array of snapshots or command objects).
2. On every user action that mutates `plotsSlice` / `layoutSlice`, push the previous state onto the stack (cap at ~20 entries).
3. Add an "Undo" button (or Ctrl+Z handler) that pops the stack and restores state.
4. Issues #5 and #21 can be closed as duplicates — resolve both with one implementation.  
**Effort:** ~6 h.

---

## Summary table

| # | Title | Tier | Effort |
|---|-------|------|--------|
| 17 | Installation guide | Docs | 30 min |
| 15 | Utilization | Docs | 1 h |
| 13 | Session titles | UI | 1 h |
| 6  | Reset zoom | UI | 1 h |
| 7  | Label styling | UI | 1 h |
| 22 | Merge cells bug | Bug fix | 2 h |
| 24 | Broken adding plot (R) | Bug fix | 2 h |
| 16 | Drag-and-drop labels | Feature | 4 h |
| 8  | Global themes | Feature | 4 h |
| 5/21 | Undo | Complex | 6 h |
