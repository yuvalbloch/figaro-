import { useState, useCallback } from 'react';
import { useStore } from '@/store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// The R server URL is injected at page-load time by the httpuv server.
// It is null/undefined in normal browser use, so all R features silently no-op.
const R_SERVER = typeof window !== 'undefined' ? window.__FIGARO_R_SERVER__ : null;

const LEGEND_POSITIONS = [
  { value: 'right',  label: 'Right' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left',   label: 'Left' },
  { value: 'top',    label: 'Top' },
  { value: 'none',   label: 'Hidden' },
];

async function fetchRestyle(plotId, params) {
  if (!R_SERVER) return null;
  try {
    const res = await fetch(`${R_SERVER}/restyle`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ plotId, ...params }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.dataUrl ?? null;
  } catch {
    return null;
  }
}

export function RPlotStyleInspector({ regionId, panel }) {
  const ref           = useStore((s) => s.imageRefs[panel.imageRef]);
  const setPanel      = useStore((s) => s.setPanel);
  const attachLoaded  = useStore((s) => s.attachLoaded);

  const [title,      setTitle]      = useState('');
  const [xLabel,     setXLabel]     = useState('');
  const [yLabel,     setYLabel]     = useState('');
  const [fontSize,   setFontSize]   = useState(12);
  const [legendPos,  setLegendPos]  = useState('right');
  const [widthIn,    setWidthIn]    = useState(7);
  const [heightIn,   setHeightIn]   = useState(5);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  const applyRestyle = useCallback(async () => {
    if (!R_SERVER || !panel.imageRef) return;
    setLoading(true);
    setError(null);
    const dataUrl = await fetchRestyle(panel.imageRef, {
      title:     title     || undefined,
      xLabel:    xLabel    || undefined,
      yLabel:    yLabel    || undefined,
      fontSize:  fontSize  || undefined,
      legendPos: legendPos || undefined,
      widthIn,
      heightIn,
    });
    setLoading(false);
    if (!dataUrl) {
      setError('Re-render failed — check the R console for details.');
      return;
    }
    // Update the _loaded blob URL with the new data URL
    attachLoaded(panel.imageRef, { rows: null, blobURL: dataUrl });
  }, [panel.imageRef, title, xLabel, yLabel, fontSize, legendPos, widthIn, heightIn, attachLoaded]);

  if (!R_SERVER || !ref?.rPlot) return null;

  return (
    <div className="space-y-3 pt-3 border-t border-border">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        R Plot Style
      </Label>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Re-render the original R plot with new style settings.
        Changes are applied to the current panel only.
      </p>

      <div className="space-y-1">
        <Label className="text-xs">Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Plot title" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">X label</Label>
          <Input value={xLabel} onChange={(e) => setXLabel(e.target.value)} placeholder="X axis" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Y label</Label>
          <Input value={yLabel} onChange={(e) => setYLabel(e.target.value)} placeholder="Y axis" />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Base font size (pt)</Label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={8} max={24} step={1}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="flex-1 h-1.5 cursor-pointer accent-primary"
          />
          <span className="text-xs text-muted-foreground tabular-nums w-6 text-right">{fontSize}</span>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Legend position</Label>
        <select
          value={legendPos}
          onChange={(e) => setLegendPos(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm"
        >
          {LEGEND_POSITIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Width (in)</Label>
          <Input
            type="number" min={2} max={20} step={0.5}
            value={widthIn}
            onChange={(e) => setWidthIn(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Height (in)</Label>
          <Input
            type="number" min={2} max={20} step={0.5}
            value={heightIn}
            onChange={(e) => setHeightIn(Number(e.target.value))}
          />
        </div>
      </div>

      {error && (
        <p className="text-[11px] text-destructive leading-snug">{error}</p>
      )}

      <Button
        size="sm"
        className="w-full"
        onClick={applyRestyle}
        disabled={loading}
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Re-rendering…' : 'Apply style'}
      </Button>
    </div>
  );
}
