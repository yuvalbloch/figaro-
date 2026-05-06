import { useDraggable } from '@dnd-kit/core';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useStore } from '@/store';

export function DatasetCard({ datasetId }) {
  const dataset = useStore((s) => s.datasets[datasetId]);
  const removeDataset = useStore((s) => s.removeDataset);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `dataset-${datasetId}`,
    data: { kind: 'dataset', datasetId },
  });

  if (!dataset) return null;

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  const visibleCols = dataset.columns.slice(0, 6);
  const overflow = dataset.columns.length - visibleCols.length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-md border border-border bg-background shadow-sm transition-shadow',
        isDragging && 'opacity-40 shadow-md'
      )}
    >
      <div className="flex items-center gap-1 px-2 pt-2">
        <button
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          aria-label="Drag dataset"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <span className="text-sm font-medium truncate flex-1">{dataset.name}</span>
        <button
          onClick={() => removeDataset(datasetId)}
          className="text-muted-foreground hover:text-destructive p-0.5 rounded"
          aria-label="Remove dataset"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="px-2 text-xs text-muted-foreground tabular-nums">
        {dataset.rowCount} rows · {dataset.columns.length} cols
      </div>
      <div className="flex flex-wrap gap-1 p-2">
        {visibleCols.map((c) => (
          <span
            key={c.name}
            title={`${c.name} (${c.type})`}
            className={cn(
              'text-[10px] leading-none px-1.5 py-1 rounded font-medium',
              c.type === 'number'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-neutral-100 text-neutral-700'
            )}
          >
            {c.name}
          </span>
        ))}
        {overflow > 0 && (
          <span className="text-[10px] leading-none px-1.5 py-1 text-muted-foreground">
            +{overflow}
          </span>
        )}
      </div>
    </div>
  );
}
