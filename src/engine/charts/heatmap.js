import { baseLayout } from '../layout';
import { commonStyleSchema } from '../commonStyle';

export const heatmapChart = {
  type: 'heatmap',
  label: 'Heatmap',
  schema: {
    data: [
      { key: 'x', kind: 'column', label: 'X (columns)', required: true },
      { key: 'y', kind: 'column', label: 'Y (rows)', required: true },
      { key: 'z', kind: 'column', label: 'Value (Z)', filter: 'number', required: true },
    ],
    style: [
      { key: 'colorscale', kind: 'select', label: 'Colorscale', options: [
        { value: 'Viridis', label: 'Viridis' },
        { value: 'Cividis', label: 'Cividis' },
        { value: 'Blues', label: 'Blues' },
        { value: 'Reds', label: 'Reds' },
        { value: 'RdBu', label: 'Red-Blue' },
        { value: 'YlOrRd', label: 'Yellow-Orange-Red' },
        { value: 'Greys', label: 'Greys' },
      ] },
      { key: 'showValues', kind: 'bool', label: 'Show values' },
      ...commonStyleSchema.filter((f) => f.key !== 'palette'),
    ],
  },
  defaults: { params: {}, style: { colorscale: 'Viridis', showLegend: false } },

  render(plot, rows, ctx) {
    const warnings = [];
    const { x, y, z } = plot.params;
    if (!x || !y || !z) {
      return { data: [], layout: baseLayout(plot, ctx.theme), warnings: ['Pick X, Y, and Z columns'] };
    }
    const xs = [];
    const ys = [];
    const xSet = new Set();
    const ySet = new Set();
    const sums = new Map();
    const counts = new Map();
    for (const r of rows) {
      const xv = r[x];
      const yv = r[y];
      const zv = Number(r[z]);
      if (xv === null || xv === undefined || yv === null || yv === undefined || !Number.isFinite(zv)) continue;
      const key = `${xv}${yv}`;
      sums.set(key, (sums.get(key) || 0) + zv);
      counts.set(key, (counts.get(key) || 0) + 1);
      if (!xSet.has(xv)) { xSet.add(xv); xs.push(xv); }
      if (!ySet.has(yv)) { ySet.add(yv); ys.push(yv); }
    }
    const matrix = ys.map((yv) =>
      xs.map((xv) => {
        const k = `${xv}${yv}`;
        const s = sums.get(k);
        const c = counts.get(k);
        return c ? s / c : null;
      })
    );

    const data = [
      {
        type: 'heatmap',
        x: xs.map(String),
        y: ys.map(String),
        z: matrix,
        colorscale: plot.style?.colorscale || 'Viridis',
        showscale: true,
      },
    ];
    if (plot.style?.showValues) {
      data[0].text = matrix.map((row) =>
        row.map((v) => (v == null ? '' : Number(v).toFixed(2)))
      );
      data[0].texttemplate = '%{text}';
    }
    const layout = baseLayout(plot, ctx.theme);
    layout.xaxis.type = 'category';
    layout.yaxis.type = 'category';
    return { data, layout, warnings };
  },
};
