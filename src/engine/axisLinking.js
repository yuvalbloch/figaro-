// Compute shared axis ranges for plots whose panels share a row (X) or
// column (Y). A plot opts in via plot.shareXWithRow / plot.shareYWithCol.

function plotIsLinked(plot, axis) {
  return axis === 'x' ? !!plot?.shareXWithRow : !!plot?.shareYWithCol;
}

function regionForPanel(layout, panelId) {
  return layout.regions.find((r) => r.id === panelId);
}

function regionsOverlapAxis(a, b, axis) {
  if (axis === 'x') return !(a.rowEnd <= b.rowStart || a.rowStart >= b.rowEnd);
  return !(a.colEnd <= b.colStart || a.colStart >= b.colEnd);
}

function numericRange(rows, key) {
  let min = Infinity;
  let max = -Infinity;
  for (const r of rows) {
    const v = Number(r?.[key]);
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (min === Infinity) return null;
  if (min === max) {
    const pad = Math.abs(min) * 0.05 || 1;
    return [min - pad, max + pad];
  }
  const pad = (max - min) * 0.05;
  return [min - pad, max + pad];
}

function plotAxisColumn(plot, axis) {
  if (!plot) return null;
  if (axis === 'x') return plot.params?.x || null;
  return plot.params?.y || null;
}

export function computeSharedRange(currentPanelId, axis, state) {
  const { layout, panels, plots, _loaded } = state;
  const region = regionForPanel(layout, currentPanelId);
  if (!region) return null;
  const myPanel = panels[currentPanelId];
  const myPlot = myPanel?.plotId ? plots[myPanel.plotId] : null;
  if (!plotIsLinked(myPlot, axis)) return null;

  const sources = [];
  for (const r of layout.regions) {
    const p = panels[r.id];
    if (!p || p.type !== 'plot' || !p.plotId) continue;
    const plot = plots[p.plotId];
    if (!plotIsLinked(plot, axis)) continue;
    if (r.id !== currentPanelId && !regionsOverlapAxis(region, r, axis)) continue;
    const key = plotAxisColumn(plot, axis);
    const rows = plot.datasetId ? _loaded[plot.datasetId]?.rows : null;
    if (!key || !rows) continue;
    sources.push({ rows, key });
  }
  if (!sources.length) return null;

  let min = Infinity;
  let max = -Infinity;
  for (const s of sources) {
    const r = numericRange(s.rows, s.key);
    if (!r) continue;
    if (r[0] < min) min = r[0];
    if (r[1] > max) max = r[1];
  }
  if (min === Infinity) return null;
  return [min, max];
}
