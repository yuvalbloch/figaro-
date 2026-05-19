# install.R — installs (or reinstalls) the figaro R package from source.
#
# Safe to re-run after pulling code changes. Handles the most common failures
# that confuse non-technical users:
#
#   * "lazy-load database ... is corrupt"
#   * "internal error -3 in R_decompress1"
#   * "package 'figaro' is in use and will not be installed"
#
# All three are caused by the same thing: the previously installed figaro
# package is still loaded in the current R session while we try to overwrite
# its files on disk. The only reliable fix is a fresh R session. When running
# in RStudio we restart automatically; otherwise we print clear instructions.

# ---- 0. Helpers --------------------------------------------------------------

is_rstudio <- function() {
  Sys.getenv("RSTUDIO") == "1" &&
    requireNamespace("rstudioapi", quietly = TRUE) &&
    rstudioapi::isAvailable()
}

say <- function(...) message("[figaro install] ", ...)

# ---- 1. Sanity-check working directory --------------------------------------

pkg <- file.path(getwd(), "figaro-r")

if (!dir.exists(pkg)) {
  stop(
    "figaro-r/ was not found in your current working directory.\n",
    "Make sure your working directory is the root of the cloned repository.\n",
    "Current directory: ", getwd(), "\n\n",
    "Tip: in RStudio use Session > Set Working Directory > To Source File Location,\n",
    "     or run setwd('path/to/figaro-') before sourcing this script."
  )
}

# ---- 2. If figaro is already loaded, restart R before reinstalling ----------
#
# Overwriting a loaded package's files on disk is what produces the
# corrupt-rdb errors. Detect this up front and either auto-restart (RStudio)
# or stop with clear instructions.

handle_loaded_figaro <- function() {
  if (!("figaro" %in% loadedNamespaces())) return(FALSE)
  # Try a graceful unload first - sometimes this alone is enough.
  unload_ok <- tryCatch({
    if (requireNamespace("pkgload", quietly = TRUE)) {
      pkgload::unload("figaro")
    } else {
      unloadNamespace("figaro")
    }
    TRUE
  }, error = function(e) FALSE)
  if (unload_ok && !("figaro" %in% loadedNamespaces())) return(FALSE)

  if (is_rstudio()) {
    say("figaro is loaded in this session - restarting R and continuing automatically...")
    script_path <- file.path(getwd(), "install.R")
    rstudioapi::restartSession(
      command = sprintf("setwd(%s); source(%s)",
                        deparse(getwd()), deparse(script_path))
    )
    # restartSession is async; signal caller to stop running the rest.
    return(TRUE)
  }
  stop(
    "figaro is currently loaded in this R session.\n",
    "Please restart R (a fresh, clean session) and then re-run:\n",
    "  setwd('", getwd(), "')\n",
    "  source('install.R')\n\n",
    "  - RStudio:         Session > Restart R   (Ctrl/Cmd+Shift+F10)\n",
    "  - R GUI / Rscript: quit() then start R again\n",
    "  - VSCode (R ext):  R: Restart R Session"
  )
}

if (!handle_loaded_figaro()) {

# ---- 3. devtools is required for install ------------------------------------

if (!requireNamespace("devtools", quietly = TRUE)) {
  say("devtools not found - installing from CRAN...")
  install.packages("devtools")
}

# ---- 4. Force-remove any prior installation (handles partial/corrupt state) -

remove_figaro <- function() {
  if (requireNamespace("figaro", quietly = TRUE)) {
    try(remove.packages("figaro"), silent = TRUE)
  }
  # Belt-and-braces: wipe the install directory if anything remains. This is
  # what rescues us from a half-written / corrupt previous install where the
  # .rdb is unreadable and remove.packages() itself may fail.
  for (lib in .libPaths()) {
    inst_dir <- file.path(lib, "figaro")
    if (dir.exists(inst_dir)) {
      try(unlink(inst_dir, recursive = TRUE, force = TRUE), silent = TRUE)
    }
  }
}

say("Removing any existing figaro installation...")
remove_figaro()

# ---- 5. Copy latest web bundle into inst/www/ -------------------------------

dist_r   <- file.path(getwd(), "dist-r")
inst_www <- file.path(pkg, "inst", "www")
if (dir.exists(dist_r)) {
  say("Copying dist-r/ -> figaro-r/inst/www/ ...")
  if (dir.exists(inst_www)) unlink(inst_www, recursive = TRUE)
  dir.create(inst_www, recursive = TRUE, showWarnings = FALSE)
  file.copy(list.files(dist_r, full.names = TRUE), inst_www, recursive = TRUE)
} else {
  say("Note: dist-r/ not found - install will use existing inst/www/ assets.\n",
      "      Run `npm run build:r` in the figaro- directory to refresh.")
}

# ---- 6. Install, catching corrupt-rdb errors with a friendly fallback -------

install_with_recovery <- function() {
  tryCatch(
    {
      devtools::install(pkg, reload = FALSE, quiet = FALSE)
    },
    error = function(e) {
      msg <- conditionMessage(e)
      if (grepl("lazy-load database|R_decompress1|in use and will not",
                msg, ignore.case = TRUE)) {
        say("Detected corrupt-package error during install. Cleaning and retrying once...")
        remove_figaro()
        devtools::install(pkg, reload = FALSE, quiet = FALSE)
      } else {
        stop(e)
      }
    }
  )
}

say("Installing figaro from ", pkg, " ...")
install_with_recovery()

say("Done! Load the package in any R session with:")
say("  library(figaro)")

}  # end of: if (!handle_loaded_figaro())
