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

message("Installing figaro from ", pkg, " ...")
devtools::install(pkg)
message("\nDone! Load the package in any R session with:\n  library(figaro)")
