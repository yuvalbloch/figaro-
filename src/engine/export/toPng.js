import Plotly from 'plotly.js-dist-min';
import { plotRegistry } from '@/engine/plotRegistry';
import { canvasSizePx, computePanelRects } from './geometry';
import { computeAutoLabels } from '@/lib/labels';

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src.slice(0, 60)}`));
    img.src = src;
  });
}

function drawLabel(ctx, text, rect, labeling) {
  const pad = 8;
  const { fontSize, bold, position } = labeling;
  ctx.save();
  ctx.font = `${bold ? 'bold ' : ''}${fontSize}px sans-serif`;
  ctx.fillStyle = '#000000';

  const isOutside = position.includes('outside');
  const isRight = position.includes('right');
  ctx.textBaseline = isOutside ? 'alphabetic' : 'top';
  ctx.textAlign = isRight ? 'right' : 'left';

  let lx, ly;
  if (position === 'top-left-inside')   { lx = rect.x + pad;         ly = rect.y + pad; }
  else if (position === 'top-right-inside')  { lx = rect.x + rect.w - pad; ly = rect.y + pad; }
  else if (position === 'top-left-outside')  { lx = rect.x;               ly = rect.y - 4; }
  else if (position === 'top-right-outside') { lx = rect.x + rect.w;      ly = rect.y - 4; }
  else                                       { lx = rect.x + pad;         ly = rect.y + pad; }

  ctx.fillText(text, lx, ly);
  ctx.restore();
}

// scale: pixel multiplier (2 = 2× DPI, i.e. 192 ppi at 96 ppi logical).
export async function toPng(state, scale = 2) {
  const { canvas, layout, panels, labeling } = state;
  const { w: widthPx, h: heightPx } = canvasSizePx(canvas);

  const offscreen = document.createElement('canvas');
  offscreen.width = Math.round(widthPx * scale);
  offscreen.height = Math.round(heightPx * scale);
  const ctx = offscreen.getContext('2d');
  ctx.scale(scale, scale);

  ctx.fillStyle = canvas.backgroundColor;
  ctx.fillRect(0, 0, widthPx, heightPx);

  const rects = computePanelRects(layout, widthPx, heightPx);
  const autoLabels = computeAutoLabels(layout.regions, labeling.style);
  const loaded = state._loaded;

  for (const region of layout.regions) {
    const rect = rects[region.id];
    const panel = panels[region.id];
    if (!rect || !panel) continue;

    const { x, y, w, h } = rect;

    if (panel.type === 'plot' && panel.plotId) {
      const el = plotRegistry.get(panel.plotId);
      if (el) {
        try {
          // Request the plot at physical resolution; draw at logical size.
          const dataUrl = await Plotly.toImage(el, {
            format: 'png',
            width: Math.round(w * scale),
            height: Math.round(h * scale),
          });
          const img = await loadImage(dataUrl);
          ctx.drawImage(img, x, y, w, h);
        } catch { /* leave panel blank on failure */ }
      }
    } else if (panel.type === 'image' && panel.imageRef) {
      const imgLoaded = loaded[panel.imageRef];
      if (imgLoaded?.blobURL) {
        try {
          const img = await loadImage(imgLoaded.blobURL);
          ctx.drawImage(img, x, y, w, h);
        } catch { /* leave panel blank */ }
      }
    }

    if (labeling.enabled) {
      const text =
        panel.label?.auto === false && panel.label?.text
          ? panel.label.text
          : autoLabels[region.id];
      if (text) drawLabel(ctx, text, rect, labeling);
    }
  }

  return new Promise((resolve, reject) =>
    offscreen.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas export failed'))), 'image/png')
  );
}
