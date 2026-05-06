import { baseLayout } from '../layout';
import { downsample, rowWarning, DEFAULT_LIMITS } from '../overflow';
import { commonStyleSchema } from '../commonStyle';
import { getPalette } from '@/themes/palettes';

export const scatterChart = {
  type: 'scatter',
  label: 'Scatter',
  schema: {
    data: [
      { key: 'x', kind: 'column', label: 'X', filter: 'number', required: true },
      { key: 'y', kind: 'column', label: 'Y', filter: 'number', required: true },
      { key: 'color', kind: 'column', label: 'Color by', optional: true },
      { key: 'size', kind: 'column', label: 'Size by', filter: 'number', optional: true },
    ],
    style: [
      { key: 'markerSize', kind: 'number', label: 'Marker size', min: 2, max: 30, step: 1 },
      { key: 'markerOpacity', kind: 'number', label: 'Opacity', min: 0.1, max: 1, step: 0.1 },
      ...commonStyleSchema,
    ],
  },
  defaults: { params: {}, style: { markerSize: 7, markerOpacity: 0.85, showLegend: true } },

  render(plot, rows, ctx) {
    const warnings = [];
    const { x, y, color, size } = plot.params;
    if (!x || !y) {
      return { data: [], layout: baseLayout(plot, ctx.theme), warnings: ['Pick X and Y columns'] };
    }
    const w = rowWarning(rows);
    if (w) warnings.push(w);

    const palette = getPalette(plot.style?.palette || 'tableau10', ctx.customPalette);
    const markerSize = Number(plot.style?.markerSize) || 7;
    const opacity = Number(plot.style?.markerOpacity) ?? 0.85;

    const groups = new Map();
    for (const r of rows) {
      const xv = Number(r[x]);
      const yv = Number(r[y]);
      if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;
      const g = color ? (r[color] ?? '∅') : '_';
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push({ x: xv, y: yv, s: size ? Number(r[size]) : null });
    }

    const data = [...groups.entries()].map(([g, points], i) => {
      const sampled = downsample(points, DEFAULT_LIMITS.scatterCap);
      if (sampled.sampled) warnings.push(`Downsampled "${g}" to ${sampled.values.length} points`);
      const ps = sampled.values;
      const sizes = size
        ? ps.map((p) => Math.max(4, Math.min(40, Math.sqrt(Math.abs(p.s || 0)) * 1.5 + 4)))
        : markerSize;
      return {
        type: 'scattergl',
        mode: 'markers',
        name: color ? String(g) : `${y} vs ${x}`,
        x: ps.map((p) => p.x),
        y: ps.map((p) => p.y),
        marker: {
          color: palette[i % palette.length],
          size: sizes,
          opacity,
          line: { width: 0 },
        },
      };
    });

    const layout = baseLayout(plot, ctx.theme);
    layout.xaxis.type = 'linear';
    layout.yaxis.type = 'linear';
    return { data, layout, warnings };
  },
};
