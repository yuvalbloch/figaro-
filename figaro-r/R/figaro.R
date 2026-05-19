# Package-level environment for server state
.figaro_env <- new.env(parent = emptyenv())

#' Open the Figaro interactive figure composer
#'
#' Launches a local web server and opens the Figaro app in your default browser,
#' pre-loaded with the data or plots you supply.
#'
#' Each named argument can be:
#' - A **data frame**: loaded as a dataset the user can drag onto panels and
#'   assign a chart type to interactively.
#' - A **ggplot2 object**: simple single-layer plots are extracted as fully
#'   editable native Figaro charts with pre-filled column mappings, title,
#'   and font size. Complex or multi-layer plots are rasterized and inserted
#'   as image panels; clicking the panel shows a style editor that re-renders
#'   the original R object.
#' - A **base-R recordedPlot**: rasterized to PNG and inserted as an image panel.
#' - A **character string** pointing to an existing PNG, JPEG, WebP, or PDF
#'   file: the file (first page for PDFs) is embedded as an image panel.
#'
#' All types can be mixed in a single call:
#' ```r
#' figaro(data = iris, scatter = my_ggplot, extra = "figure.pdf")
#' ```
#'
#' @param ...       Named inputs: data frames, ggplot2/recordedPlot objects, or
#'                  file paths. Names become panel labels.
#' @param session   Path to an existing `.figaro.json` file. When supplied,
#'                  the saved session is re-opened and `...` is ignored.
#' @param canvas    Canvas size preset. One of: `"A4_portrait"`, `"A4_landscape"`,
#'                  `"letter_portrait"`, `"letter_landscape"`, `"poster_A0"`,
#'                  `"slide_16_9"`, `"slide_4_3"`.
#' @param layout    Panel layout: `NULL` (default — one row, panels side by side),
#'                  a `"RxC"` string such as `"2x2"`, or an integer matrix
#'                  (like R's \code{\link[graphics]{layout}()}) for spanning panels.
#' @param row_sizes Optional numeric vector of relative row heights (length must
#'                  equal number of rows). Defaults to equal heights.
#' @param col_sizes Optional numeric vector of relative column widths (length must
#'                  equal number of columns). Defaults to equal widths.
#' @param port      Local TCP port. Auto-assigned if `NULL`.
#' @param launch    Open the browser automatically? Default `TRUE`.
#'
#' @return Invisibly, a list with `$server` (httpuv handle) and `$port`.
#'   Call [figaro_stop()] to shut down the server.
#'
#' @examples
#' \dontrun{
#' # Data frame — user builds charts interactively
#' figaro(iris = iris)
#'
#' # ggplot2 object — extracted as a native editable scatter chart
#' library(ggplot2)
#' p <- ggplot(iris, aes(Sepal.Length, Sepal.Width, color = Species)) +
#'   geom_point() + labs(title = "Iris")
#' figaro(scatter = p)
#'
#' # 2x2 grid layout
#' figaro(p1 = p1, p2 = p2, p3 = p3, p4 = p4, layout = "2x2")
#'
#' # Matrix layout — panel 1 spans full top row, panels 2 & 3 on bottom row
#' m <- matrix(c(1,1,2,3), nrow = 2, byrow = TRUE)
#' figaro(wide = p1, left = p2, right = p3, layout = m)
#' }
#' @export
figaro <- function(...,
                   session   = NULL,
                   canvas    = "A4_portrait",
                   layout    = NULL,
                   row_sizes = NULL,
                   col_sizes = NULL,
                   port      = NULL,
                   launch    = TRUE) {
  inputs <- list(...)

  if (!is.null(session)) {
    if (!file.exists(session))
      stop("Session file not found: ", session)
    sess_obj <- jsonlite::read_json(session, simplifyVector = FALSE)
    r_plots  <- list()
  } else {
    sess_obj <- build_session(inputs,
                              name          = "Untitled Figure",
                              canvas_preset = canvas,
                              layout        = layout,
                              row_sizes     = row_sizes,
                              col_sizes     = col_sizes)
    r_plots  <- sess_obj$.rPlots %||% list()
  }

  loaded      <- build_loaded(sess_obj)
  sess_clean  <- sess_obj
  sess_clean$fileData <- NULL
  sess_clean$.rPlots  <- NULL

  payload <- jsonlite::toJSON(
    list(session = sess_clean, loaded = loaded),
    auto_unbox = TRUE,
    null       = "null"
  )

  srv <- start_server(payload, port = port, r_plots = r_plots)
  url <- paste0("http://localhost:", srv$port)

  message("Figaro is running at ", url)
  message("Call figaro_stop() to shut it down.")

  .figaro_env$server <- srv$server
  .figaro_env$port   <- srv$port

  if (launch) utils::browseURL(url)
  invisible(srv)
}

#' Stop the currently running Figaro server
#'
#' @export
figaro_stop <- function() {
  if (!is.null(.figaro_env$server)) {
    .figaro_env$server$stop()
    .figaro_env$server <- NULL
    message("Figaro server stopped.")
  } else {
    message("No Figaro server is currently running.")
  }
  invisible(NULL)
}
