// Plotly layout/config builders shared by every chart renderer.

import { getTheme } from '@/themes/themes';

export function baseLayout(plot, theme, ctx = {}) {
  const t = getTheme(theme.name);
  const fontFamily = plot.style?.fontFamily || theme.globalFontFamily || t.fontFamily;
  const fontSize = plot.style?.fontSize || theme.baseFontSize || t.baseFontSize;

  // Per-element font sizes — fall back to scaled versions of the base fontSize
  const titleFontSize  = plot.style?.titleFontSize  ?? (fontSize + 2);
  const axisFontSize   = plot.style?.axisFontSize   ?? fontSize;
  const tickFontSize   = plot.style?.tickFontSize   ?? Math.max(8, fontSize - 1);
  const legendFontSize = plot.style?.legendFontSize ?? Math.max(8, fontSize - 1);

  const hasTitle      = !!plot.style?.title;
  const hasPlotBorder = !!plot.style?.plotBorder;
  const showLegend    = plot.style?.showLegend !== false;

  const xaxis = {
    title: plot.style?.xLabel
      ? { text: plot.style.xLabel, font: { family: fontFamily, size: axisFontSize, color: t.text } }
      : undefined,
    tickfont:  { family: fontFamily, size: tickFontSize,  color: t.text },
    gridcolor: t.gridline,
    zerolinecolor: t.axisLine,
    linecolor:     t.axisLine,
    showgrid:  plot.style?.showGrid ?? t.showGridDefault,
    automargin: true,
    ...(ctx.xaxis || {}),
    ...(hasPlotBorder && { mirror: true, showline: true }),
  };

  const yaxis = {
    title: plot.style?.yLabel
      ? { text: plot.style.yLabel, font: { family: fontFamily, size: axisFontSize, color: t.text } }
      : undefined,
    tickfont:  { family: fontFamily, size: tickFontSize,  color: t.text },
    gridcolor: t.gridline,
    zerolinecolor: t.axisLine,
    linecolor:     t.axisLine,
    showgrid:  plot.style?.showGrid ?? t.showGridDefault,
    automargin: true,
    ...(ctx.yaxis || {}),
    ...(hasPlotBorder && { mirror: true, showline: true }),
  };

  return {
    margin: { l: 48, r: 16, t: hasTitle ? Math.max(36, titleFontSize * 2.5) : 12, b: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor:  'rgba(0,0,0,0)',
    font: { family: fontFamily, size: fontSize, color: t.text },
    title: hasTitle
      ? {
          text: plot.style.title,
          font: { family: fontFamily, size: titleFontSize, color: t.text },
          x:       plot.style?.titleX ?? 0.0,
          xanchor: (plot.style?.titleX ?? 0) < 0.1 ? 'left' : 'center',
        }
      : undefined,
    xaxis,
    yaxis,
    showlegend: showLegend,
    legend: {
      font: { family: fontFamily, size: legendFontSize, color: t.text },
      ...(plot.style?.legendX != null && { x: plot.style.legendX }),
      ...(plot.style?.legendY != null && { y: plot.style.legendY }),
    },
    hovermode: 'closest',
  };
}

export const baseConfig = {
  responsive: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
};
