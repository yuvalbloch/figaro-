source("install.R")
library(figaro)
figaro(iris = iris)
library(ggplot2)
p <- ggplot(iris, aes(Sepal.Length, Sepal.Width, color = Species)) +
  geom_point() +
  labs(title = "Iris scatter", x = "Sepal length (cm)", y = "Sepal width (cm)") +
  theme(text = element_text(size = 14))

figaro(scatter = p)


p2 <- ggplot(iris, aes(Sepal.Length, Sepal.Width, color = Species)) +
  geom_point() +
  labs(title = "Iris p2", x = "Sepal length (cm)", y = "Sepal width (cm)") +
  theme(text = element_text(size = 14))

p3 <- ggplot(iris, aes(Sepal.Length, Sepal.Width, color = Species)) +
  geom_point() +
  labs(title = "Iris p3", x = "Sepal length (cm)", y = "Sepal width (cm)") +
  theme(text = element_text(size = 14))

p_three <- figaro(p = p, p2 = p2, p3 = p3)

p4 <- ggplot(iris, aes(Sepal.Length, Sepal.Width, color = Species)) +
  geom_point() +
  labs(title = "Iris p3", x = "Sepal length (cm)", y = "Sepal width (cm)") +
  theme(text = element_text(size = 14))

add_panel(p_three, panel4 = p4)

