import { useStore } from '@/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Trash2 } from 'lucide-react';
import { PlotInspector } from './PlotInspector';
import { RPlotStyleInspector } from './RPlotStyleInspector';

function PanelLabelEditor({ regionId, panel }) {
  const setPanel = useStore((s) => s.setPanel);
  const labeling = useStore((s) => s.labeling);

  if (!labeling.enabled) return null;

  const label = panel?.label || { auto: true, text: '' };
  const auto = label.auto !== false;

  const setAuto = (v) =>
    setPanel(regionId, {
      label: { auto: v, text: v ? '' : label.text || '' },
    });

  const setText = (text) =>
    setPanel(regionId, { label: { auto: false, text } });

  return (
    <div className="space-y-2 pb-4 border-b border-border">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        Label
      </Label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={auto}
          onChange={(e) => setAuto(e.target.checked)}
          className="h-4 w-4"
        />
        <span>Auto-label (reading order)</span>
      </label>
      {!auto && (
        <Input
          value={label.text || ''}
          onChange={(e) => setText(e.target.value)}
          placeholder="Custom label"
        />
      )}
    </div>
  );
}

function ImageInspector({ regionId, panel }) {
  const ref = useStore((s) => s.imageRefs[panel.imageRef]);
  const setPanel = useStore((s) => s.setPanel);
  const removeImageRef = useStore((s) => s.removeImageRef);

  const border = panel.border || { width: 0, color: '#000000' };

  const setAlt = (v) => setPanel(regionId, { alt: v });
  const setBg = (v) => setPanel(regionId, { background: v });
  const setBorder = (patch) =>
    setPanel(regionId, { border: { ...border, ...patch } });

  const onClear = () => {
    if (panel.imageRef) removeImageRef(panel.imageRef);
    setPanel(regionId, { type: 'empty', imageRef: undefined });
  };

  const dims =
    ref?.width && ref?.height ? `${ref.width} × ${ref.height} px` : 'vector / unknown size';

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Image
        </Label>
        <div className="mt-1 text-sm truncate" title={ref?.name}>
          {ref?.name || '—'}
        </div>
        <div className="text-xs text-muted-foreground">{dims}</div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Alt text</Label>
        <Input
          value={panel.alt || ''}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Describe this image"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Background</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={panel.background === 'transparent' ? '#ffffff' : panel.background || '#ffffff'}
            onChange={(e) => setBg(e.target.value)}
            className="h-8 w-10 rounded border border-input bg-background cursor-pointer"
          />
          <Input
            value={panel.background || 'transparent'}
            onChange={(e) => setBg(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBg('transparent')}
            title="Set transparent"
          >
            None
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Border</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Width (px)</Label>
            <Input
              type="number"
              min={0}
              max={20}
              value={border.width}
              onChange={(e) =>
                setBorder({ width: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Color</Label>
            <input
              type="color"
              value={border.color}
              onChange={(e) => setBorder({ color: e.target.value })}
              className="h-9 w-full rounded border border-input bg-background cursor-pointer"
            />
          </div>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onClear}>
        <Trash2 className="h-3.5 w-3.5" />
        Clear panel
      </Button>
    </div>
  );
}

function EmptyInspector() {
  return (
    <div className="text-sm text-muted-foreground leading-relaxed">
      Drag a dataset from the left onto this panel, or use{' '}
      <span className="text-foreground font-medium">Add image</span> on the panel
      to import an SVG/PNG.
    </div>
  );
}

export function ControlPanel() {
  const selectedRegionId = useStore((s) => s.ui.selectedRegionId);
  const panel = useStore((s) =>
    selectedRegionId ? s.panels[selectedRegionId] : null
  );

  return (
    <div className="h-full flex flex-col">
      <div className="h-12 shrink-0 px-4 flex items-center border-b border-border">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {selectedRegionId ? 'Panel' : 'Inspector'}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {!selectedRegionId ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <SlidersHorizontal className="h-8 w-8 mb-3 opacity-40" />
            <p className="text-sm">Nothing selected</p>
            <p className="text-xs mt-1 leading-relaxed max-w-[28ch]">
              Click a panel on the canvas to edit its content and styling.
            </p>
          </div>
        ) : (
          <>
            <PanelLabelEditor regionId={selectedRegionId} panel={panel} />
            {(!panel || panel.type === 'empty') && <EmptyInspector />}
            {panel?.type === 'plot' && (
              <PlotInspector regionId={selectedRegionId} panel={panel} />
            )}
            {panel?.type === 'image' && (
              <>
                <ImageInspector regionId={selectedRegionId} panel={panel} />
                <RPlotStyleInspector regionId={selectedRegionId} panel={panel} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
