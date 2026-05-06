import { cn } from '@/lib/cn';

const POSITION_CLASS = {
  'top-left-inside': 'top-2 left-2',
  'top-right-inside': 'top-2 right-2',
  'top-left-outside': '-top-6 left-0',
  'top-right-outside': '-top-6 right-0',
};

export function PanelLabel({ text, position = 'top-left-inside', fontSize = 14, bold = true }) {
  return (
    <span
      className={cn(
        'absolute z-10 select-none pointer-events-none text-foreground tabular-nums',
        POSITION_CLASS[position] || POSITION_CLASS['top-left-inside'],
        bold && 'font-bold'
      )}
      style={{ fontSize }}
    >
      {text}
    </span>
  );
}
