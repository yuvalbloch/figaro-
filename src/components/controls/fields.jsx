import { ColumnPicker } from '@/components/data/ColumnPicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/cn';
import { PALETTE_DATA } from '@/themes/palettes';
import { FONTS } from '@/persistence/schema';

function FieldShell({ label, hint, children, className }) {
  return (
    <div className={cn('space-y-1', className)}>
      {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
      {children}
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function TextField({ field, value, onChange }) {
  return (
    <FieldShell label={field.label} hint={field.hint}>
      <Input
        value={value ?? ''}
        placeholder={field.placeholder || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

function NumberField({ field, value, onChange }) {
  return (
    <FieldShell label={field.label} hint={field.hint}>
      <Input
        type="number"
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        placeholder={field.placeholder || ''}
        value={value ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? null : Number(v));
        }}
      />
    </FieldShell>
  );
}

function BoolField({ field, value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      <span>{field.label}</span>
    </label>
  );
}

function SelectField({ field, value, onChange }) {
  return (
    <FieldShell label={field.label} hint={field.hint}>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm"
      >
        <option value="">Auto</option>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

function ColorField({ field, value, onChange }) {
  return (
    <FieldShell label={field.label} hint={field.hint}>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 rounded border border-input bg-background cursor-pointer"
        />
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          placeholder="#rrggbb"
        />
      </div>
    </FieldShell>
  );
}

function ColumnField({ field, value, onChange, datasetId }) {
  return (
    <FieldShell label={field.label + (field.required ? ' *' : '')} hint={field.hint}>
      <ColumnPicker
        datasetId={datasetId}
        value={value}
        onChange={onChange}
        filter={field.filter}
        placeholder="Select column…"
      />
    </FieldShell>
  );
}

function PaletteField({ field, value, onChange }) {
  const current = value || 'tableau10';
  return (
    <FieldShell label={field.label} hint={field.hint}>
      <div className="space-y-1">
        {Object.entries(PALETTE_DATA).map(([name, colors]) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1 rounded border text-left text-xs transition-colors',
              current === name
                ? 'border-primary bg-accent'
                : 'border-input hover:bg-accent'
            )}
          >
            <span className="capitalize w-16 shrink-0">{name}</span>
            <span className="flex-1 flex">
              {colors.map((c, i) => (
                <span key={i} className="h-4 flex-1" style={{ backgroundColor: c }} />
              ))}
            </span>
          </button>
        ))}
      </div>
    </FieldShell>
  );
}

function FontField({ field, value, onChange }) {
  return (
    <FieldShell label={field.label} hint={field.hint}>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm"
      >
        <option value="">Theme default</option>
        {FONTS.map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>
            {f}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Field({ field, value, onChange, datasetId }) {
  switch (field.kind) {
    case 'text':
      return <TextField field={field} value={value} onChange={onChange} />;
    case 'number':
      return <NumberField field={field} value={value} onChange={onChange} />;
    case 'bool':
      return <BoolField field={field} value={value} onChange={onChange} />;
    case 'select':
      return <SelectField field={field} value={value} onChange={onChange} />;
    case 'color':
      return <ColorField field={field} value={value} onChange={onChange} />;
    case 'column':
      return <ColumnField field={field} value={value} onChange={onChange} datasetId={datasetId} />;
    case 'palette':
      return <PaletteField field={field} value={value} onChange={onChange} />;
    case 'font':
      return <FontField field={field} value={value} onChange={onChange} />;
    default:
      return null;
  }
}
