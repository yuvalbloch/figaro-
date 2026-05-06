import { SCHEMA_VERSION } from '@/persistence/schema';

export function exportSession(state) {
  const session = {
    schemaVersion: SCHEMA_VERSION,
    meta: { ...state.meta, modifiedAt: new Date().toISOString() },
    canvas: state.canvas,
    layout: state.layout,
    panels: state.panels,
    plots: state.plots,
    datasets: state.datasets,
    imageRefs: state.imageRefs,
    theme: state.theme,
    labeling: state.labeling,
    customPalette: state.customPalette,
  };

  const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (state.meta.name || 'figaro').replace(/[^a-z0-9_-]/gi, '_');
  a.download = `${safeName}.figaro.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
