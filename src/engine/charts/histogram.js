import { baseLayout } from '../layout';
import { rowWarning } from '../overflow';
import { commonStyleSchema } from '../commonStyle';
import { getPalette } from '@/themes/palettes';

export const histogramChart = {
  type: 'histogram',
  label: 'Histogram',
  schema: {
    data: [
      { key: 'x', kind: 'column', label: 'Value', filter: 'number', required: true },
      { key: 'group', kind: 'column', label: 'Group by', optional: true },
    ],
    style: [
      { key: 'nbins', kind: 'number', label: 'Bins', min: 0, max: 200, step: 1, placeholder: 'auto' },
      { key: 'normalized', kind: 'bool', label: 'Normalize (density)' },
      ...commonStyleSchema,
    ],
  },
  defaults: { params: {}, style: { showLegend: true } },

  render(plot, rows, ctx) {
    const warnings = [];
    const x = plot.params.x;
    if (!x) return { data: [], layout: baseLayout(plot, ctx.theme), warnings: ['Pick a numeric column'] };
    const w = rowWarning(rows);
    if (w) warnings.push(w);

    const group = plot.params.group || null;
    const palette = getPalette(plot.style?.palette || 'tableau10', ctx.customPalette);
    const nbins = Number(plot.style?.nbins) || 0;
    const normalized = !!plot.style?.normalized;

    const buckets = new Map();
    for (const r of rows) {
      const v = Number(r[x]);
      if (!Number.isFinite(v)) continue;
      const g = group ? (r[group] ?? '∅') : '_';
      if (!buckets.has(g)) buckets.set(g, []);
      buckets.get(g).push(v);
    }

    const data = [...buckets.entries()].map(([g, values], i) => ({
      type: 'histogram',
      name: group ? String(g) : x,
      x: values,
      nbinsx: nbins || undefined,
      histnorm: normalized ? 'probability density' : '',
      opacity: buckets.size > 1 ? 0.6 : 1,
      marker: { color: palette[i % palette.length] },
    }));

    const layout = baseLayout(plot, ctx.theme);
    layout.barmode = buckets.size > 1 ? 'overlay' : undefined;
    layout.xaxis.type = 'linear';
    layout.yaxis.type = 'linear';
    return { data, layout, warnings };
  },
};
