test_that("server starts and serves index.html with injected session", {
  skip_if_not_installed("httr")

  sess    <- build_session(list(iris = iris))
  loaded  <- build_loaded(sess)
  sess_clean <- sess
  sess_clean$fileData <- NULL
  sess_clean$.rPlots  <- NULL

  payload <- jsonlite::toJSON(
    list(session = sess_clean, loaded = loaded),
    auto_unbox = TRUE, null = "null"
  )

  srv <- start_server(payload, port = 17654L)
  on.exit(try(srv$server$stop(), silent = TRUE))

  resp <- httr::GET(paste0("http://localhost:", srv$port, "/"))
  expect_equal(httr::status_code(resp), 200L)
  body <- httr::content(resp, "text", encoding = "UTF-8")
  expect_true(grepl("__FIGARO_INITIAL_SESSION__", body, fixed = TRUE))
  expect_true(grepl("__FIGARO_R_SERVER__", body, fixed = TRUE))
})
