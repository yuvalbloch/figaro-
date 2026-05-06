// Session schema constants + a permissive structural validator.
// Reject session JSON that doesn't satisfy validateSession(); on success the
// caller still needs to relocate dataset/image files (see LocateFilesDialog).

export const SCHEMA_VERSION = '1.0.0';

export const CANVAS_PRESETS = {
  A4_portrait: { width: 210, height: 297, units: 'mm' },
  A4_landscape: { width: 297, height: 210, units: 'mm' },
  letter_portrait: { width: 8.5, height: 11, units: 'in' },
  letter_landscape: { width: 11, height: 8.5, units: 'in' },
  poster_A0: { width: 841, height: 1189, units: 'mm' },
  slide_16_9: { width: 1920, height: 1080, units: 'px' },
  slide_4_3: { width: 1024, height: 768, units: 'px' },
};

export const CANVAS_PRESET_LABELS = {
  A4_portrait: 'A4 portrait',
  A4_landscape: 'A4 landscape',
  letter_portrait: 'Letter portrait',
  letter_landscape: 'Letter landscape',
  poster_A0: 'A0 poster',
  slide_16_9: 'Slide 16:9',
  slide_4_3: 'Slide 4:3',
  custom: 'Custom',
};

export const CHART_TYPES = [
  'bar',
  'stackedBar',
  'histogram',
  'heatmap',
  'pie',
  'scatter',
  'network',
];

export const PALETTES = ['viridis', 'set2', 'tableau10', 'grayscale', 'custom'];

export const THEMES = ['lightMinimal', 'darkMinimal', 'publication'];

export const FONTS = ['Inter', 'Roboto', 'Source Sans 3', 'Lato', 'Merriweather', 'IBM Plex Mono'];

export const LABEL_STYLES = ['A', 'a', '1', '(A)', '(a)', '(1)'];
export const LABEL_POSITIONS = [
  'top-left-inside',
  'top-right-inside',
  'top-left-outside',
  'top-right-outside',
];

export function validateSession(session) {
  const errors = [];
  if (!session || typeof session !== 'object') {
    return { ok: false, errors: ['Session must be an object'] };
  }

  if (session.schemaVersion !== SCHEMA_VERSION) {
    errors.push(
      `Expected schemaVersion ${SCHEMA_VERSION}, got ${JSON.stringify(session.schemaVersion)}`
    );
  }

  for (const key of [
    'meta',
    'canvas',
    'layout',
    'panels',
    'plots',
    'datasets',
    'imageRefs',
    'theme',
    'labeling',
  ]) {
    if (!(key in session)) errors.push(`Missing required key: ${key}`);
  }

  if (errors.length === 0) {
    const regions = session.layout?.regions || [];
    for (const r of regions) {
      if (!session.panels[r.id]) {
        errors.push(`Region ${r.id} has no entry in panels`);
      }
    }
    for (const [pid, plot] of Object.entries(session.plots || {})) {
      if (plot.datasetId && !session.datasets[plot.datasetId]) {
        errors.push(`Plot ${pid} references missing dataset ${plot.datasetId}`);
      }
      if (plot.edgesDatasetId && !session.datasets[plot.edgesDatasetId]) {
        errors.push(`Plot ${pid} references missing edges dataset ${plot.edgesDatasetId}`);
      }
    }
    for (const [rid, panel] of Object.entries(session.panels || {})) {
      if (panel.type === 'plot' && panel.plotId && !session.plots[panel.plotId]) {
        errors.push(`Panel ${rid} references missing plot ${panel.plotId}`);
      }
      if (panel.type === 'image' && panel.imageRef && !session.imageRefs[panel.imageRef]) {
        errors.push(`Panel ${rid} references missing image ${panel.imageRef}`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
