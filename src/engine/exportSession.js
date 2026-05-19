import { SCHEMA_VERSION } from '@/persistence/schema';

async function blobUrlToDataUrl(blobURL) {
  const blob = await fetch(blobURL).then((r) => r.blob());
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function exportSession(state) {
  const fileData = {};
  for (const [id, payload] of Object.entries(state._loaded || {})) {
    if (payload?.rows?.length) {
      fileData[id] = { type: 'dataset', rows: payload.rows };
    } else if (payload?.blobURL) {
      try {
        fileData[id] = { type: 'image', dataUrl: await blobUrlToDataUrl(payload.blobURL) };
      } catch {
        // blob URL revoked or unavailable — skip silently
      }
    }
  }

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
    customThemeData: state.customThemeData,
    ...(Object.keys(fileData).length > 0 && { fileData }),
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
