import { cn } from '@/lib/cn';
import { useStore } from '@/store';

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
