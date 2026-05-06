export const plotsSlice = (set) => ({
  plots: {},
  setPlot: (plotId, plotConfig) =>
    set((s) => ({ plots: { ...s.plots, [plotId]: plotConfig } })),
  patchPlot: (plotId, patch) =>
    set((s) => ({
      plots: {
        ...s.plots,
        [plotId]: { ...(s.plots[plotId] || {}), ...patch },
      },
    })),
  removePlot: (plotId) =>
    set((s) => {
      const next = { ...s.plots };
      delete next[plotId];
      return { plots: next };
    }),
});
