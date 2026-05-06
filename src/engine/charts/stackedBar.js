import { baseLayout } from '../layout';
import { capCategories, rowWarning } from '../overflow';
import { commonStyleSchema } from '../commonStyle';
import { getPalette } from '@/themes/palettes';

export const stackedBarChart = {
  type: 'stackedBar',
  label: 'Stacked Bar',
  schema: {
    data: [
      { key: 'x', kind: 'column', label: 'Category (X)', required: true },
      { key: 'y', kind: 'column', label: 'Value (Y)', filter: 'number', required: true },
      { key: 'group', kind: 'column', label: 'Stack by', optional: true },
    ],
    style: [
      {
        key: 'variant',
        kind: 'select',
        label: 'Variant',
        options: [
          { value: 'stacked', label: 'Stacked' },
          { value: 'normalized', label: 'Normalized (100%)' },
        ],
      },
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
  defaults: { params: {}, style: { variant: 'stacked', orientation: 'v', showLegend: true } },

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

    const normalized = (plot.style?.variant ?? 'stacked') === 'normalized';
    const orientation = plot.style?.orientation === 'h' ? 'h' : 'v';

    const cats = capCategories(rows, x, y);
    if (cats.grouped) {
      warnings.push(`Showing top ${cats.kept.length} of ${cats.kept.length + cats.dropped} categories`);
    }

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

    // Totals per category for 100% normalization
    const totals = new Map();
    if (normalized) {
      for (const xv of cats.kept) {
        let total = 0;
        for (const inner of groupMap.values()) total += inner.get(xv) ?? 0;
        totals.set(xv, total || 1);
      }
    }

    const palette = getPalette(plot.style?.palette || ctx.canvas?.palette || 'tableau10', ctx.customPalette);
    const groups = [...groupMap.keys()];
    const data = groups.map((g, i) => {
      const inner = groupMap.get(g);
      let ys = cats.kept.map((k) => inner.get(k) ?? 0);
      if (normalized) {
        ys = ys.map((v, idx) => (v / totals.get(cats.kept[idx])) * 100);
      }
      const trace = {
        type: 'bar',
        name: group ? String(g) : (plot.style?.yLabel || y),
        marker: { color: palette[i % palette.length] },
        orientation,
      };
      if (orientation === 'h') {
        trace.x = ys;
        trace.y = cats.kept;
      } else {
        trace.x = cats.kept;
        trace.y = ys;
      }
      return trace;
    });

    const layout = baseLayout(plot, ctx.theme);
    layout.barmode = 'stack';
    if (normalized) {
      const pctAxis = { ticksuffix: '%', range: [0, 100] };
      if (orientation === 'h') {
        layout.xaxis = { ...layout.xaxis, ...pctAxis };
        layout.yaxis = { ...layout.yaxis, type: 'category' };
      } else {
        layout.xaxis = { ...layout.xaxis, type: 'category' };
        layout.yaxis = { ...layout.yaxis, ...pctAxis };
      }
    } else {
      if (orientation === 'h') {
        layout.xaxis = { ...layout.xaxis, type: 'linear' };
        layout.yaxis = { ...layout.yaxis, type: 'category' };
      } else {
        layout.xaxis = { ...layout.xaxis, type: 'category' };
        layout.yaxis = { ...layout.yaxis, type: 'linear' };
      }
    }

    return { data, layout, warnings };
  },
};
