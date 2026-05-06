// Plotly layout/config builders shared by every chart renderer.

import { getTheme } from '@/themes/themes';

export function baseLayout(plot, theme, ctx = {}) {
  const t = getTheme(theme.name);
  const fontFamily = plot.style?.fontFamily || theme.globalFontFamily || t.fontFamily;
  const fontSize = plot.style?.fontSize || theme.baseFontSize || t.baseFontSize;
  const showLegend = plot.style?.showLegend !== false;

  return {
    margin: { l: 48, r: 16, t: plot.style?.title ? 32 : 12, b: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: fontFamily, size: fontSize, color: t.text },
    title: plot.style?.title
      ? {
          text: plot.style.title,
          font: { family: fontFamily, size: fontSize + 2, color: t.text },
          x: 0.0,
          xanchor: 'left',
        }
      : undefined,
    xaxis: {
      title: plot.style?.xLabel ? { text: plot.style.xLabel } : undefined,
      gridcolor: t.gridline,
      zerolinecolor: t.axisLine,
      linecolor: t.axisLine,
      showgrid: plot.style?.showGrid ?? t.showGridDefault,
      automargin: true,
      ...(ctx.xaxis || {}),
    },
    yaxis: {
      title: plot.style?.yLabel ? { text: plot.style.yLabel } : undefined,
      gridcolor: t.gridline,
      zerolinecolor: t.axisLine,
      linecolor: t.axisLine,
      showgrid: plot.style?.showGrid ?? t.showGridDefault,
      automargin: true,
      ...(ctx.yaxis || {}),
    },
    showlegend: showLegend,
    legend: { font: { family: fontFamily, size: fontSize - 1, color: t.text } },
    hovermode: 'closest',
  };
}

export const baseConfig = {
  responsive: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
};
