<p align="center">
  <img src="public/figaro_logo_v2.png" alt="Figaro logo" height="250">
</p>

# Figaro — R Integration Guide

The `figaro` R package lets you pass data frames, ggplot2 objects, base-R plots,
or image files from your R session directly into the Figaro figure composer.
A local web server starts automatically and your browser opens with everything
pre-loaded — no manual file picking required.

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Installation](#2-installation)
3. [Basic usage](#3-basic-usage)
4. [Panel layout](#4-panel-layout)
5. [Input types](#5-input-types)
   - [Data frames](#data-frames)
   - [ggplot2 objects](#ggplot2-objects)
   - [Base-R recorded plots](#base-r-recorded-plots)
   - [Image and PDF files](#image-and-pdf-files)
   - [Mixed calls](#mixed-calls)
6. [Adding panels to a running session](#6-adding-panels-to-a-running-session)
7. [Opening a saved session](#7-opening-a-saved-session)
8. [R Plot Style editor](#8-r-plot-style-editor)
9. [Saving and exporting from the browser](#9-saving-and-exporting-from-the-browser)
10. [Stopping the server](#10-stopping-the-server)
11. [Rebuilding the web bundle](#11-rebuilding-the-web-bundle)
12. [Reference](#12-reference)

---

## 1. Prerequisites

| Requirement | Version |
|---|---|
| R | ≥ 4.1 |
| Node.js + npm | ≥ 18 (only needed to rebuild the web bundle) |

Required R packages (all on CRAN):

```r
install.packages(c("jsonlite", "httpuv"))
```

Optional R packages (install only what you need):

| Package | When needed |
|---|---|
| `ggplot2` | Passing ggplot2 objects |
| `rlang` | Native ggplot2 extraction (ships with ggplot2) |
| `pdftools` | Importing PDF files |
| `png` | PDF import on Windows |

---

## 2. Installation

The package lives inside the Figaro repository and is not on CRAN.

### Step 1 — Clone the repository

```bash
git clone https://github.com/yuvalbloch/figaro-.git
```

This creates a `figaro-` folder wherever you run the command.

### Step 2 — Set your working directory to the `figaro-` folder

**RStudio:** Use *Session → Set Working Directory → Choose Directory* and select
the `figaro-` folder. Alternatively, open it as an RStudio project via
*File → Open Project in New Session*.

**Base R / R console:**
```r
setwd("C:/GitHub/figaro-")   # Windows — adjust path to where you cloned it
setwd("~/projects/figaro-")  # macOS / Linux
```

### Step 3 — Run the installer

With `figaro-` as your working directory, run:

```r
source("install.R")
```

The script checks whether `devtools` is installed (and installs it if not),
locates the `figaro-r` package automatically, and installs it. When it
finishes you will see:

```
Done! Load the package in any R session with:
  library(figaro)
```

### After installation

```r
library(figaro)
figaro(iris = iris)
```

---

## 3. Basic usage

```r
library(figaro)

figaro(iris = iris)
# → browser opens at http://localhost:<PORT>
# → iris dataset appears in the Data sidebar
# → drag it onto a panel to start building a chart

figaro_stop()   # shut down the server when finished
```

`figaro()` accepts any number of named arguments — the names become panel labels
in the UI. You can choose a different canvas size with the `canvas` argument:

```r
figaro(iris = iris, canvas = "slide_16_9")
```

Available presets: `A4_portrait` (default), `A4_landscape`, `letter_portrait`,
`letter_landscape`, `poster_A0`, `slide_16_9`, `slide_4_3`.

---

## 4. Panel layout

By default `figaro()` places all panels side by side in a single row. Use the
`layout` argument to arrange panels in a grid, and `row_sizes` / `col_sizes`
to control relative proportions.

### Simple grid — `"RxC"` string

Panels fill the grid left-to-right, top-to-bottom:

```r
# 2 rows × 2 columns
figaro(p1 = p1, p2 = p2, p3 = p3, p4 = p4, layout = "2x2")

# 2 rows × 1 column (stacked)
figaro(top = p1, bottom = p2, layout = "2x1")

# 1 row × 3 columns — same as the default
figaro(a = p1, b = p2, c = p3, layout = "1x3")
```

### Matrix layout — spanning panels

For panels that span multiple cells, pass an integer matrix (exactly like R's
built-in `layout()` function). Each unique integer maps to the correspondingly
positioned named argument:

```r
# Panel 1 spans the full top row; panels 2 and 3 share the bottom row
m <- matrix(c(1, 1,
              2, 3), nrow = 2, byrow = TRUE)
figaro(wide = p1, left = p2, right = p3, layout = m)

# Tall panel on the left, two stacked panels on the right
m2 <- matrix(c(1, 2,
               1, 3), nrow = 2, byrow = TRUE)
figaro(tall = p1, top_right = p2, bot_right = p3, layout = m2)
```

Each integer in the matrix must occupy a **contiguous rectangle** of cells.

### Relative row and column sizes

Use `row_sizes` and `col_sizes` to set proportional heights and widths
(equivalent to CSS `fr` units):

```r
# Left column twice as wide as the right
figaro(main = p1, inset = p2,
       layout    = "1x2",
       col_sizes = c(2, 1))

# Top row twice as tall as the bottom
figaro(p1 = p1, p2 = p2, p3 = p3, p4 = p4,
       layout    = "2x2",
       row_sizes = c(2, 1))
```

### Adjusting the layout visually in the browser

If you used the default layout (or want to fine-tune after opening the browser),
the Figaro web UI provides three tools in the toolbar above the canvas:

**Reorganize** — changes the grid dimensions and reflows all panels.
Click the *Reorganize* button, enter the desired number of rows and columns,
and click *Apply*. Panels are redistributed left-to-right, top-to-bottom into
the new grid. Empty cells are added if the new grid is larger; a warning is
shown if it is smaller than the number of panels with content.

Example workflow: `figaro(p1=p1, p2=p2, p3=p3)` opens a 1×3 layout.
Click *Reorganize* → enter 2 rows, 2 columns → *Apply* → panels are now in a
2×2 grid with one empty cell that you can fill later.

**Drag to swap** — moves a panel to a different position.
Hover over any panel to reveal a small grip icon (⠿) in its top-left corner.
Drag it and drop it onto any other panel to swap their positions. The content
of both panels is exchanged; everything else (grid dimensions, other panels)
stays the same.

**Merge / Split cells** — combines two adjacent panels into one spanning cell,
or splits a merged cell back. Click *Merge cells* in the toolbar, then click
two cells that together form a rectangle to merge them. Click a merged cell
while in merge mode to split it back into individual cells. Click
*Done merging* to exit merge mode.

**Resize rows and columns** — drag the divider lines between panels to
adjust their relative proportions.

All four tools work together and can be combined freely.

---

## 5. Input types

### Data frames

```r
figaro(data = iris)
```

The data frame is loaded as a dataset in the left sidebar. Drag it onto an empty
panel to assign a chart type, or use the Inspector on the right to configure it.
All chart types (scatter, bar, histogram, heatmap, pie, network, stacked bar)
are available.

### ggplot2 objects

```r
library(ggplot2)
p <- ggplot(iris, aes(Sepal.Length, Sepal.Width, color = Species)) +
  geom_point() +
  labs(title = "Iris scatter", x = "Sepal length (cm)", y = "Sepal width (cm)") +
  theme(text = element_text(size = 14))

figaro(scatter = p)
```

**Simple plots** (single layer, no facets, supported geom) are extracted as
fully editable native Figaro charts. Column mappings, title, axis labels, and
base font size are pre-filled in the Inspector and can be changed interactively.

Supported geoms for native extraction: `geom_point` (scatter), `geom_bar` /
`geom_col` (bar), `geom_histogram` (histogram).

**Complex plots** (multiple layers, facets, or unsupported geoms) are
rasterized to PNG and inserted as image panels. Clicking the panel reveals the
[R Plot Style editor](#8-r-plot-style-editor) which re-renders the original R
object with new style settings.

```r
# Multi-layer → image panel with R Plot Style editor
p2 <- ggplot(iris, aes(Sepal.Length, Sepal.Width)) +
  geom_point() + geom_smooth()
figaro(complex = p2)
# Console: "figaro: 'complex' could not be extracted … — inserting as image panel."
```

### Base-R recorded plots

```r
plot(iris$Sepal.Length, iris$Sepal.Width)
p_base <- recordPlot()

figaro(base = p_base)
```

Base-R plots are always rasterized and inserted as image panels.

### Image and PDF files

Pass the path to an existing PNG, JPEG, WebP, or PDF file:

```r
figaro(fig = "path/to/figure.png")
figaro(pdf = "path/to/figure.pdf")   # first page only; warns if multi-page
```

The file is embedded as a base64 data URL — the original file is not required
when the browser session is open, and the image is saved in the `.figaro.json`
export.

### Mixed calls

All input types can be combined in one call:

```r
figaro(
  data    = iris,           # data frame → empty panel for user to configure
  scatter = my_ggplot,      # ggplot2 → extracted native chart or image panel
  extra   = "figure.pdf"    # PDF file → image panel
)
```

Panels appear left-to-right in the order the arguments are given.

---

## 6. Adding panels to a running session

You can push new panels into the browser **after** `figaro()` has already
launched, without restarting:

```r
library(ggplot2)
p1 <- ggplot(iris, aes(Sepal.Length, Sepal.Width, color = Species)) + geom_point()
p2 <- ggplot(iris, aes(Species)) + geom_bar()
p3 <- ggplot(iris, aes(Petal.Length)) + geom_histogram()

fig <- figaro(panel1 = p1, panel2 = p2)

# Later — adds a third panel on the right without reopening the browser
add_panel(fig, panel3 = p3)
```

`add_panel()` accepts the same input types as `figaro()` (data frames, ggplot2
objects, recorded base-R plots, file paths) and appends each as a new column
to the right of the existing layout. The browser picks up changes within about
one second.

---

## 7. Opening a saved session


To re-open a `.figaro.json` file saved from the browser:

```r
figaro(session = "my_figure.figaro.json")
```

The session loads exactly as it was saved. If the session references data files
that are no longer at their original paths, the browser's *Locate Files* dialog
appears so you can rebind them.

---

## 8. R Plot Style editor

When an image panel backs a complex ggplot2 object (i.e. the panel has `rPlot: true`
in its metadata), the Inspector shows an **R Plot Style** section below the
standard image controls.

The editor sends new style parameters back to the running R process, which
re-renders the original ggplot2 object and returns a fresh PNG. The panel image
updates in-place without a page reload.

Available controls:

| Control | Effect on the R plot |
|---|---|
| **Title** | `ggtitle(...)` |
| **X label / Y label** | `xlab(...)` / `ylab(...)` |
| **Base font size** | `theme(text = element_text(size = ...))` |
| **Legend position** | `theme(legend.position = ...)` — Right, Bottom, Left, Top, Hidden |
| **Width / Height (in)** | Rasterization dimensions passed to `ggsave` |

Click **Apply style** to trigger the re-render. The R server processes the
request synchronously; a spinner appears while waiting.

The R Plot Style editor is only visible when the R server is running (i.e. the
page was opened via `figaro()`). In normal browser use the section is hidden.

---

## 9. Saving and exporting from the browser

Use the top-bar controls exactly as in the standalone web app:

- **Save** (disk icon) — downloads a `.figaro.json` file containing the full
  session. Re-open it later with `figaro(session = "...")` or via the browser's
  *Open* button.
- **Export** (download icon) — exports SVG, PNG (1×/2×/3×), HTML, or PDF.

Auto-save to browser local storage also works as normal; the session is restored
when you reopen the same browser.

---

## 10. Stopping the server

```r
figaro_stop()
# → "Figaro server stopped."
```

You can also just close the R session. The server runs on `localhost` and is not
accessible outside your machine.

---

## 11. Rebuilding the web bundle

The `figaro-r/inst/www/` directory ships a pre-built copy of the web app.
If you modify the web app source in `figaro-/` and want to update the R
package's bundled copy:

```r
# 1. Build with relative asset paths
#    (run in the figaro- directory)
```

```bash
cd path/to/figaro-
npm install
npm run build:r          # outputs to dist-r/
```

```bash
# 2. Copy the build into the R package (run from the figaro- directory)
cp -r dist-r/. figaro-r/inst/www/
```

Then reload the package:

```r
devtools::load_all("path/to/figaro-/figaro-r")
```

---

## 12. Reference

### `figaro(..., session, canvas, layout, row_sizes, col_sizes, port, launch)`

Opens the Figaro figure composer in the browser.

| Argument | Type | Default | Description |
|---|---|---|---|
| `...` | named | — | Data frames, ggplot2/recordedPlot objects, or file paths. Names become panel labels. |
| `session` | character | `NULL` | Path to a `.figaro.json` file to re-open. Overrides `...`. |
| `canvas` | character | `"A4_portrait"` | Canvas size preset. |
| `layout` | NULL / string / matrix | `NULL` | Panel grid layout. See [Section 4](#4-panel-layout). |
| `row_sizes` | numeric vector | `NULL` | Relative row heights. |
| `col_sizes` | numeric vector | `NULL` | Relative column widths. |
| `port` | integer | auto | TCP port for the local server. |
| `launch` | logical | `TRUE` | Open the browser automatically. |

Returns invisibly: `list(server, port)`.

### `add_panel(fig, ...)`

Adds one or more panels to a running Figaro session without restarting the server.

| Argument | Type | Description |
|---|---|---|
| `fig` | list | The value returned by `figaro()`. |
| `...` | named | Data frames, ggplot2/recordedPlot objects, or file paths. Names become panel labels. |

Each input is appended as a new column to the right of the existing layout. The
browser picks up the change within ~1 second. Returns invisibly the number of
panels queued.

### `figaro_stop()`

Stops the local server started by the most recent `figaro()` call.

### `build_session(inputs, name, canvas_preset, layout, row_sizes, col_sizes)`

Lower-level function: converts a named list of R inputs to a Figaro session
object. Useful for testing or for saving a session file without opening a browser:

```r
sess <- build_session(list(iris = iris), name = "My Figure")
figaro_save(sess, "my_figure.figaro.json")
```

### `figaro_save(session, path)`

Writes a session object to a `.figaro.json` file (strips in-memory file data
before writing).

### `build_loaded(session)`

Builds the `_loaded` in-memory payload (rows for datasets, data URLs for images)
from a session object. Used internally by `figaro()`.
