#' Add one or more panels to a running Figaro session
#'
#' Queues new panels to be picked up by the browser on its next poll cycle
#' (~1 second). Each named argument follows the same rules as [figaro()]:
#' data frames, ggplot2 objects, recorded base-R plots, or file paths.
#'
#' @param fig   The value returned by [figaro()] (used only to confirm a
#'   session is active; the actual state lives in the package environment).
#' @param ...   Named inputs to add. Each becomes one new panel appended to
#'   the right of the existing layout.
#'
#' @return Invisibly, the number of panels queued.
#'
#' @examples
#' \dontrun{
#' library(ggplot2)
#' p1 <- ggplot(iris, aes(Sepal.Length, Sepal.Width)) + geom_point()
#' p2 <- ggplot(iris, aes(Species))                   + geom_bar()
#' p3 <- ggplot(iris, aes(Petal.Length))              + geom_histogram()
#'
#' fig <- figaro(panel1 = p1, panel2 = p2)
#' add_panel(fig, panel3 = p3)
#' }
#' @export
add_panel <- function(fig, ...) {
  if (is.null(.figaro_env$server))
    stop("No Figaro server is currently running. Call figaro() first.")

  inputs <- list(...)
  if (length(inputs) == 0)
    stop("Provide at least one named input to add_panel().")

  pending <- .figaro_env$pending_panels %||% list()

  for (i in seq_along(inputs)) {
    item_name <- if (!is.null(names(inputs)) && nzchar(names(inputs)[i]))
      names(inputs)[i] else paste0("panel", i)
    item <- inputs[[i]]

    # Reuse build_session for a single input so classification/conversion is
    # handled identically to the initial figaro() call.
    temp_sess <- tryCatch(
      build_session(setNames(list(item), item_name)),
      error = function(e) stop("add_panel '", item_name, "': ", conditionMessage(e))
    )

    # Single-input session always produces exactly one region/panel.
    region_id <- temp_sess$layout$regions[[1]]$id
    panel     <- temp_sess$panels[[region_id]]

    loaded <- build_loaded(temp_sess)

    delta <- list(
      regionId  = region_id,
      panel     = panel,
      datasets  = temp_sess$datasets  %||% setNames(list(), character(0)),
      plots     = temp_sess$plots     %||% setNames(list(), character(0)),
      imageRefs = temp_sess$imageRefs %||% setNames(list(), character(0)),
      loaded    = loaded
    )
    pending <- c(pending, list(delta))

    # Make any new ggplot2 objects available to the /restyle endpoint.
    new_r_plots <- temp_sess$.rPlots %||% list()
    for (k in names(new_r_plots)) {
      .figaro_env$r_plots[[k]] <- new_r_plots[[k]]
    }

    message("figaro: queued panel '", item_name, "' (", panel$type, ")")
  }

  .figaro_env$pending_panels <- pending
  invisible(length(inputs))
}
