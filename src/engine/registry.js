import { barChart } from './charts/bar';
import { stackedBarChart } from './charts/stackedBar';
import { histogramChart } from './charts/histogram';
import { scatterChart } from './charts/scatter';
import { pieChart } from './charts/pie';
import { heatmapChart } from './charts/heatmap';
import { networkChart } from './charts/network';
import { lineChart } from './charts/line';
import { boxplotChart } from './charts/boxplot';

const CHARTS = {
  bar: barChart,
  stackedBar: stackedBarChart,
  histogram: histogramChart,
  scatter: scatterChart,
  line: lineChart,
  boxplot: boxplotChart,
  pie: pieChart,
  heatmap: heatmapChart,
  network: networkChart,
};

export function getChart(type) {
  return CHARTS[type] || null;
}

export function listCharts() {
  return Object.values(CHARTS).map((c) => ({ type: c.type, label: c.label }));
}
