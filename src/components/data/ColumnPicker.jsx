import { cn } from '@/lib/cn';
import { useStore } from '@/store';

export function MultiColumnPicker({ datasetId, value = [], onChange, filter, className }) {
  const dataset = useStore((s) => (datasetId ? s.datasets[datasetId] : null));
  const columns = dataset
    ? filter
      ? dataset.columns.filter((c) => (filter === 'number' ? c.type === 'number' : true))
      : dataset.columns
    : [];

  const selected = new Set(value || []);

  const toggle = (name) => {
    const next = selected.has(name)
      ? (value || []).filter((v) => v !== name)
      : [...(value || []), name];
    onChange(next.length ? next : null);
  };

  if (!dataset) {
    return (
      <div className={cn('text-xs text-muted-foreground italic', className)}>No dataset loaded</div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-0.5 max-h-40 overflow-y-auto border rounded-md p-1', className)}>
      {columns.length === 0 && (
        <div className="text-xs text-muted-foreground italic px-1">No numeric columns</div>
      )}
      {columns.map((c) => (
        <label key={c.name} className="flex items-center gap-2 px-1.5 py-0.5 rounded hover:bg-accent cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={selected.has(c.name)}
            onChange={() => toggle(c.name)}
            className="h-3.5 w-3.5 shrink-0"
          />
          <span className="truncate">{c.name}</span>
          <span className="text-muted-foreground text-[10px] ml-auto shrink-0">
            {c.type === 'number' ? '№' : '𝐀'}
          </span>
        </label>
      ))}
    </div>
  );
}

export function ColumnPicker({
  datasetId,
  value,
  onChange,
  filter,
  placeholder = 'Select column…',
  className,
  disabled = false,
}) {
  const dataset = useStore((s) => (datasetId ? s.datasets[datasetId] : null));
  const columns = dataset
    ? filter
      ? dataset.columns.filter((c) => (filter === 'number' ? c.type === 'number' : true))
      : dataset.columns
    : [];

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled || !dataset}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      <option value="">{placeholder}</option>
      {columns.map((c) => (
        <option key={c.name} value={c.name}>
          {c.name} {c.type === 'number' ? '·№' : '·𝐀'}
        </option>
      ))}
    </select>
  );
}
