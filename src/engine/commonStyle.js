// Style fields shared by every chart type. Each chart's schema appends
// chart-specific fields after this base.

export const commonStyleSchema = [
  // Labels & titles
  { key: 'title',         kind: 'text',   label: 'Title',            placeholder: 'Untitled' },
  { key: 'titleFontSize', kind: 'slider', label: 'Title font size',  min: 8,  max: 36, step: 1 },
  { key: 'titleX',        kind: 'slider', label: 'Title position',   min: 0,  max: 1,  step: 0.05 },
  { key: 'xLabel',        kind: 'text',   label: 'X axis label' },
  { key: 'yLabel',        kind: 'text',   label: 'Y axis label' },
  { key: 'axisFontSize',  kind: 'slider', label: 'Axis label size',  min: 7,  max: 28, step: 1 },
  { key: 'tickFontSize',  kind: 'slider', label: 'Tick label size',  min: 6,  max: 22, step: 1 },
  // Palette & font
  { key: 'palette',    kind: 'palette', label: 'Palette' },
  { key: 'fontFamily', kind: 'font',    label: 'Font style' },
  { key: 'fontSize',   kind: 'slider',  label: 'Base font size',    min: 8,  max: 24, step: 1 },
  // Legend
  { key: 'showLegend',    kind: 'bool',   label: 'Show legend' },
  { key: 'legendFontSize', kind: 'slider', label: 'Legend font size', min: 6,  max: 22, step: 1 },
  // Grid & frame
  { key: 'showGrid',   kind: 'bool', label: 'Show gridlines' },
  { key: 'plotBorder', kind: 'bool', label: 'Plot border' },
];
