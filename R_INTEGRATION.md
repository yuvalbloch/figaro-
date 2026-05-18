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
4. [Input types](#4-input-types)
   - [Data frames](#data-frames)
   - [ggplot2 objects](#ggplot2-objects)
   - [Base-R recorded plots](#base-r-recorded-plots)
   - [Image and PDF files](#image-and-pdf-files)
   - [Mixed calls](#mixed-calls)
5. [Opening a saved session](#5-opening-a-saved-session)
6. [R Plot Style editor](#6-r-plot-style-editor)
7. [Saving and exporting from the browser](#7-saving-and-exporting-from-the-browser)
8. [Stopping the server](#8-stopping-the-server)
9. [Rebuilding the web bundle](#9-rebuilding-the-web-bundle)
10. [Reference](#10-reference)

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

The package lives inside the Figaro repository and is not available on CRAN.
The steps are: **clone the repo → point `devtools` at the `figaro-r` subfolder**.

### Step 1 — Clone the repository

```bash
git clone https://github.com/yuvalbloch/figaro-.git
```

This creates a `figaro-` folder in your current working directory.
The R package source is at `figaro-/figaro-r/` inside that folder.

### Step 2 — Load the package in R

```r
install.packages("devtools")  # once, if not already installed

# Replace the path below with wherever you cloned the repo:
devtools::load_all("C:/GitHub/figaro-/figaro-r")   # Windows example
devtools::load_all("~/projects/figaro-/figaro-r")  # macOS / Linux example
```

`load_all` reads the R source files directly — no build step or install needed.
All exported functions (`figaro`, `figaro_stop`, etc.) become available
immediately in your R session. Re-run `load_all` any time you pull new changes.

### Optional: permanent install

If you want `library(figaro)` to work in every new R session without calling
`load_all` each time:

```r
devtools::install("C:/GitHub/figaro-/figaro-r")
# Then in any session:
library(figaro)
```

---

## 3. Basic usage

```r
devtools::load_all("C:/GitHub/figaro-/figaro-r")  # adjust path to your clone

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

## 4. Input types

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
[R Plot Style editor](#6-r-plot-style-editor) which re-renders the original R
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

## 5. Opening a saved session

To re-open a `.figaro.json` file saved from the browser:

```r
figaro(session = "my_figure.figaro.json")
```

The session loads exactly as it was saved. If the session references data files
that are no longer at their original paths, the browser's *Locate Files* dialog
appears so you can rebind them.

---

## 6. R Plot Style editor

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

## 7. Saving and exporting from the browser

Use the top-bar controls exactly as in the standalone web app:

- **Save** (disk icon) — downloads a `.figaro.json` file containing the full
  session. Re-open it later with `figaro(session = "...")` or via the browser's
  *Open* button.
- **Export** (download icon) — exports SVG, PNG (1×/2×/3×), HTML, or PDF.

Auto-save to browser local storage also works as normal; the session is restored
when you reopen the same browser.

---

## 8. Stopping the server

```r
figaro_stop()
# → "Figaro server stopped."
```

You can also just close the R session. The server runs on `localhost` and is not
accessible outside your machine.

---

## 9. Rebuilding the web bundle

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

## 10. Reference

### `figaro(..., session, canvas, port, launch)`

Opens the Figaro figure composer in the browser.

| Argument | Type | Default | Description |
|---|---|---|---|
| `...` | named | — | Data frames, ggplot2/recordedPlot objects, or file paths. Names become panel labels. |
| `session` | character | `NULL` | Path to a `.figaro.json` file to re-open. Overrides `...`. |
| `canvas` | character | `"A4_portrait"` | Canvas size preset. |
| `port` | integer | auto | TCP port for the local server. |
| `launch` | logical | `TRUE` | Open the browser automatically. |

Returns invisibly: `list(server, port)`.

### `figaro_stop()`

Stops the local server started by the most recent `figaro()` call.

### `build_session(inputs, name, canvas_preset)`

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
