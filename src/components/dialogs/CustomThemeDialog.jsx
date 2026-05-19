import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store';
import { FONTS } from '@/persistence/schema';

const COLOR_FIELDS = [
  { key: 'background', label: 'Background' },
  { key: 'text',       label: 'Text' },
  { key: 'gridline',   label: 'Gridline' },
  { key: 'axisLine',   label: 'Axis Line' },
];

export function CustomThemeDialog() {
  const open = useStore((s) => s.ui.dialogs.customTheme);
  const closeDialog = useStore((s) => s.closeDialog);
  const customThemeData = useStore((s) => s.customThemeData);
  const setCustomThemeData = useStore((s) => s.setCustomThemeData);
  const setTheme = useStore((s) => s.setTheme);

  const [local, setLocal] = useState({ ...customThemeData });

  useEffect(() => {
    if (open) setLocal({ ...customThemeData });
  }, [open]);

  const set = (key, value) => setLocal((prev) => ({ ...prev, [key]: value }));

  const handleApply = () => {
    setCustomThemeData(local);
    setTheme({ name: 'custom', globalFontFamily: local.fontFamily, baseFontSize: local.baseFontSize });
    closeDialog('customTheme');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeDialog('customTheme')}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Custom theme</DialogTitle>
          <DialogDescription>Define your own colors and typography.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Colors
            </Label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {COLOR_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={local[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className="h-7 w-7 cursor-pointer rounded border border-input p-0.5 bg-background"
                    title={label}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-medium">{label}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{local[key]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Font family</Label>
              <select
                value={local.fontFamily}
                onChange={(e) => set('fontFamily', e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm"
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Base font size</Label>
              <Input
                type="number"
                min={8}
                max={24}
                value={local.baseFontSize}
                onChange={(e) => set('baseFontSize', Math.max(8, Math.min(24, Number(e.target.value) || 12)))}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Preview
            </Label>
            <div
              className="rounded-md border border-input p-3 text-sm"
              style={{ background: local.background, color: local.text, fontFamily: local.fontFamily }}
            >
              <div style={{ fontSize: local.baseFontSize + 2, fontWeight: 600, marginBottom: 4 }}>
                Chart Title
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 32, height: 2, background: local.axisLine }} />
                <span style={{ fontSize: local.baseFontSize }}>Axis label</span>
              </div>
              <div style={{ marginTop: 4, height: 1, background: local.gridline }} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => closeDialog('customTheme')}>Cancel</Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
