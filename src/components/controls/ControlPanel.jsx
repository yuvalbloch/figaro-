import { useStore } from '@/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { PlotInspector } from './PlotInspector';
import { RPlotStyleInspector } from './RPlotStyleInspector';

const LABEL_STYLES = ['A', 'a', '1', '(A)', '(a)', '(1)'];
const LABEL_POSITIONS = [
  { value: 'top-left-inside',  label: 'Top-left (inside)'  },
  { value: 'top-right-inside', label: 'Top-right (inside)' },
  { value: 'top-left-outside', label: 'Top-left (outside)' },
  { value: 'top-right-outside',label: 'Top-right (outside)'},
];

function GlobalLabelSettings() {
  const labeling    = useStore((s) => s.labeling);
  const setLabeling = useStore((s) => s.setLabeling);

  return (
    <div className="space-y-3">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        Panel labels
      </Label>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={labeling.enabled}
          onChange={(e) => setLabeling({ enabled: e.target.checked })}
          className="h-4 w-4"
        />
        <span>Show labels</span>
      </label>

      {labeling.enabled && (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Style</Label>
            <div className="flex flex-wrap gap-1">
              {LABEL_STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setLabeling({ style: s })}
                  className={
                    'px-2 py-1 text-xs rounded border ' +
                    (labeling.style === s
                      ? 'border-primary bg-accent font-medium'
                      : 'border-input hover:bg-accent')
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Position</Label>
            <select
              value={labeling.position}
              onChange={(e) => setLabeling({ position: e.target.value })}
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
            >
              {LABEL_POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Font size</Label>
              <Input
                type="number"
                min={6}
                max={48}
                value={labeling.fontSize}
                onChange={(e) => setLabeling({ fontSize: Number(e.target.value) || 14 })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bold</Label>
              <label className="flex items-center gap-2 text-sm cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={labeling.bold}
                  onChange={(e) => setLabeling({ bold: e.target.checked })}
                  className="h-4 w-4"
                />
                <span>Bold</span>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PanelLabelEditor({ regionId, panel }) {
  const setPanel = useStore((s) => s.setPanel);
  const labeling = useStore((s) => s.labeling);

  if (!labeling.enabled) return null;

  const label = panel?.label || { auto: true, text: '' };
  const auto = label.auto !== false;
  const hasOffset = !!label.offset;

  const setAuto = (v) =>
    setPanel(regionId, {
      label: { auto: v, text: v ? '' : label.text || '' },
    });

  const setText = (text) =>
    setPanel(regionId, { label: { auto: false, text } });

  const resetOffset = () =>
    setPanel(regionId, { label: { ...label, offset: undefined } });

  return (
    <div className="space-y-2 pb-4 border-b border-border">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Label
        </Label>
        {hasOffset && (
          <button
            type="button"
            onClick={resetOffset}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Reset position
          </button>
        )}
      </div>
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
          <GlobalLabelSettings />
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
