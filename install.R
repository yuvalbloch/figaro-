# Run this from the root of the cloned figaro- repository.
# It checks for devtools, installs it if missing, then installs the figaro package.

if (!requireNamespace("devtools", quietly = TRUE)) {
  message("devtools not found — installing from CRAN...")
  install.packages("devtools")
}

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

# Unload and remove any existing installation to avoid corrupt .rdb errors.
if ("figaro" %in% loadedNamespaces()) {
  try(unloadNamespace("figaro"), silent = TRUE)
}
if (requireNamespace("figaro", quietly = TRUE)) {
  message("Removing existing figaro installation...")
  remove.packages("figaro")
}

# Copy the latest web bundle into inst/www/ so the installed package serves
# up-to-date assets. dist-r/ is produced by `npm run build:r`.
dist_r <- file.path(getwd(), "dist-r")
inst_www <- file.path(pkg, "inst", "www")
if (dir.exists(dist_r)) {
  message("Copying dist-r/ → figaro-r/inst/www/ ...")
  if (dir.exists(inst_www)) unlink(inst_www, recursive = TRUE)
  dir.create(inst_www, recursive = TRUE, showWarnings = FALSE)
  file.copy(list.files(dist_r, full.names = TRUE), inst_www, recursive = TRUE)
} else {
  message("Note: dist-r/ not found — install will use existing inst/www/ assets.\n",
          "Run `npm run build:r` in the figaro- directory to build fresh assets.")
}

message("Installing figaro from ", pkg, " ...")
devtools::install(pkg, reload = FALSE)
message("\nDone! Load the package in any R session with:\n  library(figaro)")
