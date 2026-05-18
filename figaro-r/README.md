# figaro R package

**R integration for the [Figaro](https://github.com/yuvalbloch/figaro-) interactive figure composer.**

Pass data frames, ggplot2 objects, base-R plots, or image files directly from your R session — the Figaro web UI opens in your browser with everything pre-loaded.

---

## Quick start

```r
# Load the package from source (no CRAN install needed)
devtools::load_all("path/to/figaro-/figaro-r")

# Data frame — user builds charts interactively in the browser
figaro(iris = iris)

# ggplot2 object — opens as a fully editable chart
library(ggplot2)
p <- ggplot(iris, aes(Sepal.Length, Sepal.Width, color = Species)) +
  geom_point() + labs(title = "Iris")
figaro(scatter = p)

# Stop the server when done
figaro_stop()
```

---

## Full guide

See [R_INTEGRATION.md](../R_INTEGRATION.md) in the main repository.
