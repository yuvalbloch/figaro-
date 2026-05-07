import Plotly from 'plotly.js-dist-min';
import { plotRegistry } from '@/engine/plotRegistry';
import { canvasSizePx, computePanelRects } from './geometry';
import { computeAutoLabels } from '@/lib/labels';

async function blobUrlToDataUrl(blobUrl) {
  const res = await fetch(blobUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function labelSvgAttrs(rect, position, fontSize) {
  const pad = 8;
  switch (position) {
    case 'top-right-inside':
      return { x: rect.x + rect.w - pad, y: rect.y + pad, anchor: 'end', baseline: 'hanging' };
    case 'top-left-outside':
      return { x: rect.x, y: rect.y - 4, anchor: 'start', baseline: 'auto' };
    case 'top-right-outside':
      return { x: rect.x + rect.w, y: rect.y - 4, anchor: 'end', baseline: 'auto' };
    default: // top-left-inside
      return { x: rect.x + pad, y: rect.y + pad, anchor: 'start', baseline: 'hanging' };
  }
}

function escXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// plotFormat: 'png' for Inkscape/PDF-compatible raster embed, 'svg' for browser-only vector embed.
export async function toSvg(state, { plotFormat = 'png' } = {}) {
  const { canvas, layout, panels, imageRefs, labeling } = state;
  const { w: widthPx, h: heightPx } = canvasSizePx(canvas);
  const rects = computePanelRects(layout, widthPx, heightPx);
  const autoLabels = computeAutoLabels(layout.regions, labeling.style);
  const loaded = state._loaded;

  const parts = [];
  parts.push(
    `<rect width="${widthPx}" height="${heightPx}" fill="${escXml(canvas.backgroundColor)}"/>`
  );

  for (const region of layout.regions) {
    const rect = rects[region.id];
    const panel = panels[region.id];
    if (!rect || !panel) continue;

    const { x, y, w, h } = rect;

    if (panel.type === 'plot' && panel.plotId) {
      const el = plotRegistry.get(panel.plotId);
      if (el) {
        try {
          const dataUrl = await Plotly.toImage(el, {
            format: plotFormat,
            width: Math.round(w),
            height: Math.round(h),
          });
          parts.push(
            `<image x="${x}" y="${y}" width="${w}" height="${h}" xlink:href="${dataUrl}" href="${dataUrl}" preserveAspectRatio="none"/>`
          );
        } catch {
          parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f0f0f0"/>`);
        }
      } else {
        parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white"/>`);
      }
    } else if (panel.type === 'image' && panel.imageRef) {
      const imgLoaded = loaded[panel.imageRef];
      if (imgLoaded?.blobURL) {
        try {
          const dataUrl = await blobUrlToDataUrl(imgLoaded.blobURL);
          parts.push(
            `<image x="${x}" y="${y}" width="${w}" height="${h}" xlink:href="${dataUrl}" href="${dataUrl}" preserveAspectRatio="xMidYMid meet"/>`
          );
        } catch {
          parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f0f0f0"/>`);
        }
      } else {
        parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f0f0f0"/>`);
      }
    } else {
      parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white"/>`);
    }

    // Auto-label overlay
    if (labeling.enabled) {
      const text =
        panel.label?.auto === false && panel.label?.text
          ? panel.label.text
          : autoLabels[region.id];
      if (text) {
        const lp = labelSvgAttrs(rect, labeling.position, labeling.fontSize);
        const weight = labeling.bold ? 'bold' : 'normal';
        parts.push(
          `<text x="${lp.x}" y="${lp.y}" font-size="${labeling.fontSize}" font-weight="${weight}" text-anchor="${lp.anchor}" dominant-baseline="${lp.baseline}" fill="black">${escXml(text)}</text>`
        );
      }
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`,
    `     width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}">`,
    ...parts,
    '</svg>',
  ].join('\n');
}
