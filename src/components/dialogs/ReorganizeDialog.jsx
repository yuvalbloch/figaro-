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

export function ReorganizeDialog() {
  const open = useStore((s) => s.ui.dialogs.reorganize);
  const closeDialog = useStore((s) => s.closeDialog);
  const layout = useStore((s) => s.layout);
  const panels = useStore((s) => s.panels);
  const reorganizeLayout = useStore((s) => s.reorganizeLayout);

  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const nonEmptyCount = Object.values(panels).filter((p) => p?.type !== 'empty').length;
  const totalCells = rows * cols;
  const willLose = totalCells < nonEmptyCount;
  const panelsLost = Math.max(0, nonEmptyCount - totalCells);

  const onOpenChange = (open) => {
    if (!open) closeDialog('reorganize');
  };

  const onOpen = () => {
    setRows(layout.rows || 2);
    setCols(layout.cols || 2);
  };

  const onConfirm = () => {
    reorganizeLayout(rows, cols);
    closeDialog('reorganize');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" onOpenAutoFocus={onOpen}>
        <DialogHeader>
          <DialogTitle>Reorganize layout</DialogTitle>
          <DialogDescription>
            Set a new grid size. Panels fill left-to-right, top-to-bottom.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
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

        <div className="flex items-center justify-center py-2">
          <div
            className="bg-neutral-50 border border-input rounded-md grid"
            style={{
              width: 160,
              height: 120,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: 3,
              padding: 6,
            }}
          >
            {Array.from({ length: rows * cols }).map((_, i) => (
              <div
                key={i}
                className={i < nonEmptyCount ? 'bg-primary/20 rounded-sm' : 'bg-neutral-200 rounded-sm'}
              />
            ))}
          </div>
        </div>

        {willLose && (
          <p className="text-xs text-destructive">
            Warning: {panelsLost} panel{panelsLost > 1 ? 's' : ''} with content will be
            removed. Increase the grid size to keep all panels.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => closeDialog('reorganize')}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
