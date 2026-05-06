import { barChart } from './charts/bar';
import { stackedBarChart } from './charts/stackedBar';
import { histogramChart } from './charts/histogram';
import { scatterChart } from './charts/scatter';
import { pieChart } from './charts/pie';
import { heatmapChart } from './charts/heatmap';

const CHARTS = {
  bar: barChart,
  stackedBar: stackedBarChart,
  histogram: histogramChart,
  scatter: scatterChart,
  pie: pieChart,
  heatmap: heatmapChart,
};

export function getChart(type) {
  return CHARTS[type] || null;
}

export function listCharts() {
  return Object.values(CHARTS).map((c) => ({ type: c.type, label: c.label }));
}
