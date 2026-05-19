# Figaro — User Manual

**Live app:** https://yuvalbloch.github.io/figaro-/

---

## Table of Contents

1. [Interface overview](#1-interface-overview)
2. [Starting a new figure](#2-starting-a-new-figure)
3. [Loading data](#3-loading-data)
4. [Building the layout](#4-building-the-layout)
5. [Assigning charts to panels](#5-assigning-charts-to-panels)
6. [Choosing a chart type](#6-choosing-a-chart-type)
7. [Mapping data columns](#7-mapping-data-columns)
8. [Styling a chart](#8-styling-a-chart)
9. [Inserting images](#9-inserting-images)
10. [Merging and splitting cells](#10-merging-and-splitting-cells)
11. [Resizing rows and columns](#11-resizing-rows-and-columns)
12. [Resetting zoom](#12-resetting-zoom)
13. [Linking axes across panels](#13-linking-axes-across-panels)
14. [Panel labels](#14-panel-labels)
15. [Themes](#15-themes)
16. [Exporting the figure](#16-exporting-the-figure)
17. [Saving and opening sessions](#17-saving-and-opening-sessions)
18. [Undoing changes](#18-undoing-changes)

---

## 1. Interface overview

The app is divided into three areas:

| Area | Purpose |
|---|---|
| **Left sidebar — Data** | Import and manage datasets |
| **Center — Canvas** | Compose the multi-panel figure |
| **Right sidebar — Inspector** | Edit the selected panel |
| **Top bar** | Session controls, theme, export |

Click any panel on the canvas to select it. The Inspector on the right updates to show that panel's controls. Click the canvas background to deselect.

When no panel is selected, the Inspector shows **global panel label settings** (style, position, font size, bold toggle).

---

## 2. Starting a new figure

Click the **New** button (file-plus icon) in the top bar. A dialog opens with two columns:

**Left — canvas and grid settings**

- **Canvas preset**: choose from A4 portrait, A4 landscape, Letter portrait, Letter landscape, A0 poster, Slide 16:9, or Slide 4:3.
- **Custom**: click this to enter a width, height, and unit (mm, in, or px) manually.
- **Rows / Columns**: set the initial grid size (1–6 each).

**Right — live preview**

A miniature preview updates as you change rows, columns, and dimensions.

Click **Create** to initialize the figure. Any existing work is discarded.

---

## 3. Loading data

### From your own files

Click the **+** button at the top of the Data sidebar. A file picker accepts `.csv`, `.tsv`, `.json`, and `.txt` files. You can select multiple files at once. Each loaded dataset appears as a card showing its name, row and column count, and a preview of column names color-coded by type:

- **Blue badge** — numeric column
- **Gray badge** — text / categorical column

### From built-in examples

Click **Load examples** (visible in the sidebar when no data is loaded, or at the bottom of the sidebar). Three sample datasets load automatically: Iris, Gapminder, and Sales.

### Removing a dataset

Click the **trash icon** on a dataset card to remove it. Any plots that were using that dataset will lose their data binding.

---

## 4. Building the layout

### Panels

The canvas is a grid of panels. Each panel starts **empty** and shows a drop zone. Panels can hold a **chart** or an **image**.

### Drag to populate

Drag a dataset card from the left sidebar onto an empty panel. The panel highlights when a valid drop is detected. Releasing creates a default chart in that panel.

### Resize rows and columns

Thin dividers sit between rows and between columns. Hover a divider — the cursor changes to a resize arrow — then drag to redistribute space between the adjacent rows or columns.

---

## 5. Assigning charts to panels

Drag a dataset card from the Data sidebar onto any empty panel. A chart is created immediately with default settings.

To **replace** the dataset on an existing plot, use the Inspector: click the panel, then use the dataset-related controls to select a different dataset.

To **clear** a panel back to empty, hover over the panel and click the **×** button that appears in the top-right corner. This removes the chart (or image) and its dataset connection, returning the panel to the empty state. You can also clear from the Inspector: click the panel, then click **Clear panel** (trash icon) at the bottom of the Inspector.

---

## 6. Choosing a chart type

Click a panel that contains a chart. In the Inspector, a row of chart-type buttons appears at the top:

| Button | Chart type |
|---|---|
| Bar | Grouped vertical bars |
| Stacked Bar | Stacked vertical bars |
| Histogram | Distribution of a single numeric column |
| Scatter | X/Y scatter plot (optional size and color encoding) |
| Line | Connected line chart; supports multiple Y columns each drawn in a different color |
| Box Plot | Box-and-whisker summary of a numeric column; optional grouping column creates one box per group |
| Pie | Proportional slices |
| Heatmap | 2-D grid colored by value |
| Network | Force-directed node-link diagram |

Clicking a type switches the chart immediately. The data-column selectors in the **Data** section below update to match the new chart's requirements.

---

## 7. Mapping data columns

Below the chart-type buttons the Inspector shows a **Data** section. Each row maps one visual channel to a column in the dataset.

- **Dropdowns** list the available columns. Numeric columns are marked with `·№`; text columns with `·𝐀`. Some channels (like X and Y axes) only show numeric columns.
- Leaving an optional channel blank (e.g., Color/Group) renders the chart without that encoding.
- **Multi-column selectors** (used by the Line chart's Y columns) show a scrollable checklist. Tick as many numeric columns as needed; each selected column becomes a separate series drawn in a distinct color.

**Line charts** require an X column and one or more Y columns. Rows are sorted by X value before drawing the line. Each Y column is plotted as an independent series.

**Box Plot charts** require a numeric Values (Y) column. Adding a Group By (X) column creates one box per unique group value.

**Network charts** use a single dataset where each row is an edge. Map **Source node** and **Target node** to the columns containing the node identifiers for each end of the edge. Optionally map **Edge weight** (numeric), **Color by** (groups nodes by a categorical column), and **Size by** (scales node size by a numeric column). Nodes are derived automatically from the unique values in the source and target columns.

After changing any column mapping, the chart re-renders automatically if you are not in draft mode. If a **Draft** bar appears at the bottom of the Inspector, click **Apply** to commit, or **Reset** to undo your edits.

---

## 8. Styling a chart

Click a panel, then scroll to the **Style** section in the Inspector.

### Clicking a chart element to navigate controls

Click directly on any text element inside a chart — the title, an axis label, a tick label, or the legend — to jump straight to its controls in the Inspector. The relevant fields highlight with a blue ring and the panel scrolls to them automatically. A small hint ("↑ highlighted from click") appears next to the Style heading while a highlight is active. Click anywhere on the empty chart area to clear the highlight.

### Repositioning chart elements

- **Legend** — drag the legend by its border box to any position on the chart. The legend has a solid background and border to make it easy to grab. The position is saved and restored every time the chart re-renders.
- **Title horizontal position** — use the **Title position** slider (0 = left edge, 1 = right edge) to place the title. The value is also updated automatically if you drag the title within Plotly.

### Title and labels

| Control | What it sets |
|---|---|
| **Title** | Chart title text |
| **Title font size** | Size of the title text (8–36 pt) |
| **Title position** | Horizontal position (0 left → 1 right) |
| **X axis label** | Text below the X axis |
| **Y axis label** | Text left of the Y axis |
| **Axis label size** | Size of both axis label texts (7–28 pt) |
| **Tick label size** | Size of the tick number/category labels (6–22 pt) |

### Color palette

Choose from four built-in palettes:

- **viridis** — sequential, blue-to-yellow
- **set2** — qualitative, pastel
- **tableau10** — qualitative, high-contrast
- **grayscale** — monochrome

Select **Custom** to edit each of the 8 palette colors individually using color pickers.

### Font style

The **Font style** picker shows four options as visual "Aa" previews:

| Label | Font |
|---|---|
| **Sans** | Inter — clean, modern sans-serif |
| **Serif** | Merriweather — traditional serif, suited for publications |
| **Mono** | IBM Plex Mono — monospaced, suited for technical figures |
| **Round** | Lato — rounded, friendly sans-serif |

Click a selected font again to deselect it and fall back to the theme default.

The **Base font size** slider (8–24 pt) sets the default size. Per-element sizes override this when set.

### Legend

- **Show legend** — toggle the legend on or off
- **Legend font size** — size of legend text (6–22 pt); drag the legend on the chart to reposition it

### Grid and frame

- **Show gridlines** — toggle background grid lines
- **Plot border** — draws a box frame around the plot area (mirrors the axis lines on all four sides)

### Other chart-specific options

Depending on the chart type, additional controls may appear:

- **Line width** — for line charts
- **Axis scale** — linear or log
- **Bar mode** — grouped or stacked (bar charts)
- **Color** — single color picker for monochrome charts

### Draft mode

Whenever you change a style or data option, a sticky **Draft** bar appears at the bottom of the Inspector with two buttons:

- **Apply** — commits the changes and re-renders the chart
- **Reset** — discards all unsaved changes and restores the last applied state

---

## 9. Inserting images

To add an image to an empty panel:

1. Click the **Add image** button that appears inside the empty panel on the canvas, or drag an image file directly onto the panel.
2. Supported formats: SVG, PNG, JPEG, WebP.

When an image panel is selected, the Inspector shows:

- **Alt text** — a description for accessibility
- **Background** — choose a background color with the color picker, or click **None** for transparent
- **Border** — set a border width (0–20 px) and border color

Click **Clear panel** to remove the image and return the panel to the empty state. You can also hover over the panel and click the **×** button in the top-right corner.

---

## Canvas view controls

The toolbar above the canvas has two view buttons:

- **Fit** — scales the canvas to fill the full width of the canvas area (the space between the Data and Inspector sidebars). If the canvas becomes taller than the screen, the page scrolls and the sidebars remain visible alongside you as you scroll. The Fit button is replaced by a **Revert** button.
- **Revert** — returns the canvas to the default fit-to-view mode, where the canvas is scaled to show all content within the available area without scrolling.

---

## 10. Merging and splitting cells

Merging combines two or more adjacent panels into one larger panel that spans multiple rows and/or columns.

### Merge

1. Click **Merge cells** in the toolbar above the canvas. The button turns active and instructions appear.
2. Click the **first** panel you want to include. It highlights in blue.
3. Click a **second** panel. The two panels (and everything inside the rectangle they define) merge into one.

The merged region must be rectangular — you cannot create L-shaped or irregular spans.

### Split

1. Click **Merge cells** to enter merge mode.
2. Click an already-merged panel.
3. It splits back into its original individual cells.

Click **Done merging** (the same button, now labeled differently) to exit merge mode.

---

## 11. Resizing rows and columns

Hover over the thin divider line between any two rows or two columns. The cursor changes to a two-headed arrow. Click and drag to redistribute space. The neighboring rows or columns resize proportionally as you drag.

---

## 12. Resetting zoom

After panning or zooming a chart interactively, click the panel to select it, then click **Reset zoom** at the bottom of the Inspector. This restores both axes to their auto-range (fit-to-data) state.

---

## 13. Linking axes across panels

When multiple panels in the same row or column show related data, you can synchronize their axis ranges so they remain consistent as you zoom or change data.

Click a plot panel, then scroll to the **Linking** section in the Inspector:

- **Share X with panels in same row** — checking this forces all plots in that row to use the same X-axis range.
- **Share Y with panels in same column** — checking this forces all plots in that column to use the same Y-axis range.

Linked axes update together whenever one plot's range changes.

---

## 14. Panel labels

Panels are automatically labeled in reading order (left-to-right, top-to-bottom) using letters (A, B, C…) by default. Labels appear inside or outside the panel corner depending on global settings.

### Changing the label style globally

Click anywhere on the canvas background (deselect all panels). The right sidebar shows **Panel labels** settings:

- **Show labels** — toggle to hide or show all auto-labels
- **Style** — choose A / a / 1 / (A) / (a) / (1)
- **Position** — top-left-inside, top-right-inside, top-left-outside, or top-right-outside
- **Font size** — numeric field (default 14)
- **Bold** — toggle

### Dragging a label to reposition it

Every label can be dragged freely within its panel. Hover over the label — the cursor turns into a grab hand — then click and drag it to any position inside the panel. The position is saved per panel and is preserved in exported SVG/PNG files.

To move a label back to its default corner position, select the panel and click **Reset position** (appears next to the **Label** heading in the Inspector whenever a custom position is active).

### Overriding a single panel's label

Select a panel. In the Inspector under the **Label** section:

- **Auto-label (reading order)** is checked by default. Uncheck it to reveal a text input where you can type any custom label for that panel.

---

## 15. Themes

The **Theme** dropdown in the top bar applies a global visual style to the canvas and all charts:

| Theme | Description |
|---|---|
| **Light Minimal** | White background, dark text — default |
| **Dark Minimal** | Dark background, light text |
| **Publication** | White background, black text, Merriweather serif font — suited for journals |
| **Custom** | Fully configurable — opens the custom theme editor |

Switching themes updates the default font, colors, and background for the entire figure.

### Custom theme

Select **Custom** from the theme dropdown to open the theme editor. You can configure:

- **Background** — canvas and legend background color
- **Text** — axis labels, tick labels, title, and legend text color
- **Gridline** — grid line color
- **Axis Line** — axis and border line color
- **Font family** — choose from Inter, Merriweather, IBM Plex Mono, or Lato
- **Base font size** — base size in pixels (8–24)

A live preview shows how the colors and font will look. Click **Apply** to activate the theme. While the Custom theme is active, click the pencil icon next to the theme dropdown to re-open the editor.

---

## 16. Exporting the figure

Click the **Export** button (download icon) in the top bar. A dialog opens with four format tabs:

### SVG
Vector format. Ideal for publication submissions and further editing in Illustrator or Inkscape. No quality loss at any scale.

### PNG
Rasterized image. A **Resolution** selector appears:
- **1×** — 96 ppi (screen quality)
- **2×** — 192 ppi (default, good for most uses)
- **3×** — 288 ppi (high print quality)

### HTML
A self-contained file with inline charts. Charts remain interactive (zoom, pan, hover) in any browser. Requires the Plotly CDN, so an internet connection is needed when opening the file.

### PDF
Print-ready document generated with jsPDF. Note: SVG `<foreignObject>` elements are not supported in all PDF viewers.

Click **Export [FORMAT]** to download the file. The file is named after the figure title. A spinner shows while the export is processing.

---

## 17. Saving and opening sessions

### Browser auto-save

Figaro automatically saves your entire session — layout, plots, datasets, and images — to your browser's local storage (IndexedDB) roughly 1.5 seconds after each change. When you reopen the app in the same browser, the session is restored exactly as you left it, including all loaded data, so there is nothing to re-upload.

A **Saved** indicator (cloud icon) appears next to the figure title in the top bar once the auto-save has run. Hovering over it shows the exact time of the last save.

Auto-save is per-browser: it does not sync across devices or browsers. To share or back up a session, use the manual **Save** button described below.

### Manual save (download to file)

Click the **Save** button (disk icon) in the top bar. The current session downloads as a `.figaro.json` file. The file stores:

- Canvas size and theme
- Grid layout, row/column sizes, merged regions
- All plot configurations (chart type, column mappings, style)
- Dataset metadata and image references (but **not** the raw data — the original files are needed to reload)

### Opening a saved session

Click the **Open** button (folder icon) in the top bar and select a `.figaro.json` file.

If the session references data files or images that have moved or been renamed, the **Locate Files** dialog opens automatically. For each missing file:

1. Click **Browse** next to the file name.
2. Select the current location of that file on your computer.
3. A green checkmark confirms the file is re-linked.

Click **Done** (or **Skip** to proceed without re-linking all files) to finish loading.

---

## 18. Undoing and redoing changes

Click the **Undo** button (↩ arrow icon) in the top bar to step back through recent changes. Up to five undo steps are available per session.

Click the **Redo** button (↪ arrow icon) to reapply a change that was just undone. The redo stack is cleared as soon as you make a new change.

Both buttons are disabled when there is nothing to revert or reapply. Rapid interactions (such as dragging a slider) are grouped into a single undo/redo step rather than producing one entry per frame.
