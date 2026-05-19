import { getChart } from '@/engine/registry';
import { canvasSizePx, computePanelRects } from './geometry';
import { computeAutoLabels } from '@/lib/labels';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function blobToDataUrl(blobUrl) {
  const res = await fetch(blobUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function labelCss(labeling) {
  const pad = 8;
  const pos = labeling.position;
  let placement = '';
  if (pos === 'top-left-inside')   placement = `top:${pad}px;left:${pad}px;`;
  else if (pos === 'top-right-inside')  placement = `top:${pad}px;right:${pad}px;`;
  else if (pos === 'top-left-outside')  placement = `top:-${labeling.fontSize + 4}px;left:0;`;
  else if (pos === 'top-right-outside') placement = `top:-${labeling.fontSize + 4}px;right:0;`;
  return `position:absolute;${placement}font-size:${labeling.fontSize}px;font-weight:${labeling.bold ? 'bold' : 'normal'};z-index:10;pointer-events:none;`;
}

export async function toHtml(state) {
  const { canvas, layout, panels, plots, imageRefs, meta, theme, customPalette, labeling } = state;
  const loaded = state._loaded;
  const { w: widthPx, h: heightPx } = canvasSizePx(canvas);
  const rects = computePanelRects(layout, widthPx, heightPx);
  const autoLabels = computeAutoLabels(layout.regions, labeling.style);

  // Pre-render each plot to Plotly trace/layout objects.
  const plotData = {};
  for (const region of layout.regions) {
    const panel = panels[region.id];
    if (panel?.type === 'plot' && panel.plotId) {
      const plot = plots[panel.plotId];
      const rows = plot?.datasetId ? loaded[plot.datasetId]?.rows : null;
      if (plot && rows?.length) {
        const chart = getChart(plot.type);
        const resolvedTheme = theme.name === 'custom' ? { ...theme, ...state.customThemeData } : theme;
        if (chart) plotData[region.id] = chart.render(plot, rows, { theme: resolvedTheme, customPalette });
      }
    }
  }

  let panelsHtml = '';
  let plotInits = '';

  for (const region of layout.regions) {
    const rect = rects[region.id];
    const panel = panels[region.id];
    if (!rect || !panel) continue;

    const { x, y, w, h } = rect;
    const labelText = labeling.enabled
      ? panel.label?.auto === false && panel.label?.text
        ? panel.label.text
        : autoLabels[region.id]
      : null;

    const labelHtml = labelText
      ? `<span style="${labelCss(labeling)}">${esc(labelText)}</span>`
      : '';

    let innerHtml = '';

    if (panel.type === 'plot' && panel.plotId && plotData[region.id]) {
      innerHtml = `<div id="p_${region.id}" style="width:100%;height:100%;"></div>`;
      const { data, layout: pLayout } = plotData[region.id];
      plotInits += `Plotly.newPlot('p_${region.id}',${JSON.stringify(data)},${JSON.stringify(pLayout)},{responsive:false,displayModeBar:false});\n`;
    } else if (panel.type === 'image' && panel.imageRef) {
      const imgLoaded = loaded[panel.imageRef];
      if (imgLoaded?.blobURL) {
        try {
          const dataUrl = await blobToDataUrl(imgLoaded.blobURL);
          innerHtml = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:contain;display:block;" alt="${esc(imageRefs[panel.imageRef]?.name || '')}">`;
        } catch {
          innerHtml = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#888;font:13px sans-serif;">${esc(imageRefs[panel.imageRef]?.name || 'Image')}</div>`;
        }
      }
    }

    panelsHtml += `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:white;overflow:hidden;">${labelHtml}${innerHtml}</div>\n`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(meta.name)}</title>
<script src="https://cdn.plot.ly/plotly-2.35.2.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#e5e7eb;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem}
</style>
</head>
<body>
<div style="position:relative;width:${widthPx}px;height:${heightPx}px;background:${esc(canvas.backgroundColor)};box-shadow:0 4px 24px rgba(0,0,0,0.18);">
${panelsHtml}</div>
<script>
${plotInits}<\/script>
</body>
</html>`;
}
