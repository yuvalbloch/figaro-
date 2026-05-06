import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { CANVAS_PRESETS, CANVAS_PRESET_LABELS } from '@/persistence/schema';
import { cn } from '@/lib/cn';

const PRESET_KEYS = Object.keys(CANVAS_PRESETS);

export function NewSessionDialog() {
  const open = useStore((s) => s.ui.dialogs.newSession);
  const closeDialog = useStore((s) => s.closeDialog);
  const setCanvasPreset = useStore((s) => s.setCanvasPreset);
  const setCanvas = useStore((s) => s.setCanvas);
  const initLayout = useStore((s) => s.initLayout);
  const setMeta = useStore((s) => s.setMeta);

  const [preset, setPreset] = useState('A4_portrait');
  const [customW, setCustomW] = useState(210);
  const [customH, setCustomH] = useState(297);
  const [units, setUnits] = useState('mm');
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);

  const isCustom = preset === 'custom';
  const canvasW = isCustom ? customW : CANVAS_PRESETS[preset].width;
  const canvasH = isCustom ? customH : CANVAS_PRESETS[preset].height;
  const canvasUnits = isCustom ? units : CANVAS_PRESETS[preset].units;
  const aspectRatio = canvasW > 0 && canvasH > 0 ? canvasW / canvasH : 1;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const handleCreate = () => {
    setCanvasPreset(preset);
    if (isCustom) setCanvas({ width: customW, height: customH, units });
    initLayout(rows, cols);
    const now = new Date().toISOString();
    setMeta({ name: 'Untitled Figure', createdAt: now, modifiedAt: now });
    closeDialog('newSession');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeDialog('newSession')}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New session</DialogTitle>
          <DialogDescription>Pick a canvas size and a starting grid.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Canvas
              </Label>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {PRESET_KEYS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPreset(p)}
                    className={cn(
                      'text-left text-sm px-3 py-2 rounded-md border transition-colors',
                      preset === p
                        ? 'border-primary bg-accent'
                        : 'border-input hover:bg-accent'
                    )}
                  >
                    {CANVAS_PRESET_LABELS[p]}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPreset('custom')}
                  className={cn(
                    'text-left text-sm px-3 py-2 rounded-md border transition-colors col-span-2',
                    preset === 'custom'
                      ? 'border-primary bg-accent'
                      : 'border-input hover:bg-accent'
                  )}
                >
                  Custom
                </button>
              </div>
              {isCustom && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Width</Label>
                    <Input
                      type="number"
                      min={1}
                      value={customW}
                      onChange={(e) => setCustomW(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Height</Label>
                    <Input
                      type="number"
                      min={1}
                      value={customH}
                      onChange={(e) => setCustomH(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Units</Label>
                    <select
                      value={units}
                      onChange={(e) => setUnits(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm"
                    >
                      <option value="mm">mm</option>
                      <option value="in">in</option>
                      <option value="px">px</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Grid
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="space-y-1">
                  <Label className="text-xs">Rows</Label>
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    value={rows}
                    onChange={(e) => setRows(clamp(Number(e.target.value) || 1, 1, 6))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Columns</Label>
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    value={cols}
                    onChange={(e) => setCols(clamp(Number(e.target.value) || 1, 1, 6))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Preview
            </Label>
            <div
              className="mt-2 border border-input rounded-md p-4 bg-neutral-50 flex items-center justify-center"
              style={{ minHeight: 220 }}
            >
              <div
                className="bg-white shadow-sm grid"
                style={{
                  aspectRatio,
                  width: aspectRatio >= 1 ? '100%' : 'auto',
                  height: aspectRatio >= 1 ? 'auto' : 180,
                  maxHeight: 180,
                  maxWidth: '100%',
                  gridTemplateRows: `repeat(${rows}, 1fr)`,
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gap: 4,
                  padding: 6,
                }}
              >
                {Array.from({ length: rows * cols }).map((_, i) => (
                  <div key={i} className="bg-neutral-100 rounded-sm" />
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center tabular-nums">
              {canvasW} × {canvasH} {canvasUnits} · {rows} × {cols}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => closeDialog('newSession')}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
