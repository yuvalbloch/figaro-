import { baseLayout } from '../layout';
import { rowWarning } from '../overflow';
import { commonStyleSchema } from '../commonStyle';
import { getPalette } from '@/themes/palettes';

export const lineChart = {
  type: 'line',
  label: 'Line',
  schema: {
    data: [
      { key: 'x', kind: 'column', label: 'X', required: true },
      { key: 'ys', kind: 'columns', label: 'Y columns', filter: 'number', required: true },
    ],
    style: [
      { key: 'lineWidth', kind: 'number', label: 'Line width', min: 0.5, max: 8, step: 0.5 },
      { key: 'markerSize', kind: 'number', label: 'Marker size', min: 0, max: 20, step: 1 },
      { key: 'showMarkers', kind: 'bool', label: 'Show markers' },
      ...commonStyleSchema,
    ],
  },
  defaults: { params: {}, style: { lineWidth: 2, markerSize: 5, showMarkers: true, showLegend: true } },

  render(plot, rows, ctx) {
    const warnings = [];
    const { x, ys } = plot.params;
    if (!x || !ys || ys.length === 0) {
      return { data: [], layout: baseLayout(plot, ctx.theme), warnings: ['Pick X and at least one Y column'] };
    }
    const w = rowWarning(rows);
    if (w) warnings.push(w);

    const palette = getPalette(plot.style?.palette || 'tableau10', ctx.customPalette);
    const lineWidth = Number(plot.style?.lineWidth) || 2;
    const markerSize = Number(plot.style?.markerSize) || 5;
    const showMarkers = plot.style?.showMarkers !== false;
    const mode = showMarkers ? 'lines+markers' : 'lines';

    const sorted = [...rows].sort((a, b) => Number(a[x]) - Number(b[x]));

    const data = ys.map((yCol, i) => {
      const xs = [];
      const yvals = [];
      for (const r of sorted) {
        const xv = Number(r[x]);
        const yv = Number(r[yCol]);
        if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;
        xs.push(xv);
        yvals.push(yv);
      }
      const color = palette[i % palette.length];
      return {
        type: 'scattergl',
        mode,
        name: yCol,
        x: xs,
        y: yvals,
        line: { color, width: lineWidth },
        marker: { color, size: markerSize },
      };
    });

    const layout = baseLayout(plot, ctx.theme);
    layout.xaxis.type = 'linear';
    layout.yaxis.type = 'linear';
    return { data, layout, warnings };
  },
};
