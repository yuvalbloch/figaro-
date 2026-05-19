import { useEffect, useMemo } from 'react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Field } from './fields';
import { getChart, listCharts } from '@/engine/registry';
import { Trash2, Check, Undo2, Shuffle } from 'lucide-react';

const CHART_TYPES = listCharts();

// Maps a clicked SVG element (controlKey) to the style field keys to highlight
const HIGHLIGHT_KEYS = {
  title:  ['title', 'titleFontSize', 'titleX'],
  xLabel: ['xLabel', 'axisFontSize'],
  yLabel: ['yLabel', 'axisFontSize'],
  legend: ['showLegend', 'legendFontSize'],
  ticks:  ['tickFontSize'],
};

function applyDefaults(plot, chart) {
  return {
    ...plot,
    params: { ...(chart.defaults?.params || {}), ...(plot.params || {}) },
    style:  { ...(chart.defaults?.style  || {}), ...(plot.style  || {}) },
  };
}

export function PlotInspector({ regionId, panel }) {
  const plot     = useStore((s) => s.plots[panel.plotId]);
  const dataset  = useStore((s) => (plot?.datasetId ? s.datasets[plot.datasetId] : null));
  const draft    = useStore((s) => s.ui.draft);
  const setDraft = useStore((s) => s.setDraft);
  const setPlot  = useStore((s) => s.setPlot);
  const patchPlot = useStore((s) => s.patchPlot);
  const removePlot = useStore((s) => s.removePlot);
  const setPanel = useStore((s) => s.setPanel);
  const highlightedControl = useStore((s) => s.ui.highlightedControl);

  const isDraft   = draft && draft.plotId === panel.plotId;
  const effective = useMemo(() => {
    if (!plot) return null;
    if (isDraft) return { ...plot, params: draft.params, style: draft.style };
    return plot;
  }, [plot, isDraft, draft]);

  const highlightedKeys = highlightedControl ? (HIGHLIGHT_KEYS[highlightedControl] || []) : [];

  // Scroll to first highlighted field when the highlighted control changes
  useEffect(() => {
    if (highlightedKeys.length === 0) return;
    const el = document.getElementById(`style-field-${highlightedKeys[0]}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [highlightedControl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Drop draft when switching panels
  useEffect(() => {
    return () => {
      if (useStore.getState().ui.draft?.plotId === panel.plotId) setDraft(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel.plotId]);

  if (!plot || !effective) return null;
  const chart = getChart(plot.type);
  if (!chart) {
    return (
      <div className="text-sm text-destructive">
        Unknown chart type: <code>{plot.type}</code>
      </div>
    );
  }

  const ensureDraft = () => {
    if (isDraft) return draft;
    const seed = { plotId: panel.plotId, params: { ...plot.params }, style: { ...plot.style } };
    setDraft(seed);
    return seed;
  };

  const updateParam = (key, value) => {
    const d = ensureDraft();
    setDraft({ ...d, params: { ...d.params, [key]: value } });
  };
  const updateStyle = (key, value) => {
    const d = ensureDraft();
    setDraft({ ...d, style: { ...d.style, [key]: value } });
  };

  const apply = () => {
    if (!isDraft) return;
    patchPlot(panel.plotId, { params: draft.params, style: draft.style });
    setDraft(null);
  };
  const reset = () => setDraft(null);

  const switchType = (newType) => {
    const next = getChart(newType);
    if (!next) return;
    setDraft(null);
    setPlot(panel.plotId, applyDefaults({ ...plot, type: newType }, next));
  };

  const onClear = () => {
    if (panel.plotId) removePlot(panel.plotId);
    setPanel(regionId, { type: 'empty', plotId: undefined });
  };

  const toggleShare = (key) => {
    patchPlot(panel.plotId, { [key]: !plot[key] });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Chart type
        </Label>
        <div className="grid grid-cols-3 gap-1">
          {CHART_TYPES.map((c) => (
            <button
              key={c.type}
              type="button"
              onClick={() => switchType(c.type)}
              className={
                'text-xs px-2 py-1.5 rounded border ' +
                (plot.type === c.type
                  ? 'border-primary bg-accent'
                  : 'border-input hover:bg-accent')
              }
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground truncate" title={dataset?.name}>
          Dataset: {dataset?.name || '—'}
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-border">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Data</Label>
        {chart.schema.data.map((f) => (
          <Field
            key={f.key}
            field={f}
            value={effective.params?.[f.key] ?? null}
            onChange={(v) => updateParam(f.key, v)}
            datasetId={plot.datasetId}
          />
        ))}
      </div>

      <div className="space-y-2 pt-3 border-t border-border">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Style
          {highlightedControl && (
            <span className="ml-2 text-[10px] text-primary font-normal normal-case">
              ↑ highlighted from click
            </span>
          )}
        </Label>
        {chart.schema.style.map((f) => (
          <div key={f.key} id={`style-field-${f.key}`}>
            <Field
              field={f}
              value={effective.style?.[f.key] ?? null}
              onChange={(v) => updateStyle(f.key, v)}
              highlighted={highlightedKeys.includes(f.key)}
            />
          </div>
        ))}
        {chart.type === 'network' && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-1"
            onClick={() => {
              const next = ((plot.params?.layoutVersion || 0) + 1);
              patchPlot(panel.plotId, {
                params: { ...(plot.params || {}), layoutVersion: next },
              });
            }}
          >
            <Shuffle className="h-3.5 w-3.5" />
            Re-layout
          </Button>
        )}
      </div>

      <div className="space-y-2 pt-3 border-t border-border">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Linking</Label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={!!plot.shareXWithRow}
            onChange={() => toggleShare('shareXWithRow')}
            className="h-4 w-4"
          />
          <span>Share X with panels in same row</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={!!plot.shareYWithCol}
            onChange={() => toggleShare('shareYWithCol')}
            className="h-4 w-4"
          />
          <span>Share Y with panels in same column</span>
        </label>
      </div>

      <div className="pt-3 border-t border-border">
        <Button variant="outline" size="sm" onClick={onClear}>
          <Trash2 className="h-3.5 w-3.5" />
          Clear panel
        </Button>
      </div>

      {isDraft && (
        <div className="sticky bottom-0 -mx-4 px-4 py-2 bg-background border-t border-border flex gap-2 shadow-[0_-4px_8px_-4px_rgba(0,0,0,0.08)]">
          <Button size="sm" onClick={apply} className="flex-1">
            <Check className="h-3.5 w-3.5" />
            Apply
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <Undo2 className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
