import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Combine, Maximize2 } from 'lucide-react';

export function CanvasToolbar() {
  const mergeMode = useStore((s) => s.ui.mergeMode);
  const setMergeMode = useStore((s) => s.setMergeMode);
  const mergeFirstId = useStore((s) => s.ui.mergeFirstId);
  const requestCanvasFit = useStore((s) => s.requestCanvasFit);

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
      <div className="flex-1" />
      {mergeMode && (
        <span className="text-xs text-muted-foreground mr-2">
          {mergeFirstId
            ? 'Click a second cell to complete the merge.'
            : 'Click two cells that form a rectangle, or click a merged cell to split it.'}
        </span>
      )}
      <Button variant="ghost" size="sm" onClick={requestCanvasFit} title="Fit canvas to view">
        <Maximize2 className="h-4 w-4" />
        Fit
      </Button>
    </div>
  );
}
