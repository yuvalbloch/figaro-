#' Reinstall figaro from source (recover from a corrupt install)
#'
#' Convenience wrapper for re-running `install.R` from inside an R session.
#' Use this if you see errors like:
#'
#' * `lazy-load database ... is corrupt`
#' * `internal error -3 in R_decompress1`
#' * `package 'figaro' is in use and will not be installed`
#'
#' These usually mean the previously installed figaro is still loaded in the
#' current R session while its files on disk have been overwritten (for example
#' after pulling new code). The only reliable fix is a fresh R session — when
#' running under RStudio this function restarts R automatically and resumes
#' the install; otherwise it prints clear instructions.
#'
#' @param repo Path to the cloned `figaro-` repository (the directory that
#'   contains `install.R` and `figaro-r/`). Defaults to the current working
#'   directory.
#'
#' @return Invisibly `NULL`.
#' @export
figaro_repair <- function(repo = getwd()) {
  repo <- normalizePath(repo, mustWork = FALSE)
  installer <- file.path(repo, "install.R")
  pkg_dir   <- file.path(repo, "figaro-r")

  if (!file.exists(installer) || !dir.exists(pkg_dir)) {
    stop(
      "Could not find install.R and figaro-r/ in: ", repo, "\n",
      "Pass the path to your cloned figaro- repository, e.g.:\n",
      "  figaro::figaro_repair('~/code/figaro-')"
    )
  }

  in_rstudio <- Sys.getenv("RSTUDIO") == "1" &&
                requireNamespace("rstudioapi", quietly = TRUE) &&
                rstudioapi::isAvailable()

  if (in_rstudio) {
    message("[figaro] Restarting R and reinstalling figaro from ", repo, " ...")
    rstudioapi::restartSession(
      command = sprintf("setwd(%s); source(%s)",
                        deparse(repo), deparse(installer))
    )
    return(invisible(NULL))
  }

  # Not in RStudio — we cannot safely overwrite ourselves. Print clear steps.
  message(
    "Please restart R (a fresh, clean session) and then run:\n",
    "  setwd('", repo, "')\n",
    "  source('install.R')\n\n",
    "  - RStudio:         Session > Restart R   (Ctrl/Cmd+Shift+F10)\n",
    "  - R GUI / Rscript: quit() then start R again\n",
    "  - VSCode (R ext):  R: Restart R Session"
  )
  invisible(NULL)
}
