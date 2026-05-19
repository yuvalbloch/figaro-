import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Combine, Maximize2, Minimize2, LayoutGrid, PanelBottomOpen, PanelRightOpen } from 'lucide-react';

export function CanvasToolbar() {
  const mergeMode = useStore((s) => s.ui.mergeMode);
  const setMergeMode = useStore((s) => s.setMergeMode);
  const mergeFirstId = useStore((s) => s.ui.mergeFirstId);
  const requestCanvasFit = useStore((s) => s.requestCanvasFit);
  const revertCanvasFit = useStore((s) => s.revertCanvasFit);
  const canvasFitted = useStore((s) => s.ui.canvasFitted);
  const openDialog = useStore((s) => s.openDialog);
  const addRow = useStore((s) => s.addRow);
  const addCol = useStore((s) => s.addCol);

  return (
    <div className="h-10 shrink-0 flex items-center gap-2 px-3 border-b border-border bg-background">
      <Button
        variant={mergeMode ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMergeMode(!mergeMode)}
      >
        <Combine className="h-4 w-4" />
        {mergeMode ? 'Done merging' : 'Merge cells'}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => openDialog('reorganize')}
        title="Change the grid dimensions and reflow panels"
      >
        <LayoutGrid className="h-4 w-4" />
        Reorganize
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={addRow}
        title="Append a new empty row"
      >
        <PanelBottomOpen className="h-4 w-4" />
        Add row
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={addCol}
        title="Append a new empty column"
      >
        <PanelRightOpen className="h-4 w-4" />
        Add column
      </Button>
      <div className="flex-1" />
      {mergeMode && (
        <span className="text-xs text-muted-foreground mr-2">
          {mergeFirstId
            ? 'Click a second cell to complete the merge.'
            : 'Click two cells that form a rectangle, or click a merged cell to split it.'}
        </span>
      )}
      {canvasFitted ? (
        <Button variant="ghost" size="sm" onClick={revertCanvasFit} title="Revert to original view">
          <Minimize2 className="h-4 w-4" />
          Revert
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={requestCanvasFit} title="Fit canvas width to available space">
          <Maximize2 className="h-4 w-4" />
          Fit
        </Button>
      )}
    </div>
  );
}
