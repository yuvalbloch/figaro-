import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { toSvg } from '@/engine/export/toSvg';
import { toPng } from '@/engine/export/toPng';
import { toHtml } from '@/engine/export/toHtml';
import { toPdf } from '@/engine/export/toPdf';
import { cn } from '@/lib/cn';
import { Download, Loader2 } from 'lucide-react';

const FORMATS = [
  {
    id: 'svg',
    label: 'SVG',
    desc: 'Vector graphic — ideal for publications and further editing in Illustrator or Inkscape.',
  },
  {
    id: 'png',
    label: 'PNG',
    desc: 'Rasterized image at selectable resolution. Good for slides and web.',
  },
  {
    id: 'html',
    label: 'HTML',
    desc: 'Self-contained interactive figure. Charts remain zoomable. Requires the Plotly CDN (internet).',
  },
  {
    id: 'pdf',
    label: 'PDF',
    desc: 'Print-ready document via jsPDF + svg2pdf. Note: SVG foreignObject elements are not supported.',
  },
];

const PNG_SCALES = [
  { value: 1, label: '1×', note: '96 ppi' },
  { value: 2, label: '2×', note: '192 ppi' },
  { value: 3, label: '3×', note: '288 ppi' },
];

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportDialog() {
  const open = useStore((s) => s.ui.dialogs.export);
  const closeDialog = useStore((s) => s.closeDialog);
  const meta = useStore((s) => s.meta);

  const [format, setFormat] = useState('svg');
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const safeName = (meta.name || 'figaro').replace(/[^a-z0-9_-]/gi, '_');

  const handleExport = async () => {
    setBusy(true);
    setError(null);
    try {
      const state = useStore.getState();
      let blob, filename;

      if (format === 'svg') {
        const svgStr = await toSvg(state);
        blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        filename = `${safeName}.svg`;
      } else if (format === 'png') {
        blob = await toPng(state, scale);
        filename = `${safeName}.png`;
      } else if (format === 'html') {
        const html = await toHtml(state);
        blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        filename = `${safeName}.html`;
      } else if (format === 'pdf') {
        blob = await toPdf(state);
        filename = `${safeName}.pdf`;
      }

      if (blob) {
        triggerDownload(blob, filename);
        closeDialog('export');
      }
    } catch (err) {
      setError(err.message || 'Export failed');
    } finally {
      setBusy(false);
    }
  };

  const currentFormat = FORMATS.find((f) => f.id === format);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && closeDialog('export')}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export figure</DialogTitle>
          <DialogDescription className="truncate">{meta.name}</DialogDescription>
        </DialogHeader>

        {/* Format tabs */}
        <div className="grid grid-cols-4 gap-1.5">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => { setFormat(f.id); setError(null); }}
              className={cn(
                'py-2 rounded-md text-sm font-medium border transition-colors',
                format === f.id
                  ? 'border-primary bg-accent'
                  : 'border-input hover:bg-accent'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Format description */}
        <p className="text-sm text-muted-foreground leading-snug">{currentFormat?.desc}</p>

        {/* PNG resolution selector */}
        {format === 'png' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground shrink-0">Resolution</span>
            <div className="flex gap-1.5">
              {PNG_SCALES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setScale(s.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm border transition-colors',
                    scale === s.value
                      ? 'border-primary bg-accent font-medium'
                      : 'border-input hover:bg-accent'
                  )}
                >
                  {s.label}
                  <span className="text-muted-foreground ml-1 text-xs">{s.note}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => closeDialog('export')}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                Exporting…
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1.5" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
