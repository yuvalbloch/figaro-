test_that("build_session with no inputs produces valid schema version", {
  sess <- build_session()
  expect_equal(sess$schemaVersion, "1.1.0")
})

test_that("build_session produces correct meta fields", {
  sess <- build_session(name = "Test Figure")
  expect_equal(sess$meta$name, "Test Figure")
  expect_true(!is.null(sess$meta$createdAt))
  expect_true(!is.null(sess$meta$modifiedAt))
})

test_that("all iris rows are present in fileData", {
  sess  <- build_session(list(iris = iris))
  ds_id <- names(sess$datasets)[1]
  expect_equal(length(sess$fileData[[ds_id]]$rows), nrow(iris))
})

test_that("column types are inferred correctly for iris", {
  sess  <- build_session(list(iris = iris))
  ds_id <- names(sess$datasets)[1]
  cols  <- sess$datasets[[ds_id]]$columns
  find_col <- function(name) Filter(function(c) c$name == name, cols)[[1]]

  sepal_col   <- find_col("Sepal.Length")
  species_col <- find_col("Species")
  expect_equal(sepal_col$type,   "number")
  expect_equal(species_col$type, "string")
})

test_that("layout has correct rows and cols for multiple inputs", {
  sess <- build_session(list(a = iris, b = iris))
  expect_equal(sess$layout$rows, 1L)
  expect_equal(sess$layout$cols, 2L)
  expect_length(sess$layout$regions, 2)
})

test_that("panels object contains an entry for each region", {
  sess    <- build_session(list(iris = iris))
  reg_ids <- vapply(sess$layout$regions, `[[`, character(1), "id")
  for (rid in reg_ids) {
    expect_true(!is.null(sess$panels[[rid]]),
                info = paste("panel missing for region", rid))
  }
})

test_that("figaro_save round-trips correctly", {
  sess <- build_session(list(iris = iris))
  tmp  <- tempfile(fileext = ".figaro.json")
  on.exit(unlink(tmp))
  figaro_save(sess, tmp)
  reloaded <- jsonlite::read_json(tmp, simplifyVector = FALSE)
  expect_equal(reloaded$schemaVersion, "1.1.0")
  expect_null(reloaded$fileData)  # should be stripped
})

test_that("build_loaded populates rows for dataset entries", {
  sess   <- build_session(list(iris = iris))
  loaded <- build_loaded(sess)
  ds_id  <- names(sess$datasets)[1]
  expect_true(!is.null(loaded[[ds_id]]))
  expect_equal(length(loaded[[ds_id]]$rows), nrow(iris))
  expect_null(loaded[[ds_id]]$blobURL)
})

# --- ggplot2 tests -----------------------------------------------------------

test_that("simple ggplot2 scatter is extracted as a native Figaro plot", {
  skip_if_not_installed("ggplot2")
  skip_if_not_installed("rlang")
  p <- ggplot2::ggplot(iris,
                       ggplot2::aes(Sepal.Length, Sepal.Width)) +
    ggplot2::geom_point()
  sess <- build_session(list(scatter = p))

  expect_length(sess$plots, 1)
  plt <- sess$plots[[1]]
  expect_equal(plt$type,        "scatter")
  expect_equal(plt$params$x,   "Sepal.Length")
  expect_equal(plt$params$y,   "Sepal.Width")

  panel_types <- vapply(sess$panels, `[[`, character(1), "type")
  expect_true("plot" %in% panel_types)
})

test_that("ggplot2 labels and font size transfer to Figaro plot", {
  skip_if_not_installed("ggplot2")
  skip_if_not_installed("rlang")
  p <- ggplot2::ggplot(iris,
                       ggplot2::aes(Sepal.Length, Sepal.Width)) +
    ggplot2::geom_point() +
    ggplot2::labs(title = "Iris scatter", x = "Sepal L", y = "Sepal W") +
    ggplot2::theme(text = ggplot2::element_text(size = 14))
  sess <- build_session(list(p = p))
  plt  <- sess$plots[[1]]
  expect_equal(plt$style$title,    "Iris scatter")
  expect_equal(plt$style$xLabel,   "Sepal L")
  expect_equal(plt$style$yLabel,   "Sepal W")
  expect_equal(plt$style$fontSize, 14L)
})

test_that("complex ggplot (multi-layer) falls back to image panel", {
  skip_if_not_installed("ggplot2")
  p <- ggplot2::ggplot(iris,
                       ggplot2::aes(Sepal.Length, Sepal.Width)) +
    ggplot2::geom_point() +
    ggplot2::geom_smooth()
  sess <- build_session(list(complex = p))

  expect_length(sess$imageRefs, 1)
  img_id <- names(sess$imageRefs)[1]
  expect_true(startsWith(sess$fileData[[img_id]]$dataUrl,
                          "data:image/png;base64,"))
})

test_that("mixed data frame + ggplot call yields one empty + one plot panel", {
  skip_if_not_installed("ggplot2")
  skip_if_not_installed("rlang")
  p <- ggplot2::ggplot(iris,
                       ggplot2::aes(Sepal.Length, Sepal.Width)) +
    ggplot2::geom_point()
  sess  <- build_session(list(data = iris, fig = p))
  types <- vapply(sess$panels, `[[`, character(1), "type")
  expect_true("empty" %in% types)
  expect_true("plot"  %in% types)
})

test_that("PNG file path produces an image panel with a data URL", {
  skip_if_not_installed("ggplot2")
  p <- ggplot2::ggplot(iris,
                       ggplot2::aes(Sepal.Length, Sepal.Width)) +
    ggplot2::geom_point()
  tmp_png <- tempfile(fileext = ".png")
  on.exit(unlink(tmp_png))
  ggplot2::ggsave(tmp_png, p, width = 5, height = 4)

  sess   <- build_session(list(fig = tmp_png))
  img_id <- names(sess$imageRefs)[1]
  expect_true(startsWith(sess$fileData[[img_id]]$dataUrl,
                          "data:image/png;base64,"))

  panel_types <- vapply(sess$panels, `[[`, character(1), "type")
  expect_true("image" %in% panel_types)
})
