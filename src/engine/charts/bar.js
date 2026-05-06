import { baseLayout } from '../layout';
import { capCategories, rowWarning } from '../overflow';
import { commonStyleSchema } from '../commonStyle';
import { getPalette } from '@/themes/palettes';

export const barChart = {
  type: 'bar',
  label: 'Bar',
  schema: {
    data: [
      { key: 'x', kind: 'column', label: 'Category (X)', required: true },
      { key: 'y', kind: 'column', label: 'Value (Y)', filter: 'number', required: true },
      { key: 'group', kind: 'column', label: 'Group by', optional: true },
    ],
    style: [
      { key: 'orientation', kind: 'select', label: 'Orientation', options: [
        { value: 'v', label: 'Vertical' },
        { value: 'h', label: 'Horizontal' },
      ] },
      ...commonStyleSchema,
    ],
  },
  defaults: { params: { orientation: 'v' }, style: { showLegend: true } },

  render(plot, rows, ctx) {
    const warnings = [];
    const x = plot.params.x;
    const y = plot.params.y;
    const group = plot.params.group || null;
    if (!x || !y) {
      return { data: [], layout: baseLayout(plot, ctx.theme), warnings: ['Pick X and Y columns'] };
    }
    const w = rowWarning(rows);
    if (w) warnings.push(w);

    const cats = capCategories(rows, x, y);
    if (cats.grouped) warnings.push(`Showing top ${cats.kept.length} of ${cats.kept.length + cats.dropped} categories`);

    const allowed = new Set(cats.kept);
    const groupMap = new Map();
    for (const r of rows) {
      const xv = r[x];
      if (!allowed.has(xv)) continue;
      const yv = Number(r[y]);
      if (!Number.isFinite(yv)) continue;
      const gv = group ? (r[group] ?? '∅') : '_';
      if (!groupMap.has(gv)) groupMap.set(gv, new Map());
      const inner = groupMap.get(gv);
      inner.set(xv, (inner.get(xv) || 0) + yv);
    }

    const palette = getPalette(plot.style?.palette || ctx.canvas?.palette || 'tableau10', ctx.customPalette);
    const orientation = plot.params.orientation === 'h' ? 'h' : 'v';
    const groups = [...groupMap.keys()];
    const data = groups.map((g, i) => {
      const inner = groupMap.get(g);
      const xs = cats.kept.map((k) => k);
      const ys = cats.kept.map((k) => inner.get(k) ?? 0);
      const trace = {
        type: 'bar',
        name: group ? String(g) : (plot.style?.yLabel || y),
        marker: { color: palette[i % palette.length] },
        orientation,
      };
      if (orientation === 'h') {
        trace.x = ys;
        trace.y = xs;
      } else {
        trace.x = xs;
        trace.y = ys;
      }
      return trace;
    });

    const layout = baseLayout(plot, ctx.theme, {
      barmode: groups.length > 1 ? 'group' : undefined,
    });
    layout.barmode = groups.length > 1 ? 'group' : undefined;
    if (orientation === 'h') {
      layout.xaxis.type = 'linear';
      layout.yaxis.type = 'category';
    } else {
      layout.xaxis.type = 'category';
      layout.yaxis.type = 'linear';
    }
    return { data, layout, warnings };
  },
};
