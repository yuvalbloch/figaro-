import { baseLayout } from '../layout';
import { capCategories } from '../overflow';
import { commonStyleSchema } from '../commonStyle';
import { getPalette } from '@/themes/palettes';

export const pieChart = {
  type: 'pie',
  label: 'Pie',
  schema: {
    data: [
      { key: 'category', kind: 'column', label: 'Category', required: true },
      { key: 'value', kind: 'column', label: 'Value', filter: 'number', optional: true, hint: 'Leave empty to count rows' },
    ],
    style: [
      { key: 'donut', kind: 'bool', label: 'Donut hole' },
      ...commonStyleSchema.filter((f) => !['xLabel', 'yLabel', 'showGrid'].includes(f.key)),
    ],
  },
  defaults: { params: {}, style: { showLegend: true } },

  render(plot, rows, ctx) {
    const warnings = [];
    const cat = plot.params.category;
    const val = plot.params.value || null;
    if (!cat) return { data: [], layout: baseLayout(plot, ctx.theme), warnings: ['Pick a category column'] };

    const cats = capCategories(rows, cat, val);
    if (cats.grouped) warnings.push(`Showing top ${cats.kept.length} of ${cats.kept.length + cats.dropped} slices`);

    const allowed = new Set(cats.kept);
    const sums = new Map();
    let other = 0;
    for (const r of rows) {
      const c = r[cat];
      const v = val ? Number(r[val]) || 0 : 1;
      if (allowed.has(c)) sums.set(c, (sums.get(c) || 0) + v);
      else if (c !== null && c !== undefined && c !== '') other += v;
    }
    const labels = cats.kept.map(String);
    const values = cats.kept.map((k) => sums.get(k) || 0);
    if (other > 0) {
      labels.push('Other');
      values.push(other);
    }

    const palette = getPalette(plot.style?.palette || 'tableau10', ctx.customPalette);
    const data = [
      {
        type: 'pie',
        labels,
        values,
        hole: plot.style?.donut ? 0.45 : 0,
        marker: { colors: labels.map((_, i) => palette[i % palette.length]) },
        textinfo: 'label+percent',
        sort: false,
      },
    ];
    const layout = baseLayout(plot, ctx.theme);
    delete layout.xaxis;
    delete layout.yaxis;
    return { data, layout, warnings };
  },
};
