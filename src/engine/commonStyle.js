// Style fields shared by every chart type. Each chart's schema appends
// chart-specific fields after this base.

export const commonStyleSchema = [
  { key: 'title', kind: 'text', label: 'Title', placeholder: 'Untitled' },
  { key: 'xLabel', kind: 'text', label: 'X axis label' },
  { key: 'yLabel', kind: 'text', label: 'Y axis label' },
  { key: 'palette', kind: 'palette', label: 'Palette' },
  { key: 'fontFamily', kind: 'font', label: 'Font' },
  { key: 'fontSize', kind: 'number', label: 'Font size', min: 8, max: 24, step: 1 },
  { key: 'showGrid', kind: 'bool', label: 'Show gridlines' },
  { key: 'showLegend', kind: 'bool', label: 'Show legend' },
];
