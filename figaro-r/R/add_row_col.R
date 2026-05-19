#' Append a new empty row to a running Figaro session
#'
#' Queues a layout command that adds one empty row at the bottom of the canvas.
#' The browser picks it up on its next poll cycle (~1 second).
#'
#' @param fig The value returned by [figaro()].
#' @return Invisibly, `fig`.
#' @export
add_row <- function(fig) {
  if (is.null(.figaro_env$server))
    stop("No Figaro server is currently running. Call figaro() first.")
  .figaro_env$pending_panels <- c(
    .figaro_env$pending_panels %||% list(),
    list(list(layoutCommand = list(type = "addRow")))
  )
  message("figaro: queued addRow")
  invisible(fig)
}

#' Append a new empty column to a running Figaro session
#'
#' Queues a layout command that adds one empty column at the right of the canvas.
#' The browser picks it up on its next poll cycle (~1 second).
#'
#' @param fig The value returned by [figaro()].
#' @return Invisibly, `fig`.
#' @export
add_col <- function(fig) {
  if (is.null(.figaro_env$server))
    stop("No Figaro server is currently running. Call figaro() first.")
  .figaro_env$pending_panels <- c(
    .figaro_env$pending_panels %||% list(),
    list(list(layoutCommand = list(type = "addCol")))
  )
  message("figaro: queued addCol")
  invisible(fig)
}
