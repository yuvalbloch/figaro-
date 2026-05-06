import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { Plus, Database, Sparkles } from 'lucide-react';
import { DatasetCard } from './DatasetCard';
import { ingestFile, ingestUrl } from '@/lib/ingest';

const EXAMPLES = [
  { file: 'examples/iris.csv', name: 'Iris flowers' },
  { file: 'examples/gapminder-2007.csv', name: 'Gapminder 2007' },
  { file: 'examples/sales-by-month.csv', name: 'Sales by month' },
];

export function DataManager() {
  const datasets = useStore((s) => s.datasets);
  const addDataset = useStore((s) => s.addDataset);
  const inputRef = useRef(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const datasetIds = Object.keys(datasets);

  const onFiles = async (files) => {
    setError(null);
    setBusy(true);
    for (const f of files) {
      try {
        await ingestFile(f, addDataset);
      } catch (e) {
        setError(`${f.name}: ${e.message}`);
      }
    }
    setBusy(false);
  };

  const onLoadExamples = async () => {
    setError(null);
    setBusy(true);
    for (const ex of EXAMPLES) {
      try {
        await ingestUrl(ex.file, ex.name, addDataset);
      } catch (e) {
        setError(`${ex.name}: ${e.message}`);
      }
    }
    setBusy(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-12 shrink-0 px-4 flex items-center justify-between border-b border-border">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Data
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => inputRef.current?.click()}
          title="Add CSV or JSON"
          disabled={busy}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".csv,.tsv,.json,.txt"
          className="hidden"
          onChange={(e) => {
            onFiles([...e.target.files]);
            e.target.value = '';
          }}
        />
      </div>

      <div className="flex-1 overflow-auto p-3">
        {datasetIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-2 text-muted-foreground">
            <Database className="h-8 w-8 mb-3 opacity-40" />
            <p className="text-sm">No datasets yet</p>
            <p className="text-xs mt-1 leading-relaxed">
              Add CSV or JSON files to start building plots.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onLoadExamples}
              disabled={busy}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Load examples
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {datasetIds.map((dsId) => (
              <DatasetCard key={dsId} datasetId={dsId} />
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={onLoadExamples}
              disabled={busy}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Load examples
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-1 leading-relaxed">
              Drag a dataset onto an empty panel.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-3 text-xs text-destructive border border-destructive/30 bg-destructive/5 rounded p-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
