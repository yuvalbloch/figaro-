import { baseLayout } from '../layout';
import { rowWarning } from '../overflow';
import { commonStyleSchema } from '../commonStyle';
import { getPalette } from '@/themes/palettes';

export const boxplotChart = {
  type: 'boxplot',
  label: 'Box Plot',
  schema: {
    data: [
      { key: 'y', kind: 'column', label: 'Values (Y)', filter: 'number', required: true },
      { key: 'group', kind: 'column', label: 'Group by (X)', optional: true },
    ],
    style: [
      {
        key: 'boxpoints',
        kind: 'select',
        label: 'Show points',
        options: [
          { value: 'none', label: 'None' },
          { value: 'outliers', label: 'Outliers only' },
          { value: 'all', label: 'All points' },
        ],
      },
      { key: 'notched', kind: 'bool', label: 'Notched boxes' },
      {
        key: 'orientation',
        kind: 'select',
        label: 'Orientation',
        options: [
          { value: 'v', label: 'Vertical' },
          { value: 'h', label: 'Horizontal' },
        ],
      },
      ...commonStyleSchema,
    ],
  },
  defaults: {
    params: {},
    style: { boxpoints: 'outliers', notched: false, orientation: 'v', showLegend: true },
  },

  render(plot, rows, ctx) {
    const warnings = [];
    const { y, group } = plot.params;
    if (!y) {
      return { data: [], layout: baseLayout(plot, ctx.theme), warnings: ['Pick a Y column'] };
    }
    const w = rowWarning(rows);
    if (w) warnings.push(w);

    const palette = getPalette(plot.style?.palette || 'tableau10', ctx.customPalette);
    const boxpoints = plot.style?.boxpoints ?? 'outliers';
    const notched = !!plot.style?.notched;
    const orientation = plot.style?.orientation === 'h' ? 'h' : 'v';

    const groups = new Map();
    for (const r of rows) {
      const yv = Number(r[y]);
      if (!Number.isFinite(yv)) continue;
      const gv = group ? (r[group] ?? '∅') : '_';
      if (!groups.has(gv)) groups.set(gv, []);
      groups.get(gv).push(yv);
    }

    const data = [...groups.entries()].map(([g, vals], i) => {
      const color = palette[i % palette.length];
      const trace = {
        type: 'box',
        name: group ? String(g) : (plot.style?.yLabel || y),
        boxpoints: boxpoints === 'none' ? false : boxpoints,
        notched,
        orientation,
        marker: { color },
        line: { color },
      };
      if (orientation === 'h') {
        trace.x = vals;
      } else {
        trace.y = vals;
      }
      return trace;
    });

    const layout = baseLayout(plot, ctx.theme);
    if (orientation === 'h') {
      layout.xaxis.type = 'linear';
    } else {
      layout.yaxis.type = 'linear';
    }
    return { data, layout, warnings };
  },
};
