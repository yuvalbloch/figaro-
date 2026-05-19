# MIME type lookup for static file serving
.mime_type <- function(path) {
  ext <- tolower(tools::file_ext(path))
  switch(ext,
    html  = "text/html; charset=utf-8",
    js    = "application/javascript",
    css   = "text/css",
    json  = "application/json",
    svg   = "image/svg+xml",
    png   = "image/png",
    jpg   = ,
    jpeg  = "image/jpeg",
    webp  = "image/webp",
    woff  = "font/woff",
    woff2 = "font/woff2",
    ttf   = "font/ttf",
    ico   = "image/x-icon",
    "application/octet-stream"
  )
}

# CORS headers for cross-origin requests from the browser page
.cors_headers <- function() {
  list(
    "Access-Control-Allow-Origin"  = "*",
    "Access-Control-Allow-Methods" = "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers" = "Content-Type"
  )
}

#' Start a local httpuv server that serves the Figaro web app with injected data.
#'
#' @param payload_json  JSON string for window.__FIGARO_INITIAL_SESSION__.
#' @param port          TCP port (auto-assigned if NULL).
#' @param r_plots       Named list of ggplot2 objects keyed by img_id
#'                      (used for the /restyle interactive re-render endpoint).
#'
#' @return A list with elements `$server` (httpuv handle) and `$port`.
start_server <- function(payload_json, port = NULL, r_plots = list()) {
  if (is.null(port)) port <- httpuv::randomPort()

  # Store r_plots in .figaro_env so add_panel() can extend it at runtime.
  .figaro_env$r_plots        <- r_plots
  .figaro_env$pending_panels <- list()

  www_dir <- system.file("www", package = "figaro")

  # Fallback: during development, look for dist-r/ next to the R source tree
  if (!nzchar(www_dir) || !dir.exists(www_dir)) {
    candidate <- file.path(dirname(dirname(dirname(
      system.file(package = "figaro")))), "figaro-", "dist-r")
    if (dir.exists(candidate)) www_dir <- candidate
  }

  if (!dir.exists(www_dir))
    stop("Figaro web assets not found. ",
         "Run `npm run build:r` in the figaro- directory and reinstall the package.")

  index_path <- file.path(www_dir, "index.html")
  if (!file.exists(index_path))
    stop("index.html not found in: ", www_dir)

  # Read and cache the index.html, injecting the session payload
  base_html <- paste(readLines(index_path, warn = FALSE), collapse = "\n")
  inject_tag <- sprintf(
    '<script>window.__FIGARO_INITIAL_SESSION__ = %s; window.__FIGARO_R_SERVER__ = "http://localhost:%d";</script>',
    payload_json, port
  )
  injected_html <- sub("</body>", paste0(inject_tag, "\n</body>"), base_html, fixed = TRUE)

  handler <- list(
    call = function(req) {
      path   <- req$PATH_INFO
      method <- req$REQUEST_METHOD

      # Handle CORS pre-flight
      if (method == "OPTIONS") {
        return(list(status = 204L, headers = .cors_headers(), body = ""))
      }

      # /restyle endpoint — re-render a ggplot with new style params
      if (path == "/restyle" && method == "POST") {
        tryCatch({
          raw_body <- req$rook.input$read()
          body     <- jsonlite::fromJSON(rawToChar(raw_body), simplifyVector = FALSE)
          plot_id  <- body$plotId
          p        <- .figaro_env$r_plots[[plot_id]]
          if (is.null(p)) {
            return(list(status  = 404L,
                        headers = .cors_headers(),
                        body    = "R plot not found"))
          }
          if (!requireNamespace("ggplot2", quietly = TRUE)) {
            return(list(status  = 500L,
                        headers = .cors_headers(),
                        body    = "ggplot2 not installed"))
          }

          # Apply style modifications
          if (!is.null(body$title))    p <- p + ggplot2::ggtitle(body$title)
          if (!is.null(body$xLabel))   p <- p + ggplot2::xlab(body$xLabel)
          if (!is.null(body$yLabel))   p <- p + ggplot2::ylab(body$yLabel)
          if (!is.null(body$fontSize)) {
            sz <- as.numeric(body$fontSize)
            p  <- p + ggplot2::theme(text = ggplot2::element_text(size = sz))
          }
          if (!is.null(body$legendPos)) {
            p <- p + ggplot2::theme(legend.position = body$legendPos)
          }

          data_url <- plot_to_data_url(
            p, "ggplot",
            width_in  = as.numeric(body$widthIn  %||% 7),
            height_in = as.numeric(body$heightIn %||% 5)
          )
          resp_json <- jsonlite::toJSON(list(dataUrl = data_url),
                                        auto_unbox = TRUE)
          return(list(
            status  = 200L,
            headers = c(list("Content-Type" = "application/json"), .cors_headers()),
            body    = resp_json
          ))
        }, error = function(e) {
          list(status  = 500L,
               headers = .cors_headers(),
               body    = conditionMessage(e))
        })
      }

      # /pending-panels — drain the add_panel() queue and return deltas as JSON
      if (path == "/pending-panels" && method == "GET") {
        pending <- .figaro_env$pending_panels %||% list()
        .figaro_env$pending_panels <- list()
        resp_json <- jsonlite::toJSON(pending, auto_unbox = TRUE, null = "null")
        return(list(
          status  = 200L,
          headers = c(list("Content-Type" = "application/json"), .cors_headers()),
          body    = resp_json
        ))
      }

      # Serve index.html for root and any unknown path (SPA fallback)
      if (path %in% c("/", "/index.html", "")) {
        return(list(
          status  = 200L,
          headers = list("Content-Type" = "text/html; charset=utf-8"),
          body    = injected_html
        ))
      }

      # Serve static assets from www/
      rel_path  <- sub("^/", "", path)
      file_path <- file.path(www_dir, rel_path)
      if (file.exists(file_path) && !dir.exists(file_path)) {
        raw <- readBin(file_path, "raw", file.info(file_path)$size)
        return(list(
          status  = 200L,
          headers = list("Content-Type" = .mime_type(file_path)),
          body    = raw
        ))
      }

      # SPA: return index.html for unmatched routes
      list(
        status  = 200L,
        headers = list("Content-Type" = "text/html; charset=utf-8"),
        body    = injected_html
      )
    }
  )

  server <- httpuv::startServer("127.0.0.1", port, handler)
  list(server = server, port = port)
}
