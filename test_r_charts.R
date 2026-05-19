library(figaro)
library(ggplot2)

# ── 1. Scatter  (geom_point → scatter) ───────────────────────────────────────
p_scatter <- ggplot(iris, aes(x = Sepal.Length, y = Sepal.Width, colour = Species)) +
  geom_point() +
  ggtitle("Scatter – iris sepal dimensions")

# ── 2. Bar  (geom_col → bar) ─────────────────────────────────────────────────
species_means <- aggregate(Sepal.Length ~ Species, data = iris, FUN = mean)
p_bar <- ggplot(species_means, aes(x = Species, y = Sepal.Length)) +
  geom_col() +
  ggtitle("Bar – mean sepal length by species")

# ── 3. Histogram  (geom_histogram → histogram) ───────────────────────────────
p_hist <- ggplot(iris, aes(x = Petal.Length)) +
  geom_histogram(bins = 20) +
  ggtitle("Histogram – petal length distribution")

# ── 4. Line  (geom_line → line)  ← newly supported ──────────────────────────
economics_sub <- economics[economics$date >= as.Date("2000-01-01"), ]
p_line <- ggplot(economics_sub, aes(x = as.numeric(date), y = unemploy)) +
  geom_line() +
  ggtitle("Line – US unemployment over time")

# ── 5. Boxplot  (geom_boxplot → boxplot)  ← newly supported ─────────────────
p_box <- ggplot(iris, aes(x = Species, y = Petal.Length, fill = Species)) +
  geom_boxplot() +
  ggtitle("Box Plot – petal length by species")

# ── 6. Heatmap  (geom_tile → heatmap)  ← newly supported ────────────────────
# Build a small correlation-style tile grid from mtcars
vars <- c("mpg", "cyl", "hp", "wt")
cor_mat <- as.data.frame(as.table(cor(mtcars[, vars])))
names(cor_mat) <- c("x", "y", "value")
p_heat <- ggplot(cor_mat, aes(x = x, y = y, fill = value)) +
  geom_tile() +
  ggtitle("Heatmap – mtcars correlation matrix")

# ── 7. Unsupported geom → image fallback ─────────────────────────────────────
# geom_violin is not in Figaro's registry; should appear as a static image
p_violin <- ggplot(iris, aes(x = Species, y = Sepal.Width, fill = Species)) +
  geom_violin() +
  ggtitle("Violin (image fallback – not editable)")

# ── Launch ────────────────────────────────────────────────────────────────────
fig <- figaro(
  scatter  = p_scatter,
  bar      = p_bar,
  hist     = p_hist,
  line     = p_line,
  boxplot  = p_box,
  heatmap  = p_heat,
  violin   = p_violin,
  layout   = "2x4"
)
