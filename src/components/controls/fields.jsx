import { ColumnPicker } from '@/components/data/ColumnPicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/cn';
import { PALETTE_DATA } from '@/themes/palettes';
import { FONTS } from '@/persistence/schema';
import { useStore } from '@/store';

const FONT_LABELS = {
  'Inter':         'Sans',
  'Merriweather':  'Serif',
  'IBM Plex Mono': 'Mono',
  'Lato':          'Round',
};

function FieldShell({ label, hint, children, className, highlighted }) {
  return (
    <div
      className={cn(
        'space-y-1 rounded transition-all duration-200',
        highlighted && 'ring-2 ring-primary/50 ring-offset-1 bg-primary/5 px-2 py-1 -mx-2',
        className
      )}
    >
      {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
      {children}
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function TextField({ field, value, onChange, highlighted }) {
  return (
    <FieldShell label={field.label} hint={field.hint} highlighted={highlighted}>
      <Input
        value={value ?? ''}
        placeholder={field.placeholder || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

function NumberField({ field, value, onChange, highlighted }) {
  return (
    <FieldShell label={field.label} hint={field.hint} highlighted={highlighted}>
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

function SliderField({ field, value, onChange, highlighted }) {
  const effective = value ?? field.min;
  return (
    <FieldShell label={field.label} hint={field.hint} highlighted={highlighted}>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          value={effective}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 cursor-pointer accent-primary"
        />
        <span className="text-xs text-muted-foreground tabular-nums w-7 text-right select-none">
          {value ?? '—'}
        </span>
      </div>
    </FieldShell>
  );
}

function BoolField({ field, value, onChange, highlighted }) {
  return (
    <div className={cn(
      'rounded transition-all duration-200',
      highlighted && 'ring-2 ring-primary/50 ring-offset-1 bg-primary/5 px-2 py-1 -mx-2'
    )}>
      <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4"
        />
        <span>{field.label}</span>
      </label>
    </div>
  );
}

function SelectField({ field, value, onChange, highlighted }) {
  return (
    <FieldShell label={field.label} hint={field.hint} highlighted={highlighted}>
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

function ColorField({ field, value, onChange, highlighted }) {
  return (
    <FieldShell label={field.label} hint={field.hint} highlighted={highlighted}>
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

function ColumnField({ field, value, onChange, datasetId, highlighted }) {
  return (
    <FieldShell label={field.label + (field.required ? ' *' : '')} hint={field.hint} highlighted={highlighted}>
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

function PaletteField({ field, value, onChange, highlighted }) {
  const current = value || 'tableau10';
  const customPalette = useStore((s) => s.customPalette);
  const setCustomPalette = useStore((s) => s.setCustomPalette);

  const updateCustomColor = (index, color) => {
    const next = [...customPalette];
    next[index] = color;
    setCustomPalette(next);
  };

  return (
    <FieldShell label={field.label} hint={field.hint} highlighted={highlighted}>
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

        {/* Custom palette row */}
        <button
          type="button"
          onClick={() => onChange('custom')}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1 rounded border text-left text-xs transition-colors',
            current === 'custom' ? 'border-primary bg-accent' : 'border-input hover:bg-accent'
          )}
        >
          <span className="capitalize w-16 shrink-0">Custom</span>
          <span className="flex-1 flex">
            {customPalette.map((c, i) => (
              <span key={i} className="h-4 flex-1" style={{ backgroundColor: c }} />
            ))}
          </span>
        </button>

        {current === 'custom' && (
          <div className="flex gap-1 pt-1">
            {customPalette.map((c, i) => (
              <input
                key={i}
                type="color"
                value={c}
                onChange={(e) => updateCustomColor(i, e.target.value)}
                className="flex-1 h-6 rounded border border-input cursor-pointer p-0"
                title={`Color ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </FieldShell>
  );
}

function FontField({ field, value, onChange, highlighted }) {
  return (
    <FieldShell label={field.label} hint={field.hint} highlighted={highlighted}>
      <div className="grid grid-cols-2 gap-1.5">
        {FONTS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onChange(value === f ? null : f)}
            className={cn(
              'flex flex-col items-center py-2 rounded border transition-colors',
              value === f
                ? 'border-primary bg-accent'
                : 'border-input hover:bg-accent'
            )}
          >
            <span className="text-xl leading-none" style={{ fontFamily: f }}>Aa</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {FONT_LABELS[f] || f.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </FieldShell>
  );
}

export function Field({ field, value, onChange, datasetId, highlighted }) {
  switch (field.kind) {
    case 'text':
      return <TextField    field={field} value={value} onChange={onChange} highlighted={highlighted} />;
    case 'number':
      return <NumberField  field={field} value={value} onChange={onChange} highlighted={highlighted} />;
    case 'slider':
      return <SliderField  field={field} value={value} onChange={onChange} highlighted={highlighted} />;
    case 'bool':
      return <BoolField    field={field} value={value} onChange={onChange} highlighted={highlighted} />;
    case 'select':
      return <SelectField  field={field} value={value} onChange={onChange} highlighted={highlighted} />;
    case 'color':
      return <ColorField   field={field} value={value} onChange={onChange} highlighted={highlighted} />;
    case 'column':
      return <ColumnField  field={field} value={value} onChange={onChange} datasetId={datasetId} highlighted={highlighted} />;
    case 'palette':
      return <PaletteField field={field} value={value} onChange={onChange} highlighted={highlighted} />;
    case 'font':
      return <FontField    field={field} value={value} onChange={onChange} highlighted={highlighted} />;
    default:
      return null;
  }
}
