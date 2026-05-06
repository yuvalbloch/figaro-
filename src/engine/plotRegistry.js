// Global registry mapping plotId → Plotly graph div.
// PlotEngine registers itself on mount and deregisters on unmount.
// Export functions use this to call Plotly.toImage() on live graph elements.

const registry = new Map();

export const plotRegistry = {
  set: (plotId, el) => registry.set(plotId, el),
  delete: (plotId) => registry.delete(plotId),
  get: (plotId) => registry.get(plotId),
};
