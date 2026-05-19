# figaro R package

**R integration for the [Figaro](https://github.com/yuvalbloch/figaro-) interactive figure composer.**

Pass data frames, ggplot2 objects, base-R plots, or image files directly from your R session — the Figaro web UI opens in your browser with everything pre-loaded.

---

## Quick start

**1. Clone the repository** (the R package lives inside it):

```bash
git clone https://github.com/yuvalbloch/figaro-.git
```

**2. Install** — open R with `figaro-/` as your working directory, then run one command:

```r
source("install.R")
```

The script installs `devtools` if needed, finds the package automatically, and installs it. Afterwards use `library(figaro)` in any R session.

**3. Use it:**

```r
# Data frame — user builds charts interactively in the browser
figaro(iris = iris)

# ggplot2 object — opens as a fully editable chart
library(ggplot2)
p <- ggplot(iris, aes(Sepal.Length, Sepal.Width, color = Species)) +
  geom_point() + labs(title = "Iris")
figaro(scatter = p)

# Add a panel to the running session (browser updates in ~1 second)
p2 <- ggplot(iris, aes(Species)) + geom_bar()
fig <- figaro(scatter = p)
add_panel(fig, bar = p2)

# Stop the server when done
figaro_stop()
```

---

## Full guide

See [R_INTEGRATION.md](../R_INTEGRATION.md) in the main repository.
