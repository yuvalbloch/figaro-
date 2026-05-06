import { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import { getChart } from './registry';
import { baseConfig } from './layout';
import { computeSharedRange } from './axisLinking';
import { useStore } from '@/store';

export function PlotEngine({ regionId, plotId }) {
  const plot = useStore((s) => s.plots[plotId]);
  const dataset = useStore((s) => (plot?.datasetId ? s.datasets[plot.datasetId] : null));
  const rows = useStore((s) => (plot?.datasetId ? s._loaded[plot.datasetId]?.rows : null));
  const theme = useStore((s) => s.theme);
  const customPalette = useStore((s) => s.customPalette);
  const sharedX = useStore((s) =>
    plot?.shareXWithRow ? computeSharedRange(regionId, 'x', s) : null
  );
  const sharedY = useStore((s) =>
    plot?.shareYWithCol ? computeSharedRange(regionId, 'y', s) : null
  );

  const ref = useRef(null);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    if (!ref.current || !plot) return;
    const chart = getChart(plot.type);
    if (!chart) {
      setWarnings([`Unknown chart type: ${plot.type}`]);
      return;
    }
    if (!rows || !rows.length) {
      Plotly.purge(ref.current);
      setWarnings(dataset ? ['Dataset is empty'] : ['No dataset bound']);
      return;
    }

    const result = chart.render(plot, rows, { theme, customPalette });
    if (sharedX) result.layout.xaxis = { ...(result.layout.xaxis || {}), range: sharedX, autorange: false };
    if (sharedY) result.layout.yaxis = { ...(result.layout.yaxis || {}), range: sharedY, autorange: false };

    setWarnings(result.warnings || []);
    Plotly.react(ref.current, result.data, result.layout, baseConfig);
  }, [plot, dataset, rows, theme, customPalette, sharedX, sharedY]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      try { Plotly.Plots.resize(el); } catch { /* element not yet a Plotly graph */ }
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      try { Plotly.purge(el); } catch { /* noop */ }
    };
  }, []);

  return (
    <div className="h-full w-full relative">
      <div ref={ref} className="h-full w-full" />
      {warnings.length > 0 && (
        <div className="absolute bottom-1 left-1 right-1 text-[10px] leading-tight text-amber-700 bg-amber-50/90 border border-amber-200 rounded px-1.5 py-1 pointer-events-none">
          {warnings.slice(0, 3).map((w, i) => (
            <div key={i}>{w}</div>
          ))}
        </div>
      )}
    </div>
  );
}
