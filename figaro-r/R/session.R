# Canvas preset dimensions (mirrors src/persistence/schema.js CANVAS_PRESETS)
.CANVAS_PRESETS <- list(
  A4_portrait      = list(width = 210,  height = 297,  units = "mm"),
  A4_landscape     = list(width = 297,  height = 210,  units = "mm"),
  letter_portrait  = list(width = 8.5,  height = 11,   units = "in"),
  letter_landscape = list(width = 11,   height = 8.5,  units = "in"),
  poster_A0        = list(width = 841,  height = 1189, units = "mm"),
  slide_16_9       = list(width = 1920, height = 1080, units = "px"),
  slide_4_3        = list(width = 1024, height = 768,  units = "px")
)

# Geom class → Figaro chart type mapping
.GEOM_MAP <- c(
  GeomPoint     = "scatter",
  GeomLine      = "line",
  GeomPath      = "line",
  GeomBar       = "bar",
  GeomCol       = "bar",
  GeomHistogram = "histogram",
  GeomBoxplot   = "boxplot",
  GeomTile      = "heatmap"
)

#' Try to extract a ggplot2 object as a native Figaro plot entry.
#'
#' Returns list(ok = TRUE, plot = <list>, df = <data.frame>) on success,
#' or list(ok = FALSE, reason = <string>) on fallback.
ggplot_to_figaro <- function(p, ds_id, plot_id) {
  if (!requireNamespace("ggplot2", quietly = TRUE))
    return(list(ok = FALSE, reason = "ggplot2 not installed"))
  if (!requireNamespace("rlang", quietly = TRUE))
    return(list(ok = FALSE, reason = "rlang not installed"))

  # Only handle single-layer, unfaceted plots
  if (length(p$layers) != 1)
    return(list(ok = FALSE, reason = paste(length(p$layers), "layers (need exactly 1)")))

  facet_cls <- class(p$facet)[1]
  if (!facet_cls %in% c("FacetNull"))
    return(list(ok = FALSE, reason = paste("faceted plot:", facet_cls)))

  layer     <- p$layers[[1]]
  geom_cls  <- class(layer$geom)[1]
  chart_type <- .GEOM_MAP[geom_cls]
  if (is.na(chart_type))
    return(list(ok = FALSE, reason = paste("unsupported geom:", geom_cls)))

  if (!chart_type %in% c("scatter", "bar", "histogram", "line", "boxplot", "heatmap"))
    return(list(ok = FALSE, reason = paste("chart type not in Figaro:", chart_type)))

  # Merge top-level and layer-level mappings; layer overrides global
  top_map   <- as.list(p$mapping)
  layer_map <- as.list(layer$mapping)
  mapping   <- modifyList(top_map, layer_map)

  # Extract a bare column-name string from a quosure
  get_col <- function(aes_name) {
    val <- mapping[[aes_name]]
    if (is.null(val)) return(NULL)
    tryCatch({
      nm <- rlang::as_label(val)
      if (nm %in% c("NULL", "NA", "")) NULL else nm
    }, error = function(e) NULL)
  }

  x_col     <- get_col("x")
  y_col     <- get_col("y")
  color_col <- get_col("colour") %||% get_col("color") %||% get_col("fill")
  size_col  <- get_col("size")

  # Resolve data frame (layer data overrides global)
  df <- if (!is.null(layer$data) && is.data.frame(layer$data)) {
    layer$data
  } else {
    p$data
  }
  if (!is.data.frame(df) || nrow(df) == 0)
    return(list(ok = FALSE, reason = "no data frame attached to plot"))

  # Verify required columns actually exist in the data
  for (col in c(x_col, y_col)) {
    if (!is.null(col) && !col %in% names(df))
      return(list(ok = FALSE, reason = paste("column not found in data:", col)))
  }

  # Extract human-readable labels and base font size
  title     <- p$labels$title  %||% ""
  x_lab     <- p$labels$x      %||% x_col   %||% ""
  y_lab     <- p$labels$y      %||% y_col   %||% ""
  font_size <- tryCatch(as.integer(p$theme$text$size), error = function(e) 12L) %||% 12L

  # Build chart-type-specific params
  params <- list()
  if (chart_type == "scatter") {
    if (!is.null(x_col))     params$x     <- x_col
    if (!is.null(y_col))     params$y     <- y_col
    if (!is.null(color_col)) params$color <- color_col
    if (!is.null(size_col))  params$size  <- size_col
  } else if (chart_type == "bar") {
    if (!is.null(x_col))     params$x     <- x_col
    if (!is.null(y_col))     params$y     <- y_col
    if (!is.null(color_col)) params$group <- color_col
  } else if (chart_type == "histogram") {
    if (!is.null(x_col))     params$x <- x_col
  } else if (chart_type == "line") {
    if (!is.null(x_col))     params$x  <- x_col
    if (!is.null(y_col))     params$ys <- list(y_col)
  } else if (chart_type == "boxplot") {
    # y → Values column; fill/color → optional Group column
    if (!is.null(y_col))     params$y     <- y_col
    if (!is.null(color_col)) params$group <- color_col
  } else if (chart_type == "heatmap") {
    # aes(x, y, fill) → x, y, z (fill is the value encoded by color)
    if (!is.null(x_col))     params$x <- x_col
    if (!is.null(y_col))     params$y <- y_col
    if (!is.null(color_col)) params$z <- color_col
  }

  style <- list(
    title    = if (nchar(title) > 0) title  else NULL,
    xLabel   = if (nchar(x_lab) > 0) x_lab else NULL,
    yLabel   = if (nchar(y_lab) > 0) y_lab else NULL,
    fontSize = font_size
  )

  figaro_plot <- list(
    id           = plot_id,
    type         = chart_type,
    datasetId    = ds_id,
    params       = params,
    style        = style,
    shareXWithRow = FALSE,
    shareYWithCol = FALSE
  )

  list(ok = TRUE, plot = figaro_plot, df = df)
}

#' Parse a layout specification into grid geometry.
#'
#' @param layout NULL, a "RxC" string, or an integer matrix (like R's layout()).
#' @param n_panels Number of panels.
#' @param row_sizes Optional numeric vector of relative row heights.
#' @param col_sizes Optional numeric vector of relative column widths.
#' @return List with rows, cols, rowSizes, colSizes, assignments (one entry per panel).
.parse_layout <- function(layout, n_panels, row_sizes = NULL, col_sizes = NULL) {
  if (is.null(layout)) {
    rows <- 1L
    cols <- as.integer(n_panels)
    assignments <- lapply(seq_len(n_panels), function(i)
      list(rowStart = 1L, rowEnd = 2L, colStart = i, colEnd = i + 1L))

  } else if (is.character(layout)) {
    parts <- strsplit(trimws(layout), "[xX×]")[[1]]
    if (length(parts) != 2 || any(is.na(suppressWarnings(as.integer(parts)))))
      stop("layout string must be \"RxC\" (e.g. \"2x2\"); got: \"", layout, "\"")
    rows <- as.integer(parts[1])
    cols <- as.integer(parts[2])
    if (n_panels > rows * cols)
      stop("layout \"", layout, "\" has only ", rows * cols,
           " cells but ", n_panels, " panels were supplied")
    assignments <- lapply(seq_len(n_panels), function(i) {
      row <- as.integer((i - 1L) %/% cols) + 1L
      col <- as.integer((i - 1L) %%  cols) + 1L
      list(rowStart = row, rowEnd = row + 1L, colStart = col, colEnd = col + 1L)
    })

  } else if (is.matrix(layout)) {
    rows <- nrow(layout)
    cols <- ncol(layout)
    assignments <- lapply(seq_len(n_panels), function(k) {
      cells <- which(layout == k, arr.ind = TRUE)
      if (nrow(cells) == 0)
        stop("Panel ", k, " not found in layout matrix")
      r1 <- min(cells[, 1]); r2 <- max(cells[, 1])
      c1 <- min(cells[, 2]); c2 <- max(cells[, 2])
      expected <- (r2 - r1 + 1L) * (c2 - c1 + 1L)
      if (nrow(cells) != expected)
        stop("Cells for panel ", k, " in layout matrix must form a contiguous rectangle")
      list(rowStart = as.integer(r1), rowEnd = as.integer(r2) + 1L,
           colStart = as.integer(c1), colEnd = as.integer(c2) + 1L)
    })

  } else {
    stop("layout must be NULL, a \"RxC\" string, or an integer matrix")
  }

  list(
    rows       = as.integer(rows),
    cols       = as.integer(cols),
    rowSizes   = if (!is.null(row_sizes)) as.list(row_sizes) else as.list(rep(1L, rows)),
    colSizes   = if (!is.null(col_sizes)) as.list(col_sizes) else as.list(rep(1L, cols)),
    assignments = assignments
  )
}

#' Build a Figaro session object from named R inputs.
#'
#' @param inputs       Named list of data frames, ggplot2 objects, recordedPlots,
#'                     or file paths (PNG/JPEG/WebP/PDF).
#' @param name         Figure title shown in the UI (default "Untitled Figure").
#' @param canvas_preset One of the keys in CANVAS_PRESETS (default "A4_portrait").
#' @param layout       Panel layout: NULL (default 1×N row), a "RxC" string such
#'                     as "2x2", or an integer matrix (like R's \code{layout()}).
#' @param row_sizes    Optional numeric vector of relative row heights (same
#'                     length as number of rows). Defaults to equal sizes.
#' @param col_sizes    Optional numeric vector of relative column widths (same
#'                     length as number of columns). Defaults to equal sizes.
#'
#' @return A list matching the Figaro 1.1.0 session schema, plus a `$fileData`
#'   element (used internally by build_loaded; stripped before serialization).
#'
#' @export
build_session <- function(inputs = list(),
                          name          = "Untitled Figure",
                          canvas_preset = "A4_portrait",
                          layout        = NULL,
                          row_sizes     = NULL,
                          col_sizes     = NULL) {
  canvas_dims <- .CANVAS_PRESETS[[canvas_preset]] %||% .CANVAS_PRESETS[["A4_portrait"]]

  n <- max(length(inputs), 1L)
  grid <- .parse_layout(layout, n, row_sizes, col_sizes)

  datasets   <- list()
  image_refs <- list()
  plots      <- list()
  panels     <- list()
  regions    <- vector("list", n)
  file_data  <- list()
  r_plots    <- list()  # kept in-memory for /restyle; not serialized

  now <- iso_now()

  for (i in seq_len(length(inputs))) {
    item_name <- if (!is.null(names(inputs)) && nzchar(names(inputs)[i]))
      names(inputs)[i] else paste0("panel", i)
    item <- inputs[[i]]
    type <- tryCatch(classify_input(item),
                     error = function(e) {
                       stop("Item '", item_name, "': ", conditionMessage(e))
                     })

    region_id <- new_id("r")
    cell      <- grid$assignments[[i]]
    regions[[i]] <- list(
      id       = region_id,
      rowStart = cell$rowStart,
      rowEnd   = cell$rowEnd,
      colStart = cell$colStart,
      colEnd   = cell$colEnd
    )

    if (type == "dataset") {
      ds_id <- new_id("ds")
      cols  <- lapply(names(item),
                      function(cn) list(name = cn, type = infer_col_type(item[[cn]])))
      datasets[[ds_id]] <- list(
        id       = ds_id,
        name     = item_name,
        columns  = cols,
        rowCount = nrow(item)
      )
      file_data[[ds_id]] <- list(type = "dataset", rows = df_to_rows(item))
      panels[[region_id]] <- list(type  = "empty",
                                  label = list(text = "", auto = TRUE))

    } else if (type == "ggplot") {
      ds_id   <- new_id("ds")
      plot_id <- new_id("plot")
      result  <- ggplot_to_figaro(item, ds_id, plot_id)

      if (result$ok) {
        df   <- result$df
        cols <- lapply(names(df),
                       function(cn) list(name = cn, type = infer_col_type(df[[cn]])))
        datasets[[ds_id]] <- list(
          id       = ds_id,
          name     = item_name,
          columns  = cols,
          rowCount = nrow(df)
        )
        file_data[[ds_id]]  <- list(type = "dataset", rows = df_to_rows(df))
        plots[[plot_id]]    <- result$plot
        panels[[region_id]] <- list(type   = "plot",
                                    plotId = plot_id,
                                    label  = list(text = "", auto = TRUE))
      } else {
        message("figaro: '", item_name, "' could not be extracted as a native ",
                "Figaro plot (", result$reason, ") — inserting as image panel.")
        img_id   <- new_id("img")
        data_url <- plot_to_data_url(item, "ggplot")
        image_refs[[img_id]] <- list(id         = img_id,
                                     name       = item_name,
                                     sourceFile = "",
                                     rPlot      = TRUE)
        file_data[[img_id]]  <- list(type    = "image",
                                     dataUrl = data_url)
        r_plots[[img_id]]    <- item
        panels[[region_id]] <- list(type     = "image",
                                    imageRef = img_id,
                                    label    = list(text = "", auto = TRUE))
      }

    } else if (type == "baseplot") {
      img_id   <- new_id("img")
      data_url <- plot_to_data_url(item, "baseplot")
      image_refs[[img_id]] <- list(id         = img_id,
                                   name       = item_name,
                                   sourceFile = "")
      file_data[[img_id]]  <- list(type = "image", dataUrl = data_url)
      panels[[region_id]] <- list(type     = "image",
                                  imageRef = img_id,
                                  label    = list(text = "", auto = TRUE))

    } else {  # image_file or pdf_file
      img_id   <- new_id("img")
      data_url <- file_to_data_url(item)
      image_refs[[img_id]] <- list(id         = img_id,
                                   name       = item_name,
                                   sourceFile = item)
      file_data[[img_id]]  <- list(type = "image", dataUrl = data_url)
      panels[[region_id]] <- list(type     = "image",
                                  imageRef = img_id,
                                  label    = list(text = "", auto = TRUE))
    }
  }

  # If inputs was empty, create one placeholder empty panel
  if (length(inputs) == 0) {
    region_id <- new_id("r")
    regions[[1]] <- list(id = region_id,
                         rowStart = 1L, rowEnd = 2L,
                         colStart = 1L, colEnd = 2L)
    panels[[region_id]] <- list(type  = "empty",
                                label = list(text = "", auto = TRUE))
  }

  canvas <- c(list(preset          = canvas_preset,
                   dpi             = 300L,
                   backgroundColor = "#ffffff"),
              canvas_dims)

  layout <- list(
    rows     = grid$rows,
    cols     = grid$cols,
    rowSizes = grid$rowSizes,
    colSizes = grid$colSizes,
    gap      = 12L,
    padding  = 24L,
    regions  = regions
  )

  list(
    schemaVersion = "1.1.0",
    meta          = list(name       = name,
                         createdAt  = now,
                         modifiedAt = now),
    canvas        = canvas,
    layout        = layout,
    panels        = panels,
    plots         = if (length(plots) == 0) setNames(list(), character(0)) else plots,
    datasets      = if (length(datasets) == 0) setNames(list(), character(0)) else datasets,
    imageRefs     = if (length(image_refs) == 0) setNames(list(), character(0)) else image_refs,
    theme         = list(name            = "lightMinimal",
                         globalFontFamily = "Inter",
                         baseFontSize    = 12L),
    labeling      = list(enabled  = TRUE,
                         style    = "A",
                         position = "top-left-inside",
                         fontSize = 14L,
                         bold     = TRUE),
    customPalette = list("#4e79a7", "#f28e2b", "#e15759", "#76b7b2",
                         "#59a14f", "#edc948", "#b07aa1", "#ff9da7"),
    fileData      = if (length(file_data) == 0) setNames(list(), character(0)) else file_data,
    .rPlots       = r_plots  # in-memory only; not serialized to JSON
  )
}

#' Build the `loaded` object for session injection.
#'
#' Mirrors the Zustand `_loaded` store shape:
#'   `{ [id]: { rows, blobURL } }` for datasets
#'   `{ [id]: { rows: null, blobURL: <data-url> } }` for images
#'
#' @param session A session object returned by build_session().
#' @export
build_loaded <- function(session) {
  loaded <- list()

  for (ds_id in names(session$datasets %||% list())) {
    fd <- session$fileData[[ds_id]]
    if (!is.null(fd) && identical(fd$type, "dataset")) {
      loaded[[ds_id]] <- list(rows = fd$rows, blobURL = NULL)
    }
  }

  for (img_id in names(session$imageRefs %||% list())) {
    fd <- session$fileData[[img_id]]
    if (!is.null(fd) && identical(fd$type, "image")) {
      loaded[[img_id]] <- list(rows = NULL, blobURL = fd$dataUrl)
    }
  }

  loaded
}

#' Save a Figaro session to a .figaro.json file.
#'
#' @param session A session object returned by build_session().
#' @param path    Destination file path (typically ending in .figaro.json).
#' @export
figaro_save <- function(session, path) {
  out <- session
  out$fileData <- NULL  # file data lives in _loaded at runtime, not in the file
  out$.rPlots  <- NULL  # in-memory R objects are not serializable
  jsonlite::write_json(out, path,
                       auto_unbox = TRUE,
                       null       = "null",
                       pretty     = TRUE)
  invisible(path)
}
