# Null-coalescing operator
`%||%` <- function(a, b) if (!is.null(a)) a else b

# Generate a ULID-style prefixed ID
new_id <- function(prefix) {
  ts  <- format(as.numeric(Sys.time()) * 1000, scientific = FALSE, digits = 14)
  rnd <- paste0(sample(c(0:9, letters[1:6]), 8, replace = TRUE), collapse = "")
  paste0(prefix, "_", ts, rnd)
}

# ISO 8601 UTC timestamp string
iso_now <- function() {
  format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ", tz = "UTC")
}

# Infer Figaro column type from an R vector
infer_col_type <- function(x) {
  if (is.numeric(x) || is.integer(x)) "number" else "string"
}

#' Classify a user-supplied input item
#'
#' Returns one of: "dataset", "ggplot", "baseplot", "image_file", "pdf_file".
#' Stops with an informative error for unsupported types.
classify_input <- function(x) {
  if (is.data.frame(x))                          return("dataset")
  if (inherits(x, "gg"))                          return("ggplot")
  if (inherits(x, "recordedplot"))               return("baseplot")
  if (is.character(x) && length(x) == 1) {
    if (!file.exists(x)) stop("File not found: ", x)
    ext <- tolower(tools::file_ext(x))
    if (ext %in% c("png", "jpg", "jpeg", "webp")) return("image_file")
    if (ext == "pdf")                              return("pdf_file")
    stop("Unsupported file type: .", ext,
         ". Supported extensions: png, jpg, jpeg, webp, pdf.")
  }
  stop("Unsupported input type: ", paste(class(x), collapse = "/"),
       ".\nPass a data.frame, a ggplot2 object, a base-R recordedPlot, ",
       "or a path to a PNG/JPEG/WebP/PDF file.")
}

#' Convert a file path to a PNG/JPEG data URL (base64)
#'
#' PDF files are rasterized (first page, 150 dpi).
#' Requires 'pdftools' and 'png' packages for PDF input.
file_to_data_url <- function(path) {
  ext <- tolower(tools::file_ext(path))

  if (ext == "pdf") {
    if (!requireNamespace("pdftools", quietly = TRUE))
      stop("Package 'pdftools' is required for PDF import. ",
           "Install it with: install.packages('pdftools')")
    if (!requireNamespace("png", quietly = TRUE))
      stop("Package 'png' is required for PDF import. ",
           "Install it with: install.packages('png')")

    info <- pdftools::pdf_info(path)
    if (info$pages > 1)
      message("figaro: '", basename(path), "' has ", info$pages,
              " pages — only the first page will be imported.")

    img_matrix <- pdftools::pdf_render_page(path, page = 1, dpi = 150)
    tmp <- tempfile(fileext = ".png")
    on.exit(unlink(tmp), add = TRUE)
    png::writePNG(img_matrix, tmp)

    raw_bytes <- readBin(tmp, "raw", file.info(tmp)$size)
    return(paste0("data:image/png;base64,", jsonlite::base64_enc(raw_bytes)))
  }

  mime <- switch(ext,
    jpg  = "image/jpeg",
    jpeg = "image/jpeg",
    webp = "image/webp",
    "image/png"
  )
  raw_bytes <- readBin(path, "raw", file.info(path)$size)
  paste0("data:", mime, ";base64,", jsonlite::base64_enc(raw_bytes))
}

#' Rasterize an R plot to a PNG data URL
#'
#' @param plot_obj  A ggplot2 object or base-R recordedPlot.
#' @param type      Character: "ggplot" or "baseplot".
#' @param width_in  Output width in inches (default 7).
#' @param height_in Output height in inches (default 5).
#' @param dpi       Raster resolution (default 150).
plot_to_data_url <- function(plot_obj, type,
                             width_in = 7, height_in = 5, dpi = 150) {
  tmp <- tempfile(fileext = ".png")
  on.exit(unlink(tmp), add = TRUE)

  if (type == "ggplot") {
    if (!requireNamespace("ggplot2", quietly = TRUE))
      stop("ggplot2 is not installed.")
    ggplot2::ggsave(tmp, plot = plot_obj,
                    width = width_in, height = height_in,
                    units = "in", dpi = dpi)
  } else {
    grDevices::png(tmp,
                   width  = round(width_in  * dpi),
                   height = round(height_in * dpi))
    grDevices::replayPlot(plot_obj)
    grDevices::dev.off()
  }

  raw_bytes <- readBin(tmp, "raw", file.info(tmp)$size)
  paste0("data:image/png;base64,", jsonlite::base64_enc(raw_bytes))
}

# Convert a data.frame to a list of row-objects suitable for JSON serialization.
# Factors are coerced to character; NAs become NULL.
df_to_rows <- function(df) {
  # Coerce factor columns to character
  df <- as.data.frame(
    lapply(df, function(col) if (is.factor(col)) as.character(col) else col),
    stringsAsFactors = FALSE,
    check.names      = FALSE
  )
  lapply(seq_len(nrow(df)), function(i) {
    row <- as.list(df[i, , drop = FALSE])
    lapply(row, function(v) if (length(v) == 1 && is.na(v)) NULL else v)
  })
}
