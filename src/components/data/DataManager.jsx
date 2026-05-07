import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { Plus, Database, Sparkles } from 'lucide-react';
import { DatasetCard } from './DatasetCard';
import { ingestFile, ingestUrl } from '@/lib/ingest';

const EXAMPLES = [
  {
    file: 'examples/iris.csv',
    name: 'Iris flowers',
    description: 'Classic Fisher/Anderson dataset with sepal and petal measurements for three iris species (setosa, versicolor, virginica). A staple for exploring classification and multivariate plots.',
  },
  {
    file: 'examples/Leigh1968_harelynx.csv',
    name: 'Hare & Lynx (1968)',
    description: 'Hudson\'s Bay Company fur-capture records from Canada tracking snowshoe hare and Canadian lynx populations. The oscillating cycle inspired the Lotka–Volterra predator–prey model.',
  },
  {
    file: 'examples/darwins_finches.csv',
    name: "Darwin's Finches",
    description: "Beak measurements of Galápagos finches on Daphne Major from 1975 and 2012, plus parent–offspring heredity data for G. fortis and G. scandens. Follow Darwin's footsteps and observe evolution in real time. (record_type: 'beak' or 'heredity')",
  },
  {
    file: 'examples/dolphin_social.csv',
    name: 'Dolphin Social Network',
    description: "Social associations among 62 bottlenose dolphins in Doubtful Sound, New Zealand, observed by David Lusseau (1995–2001). Each row is a pair of dolphins seen together, with names and sex — ideal for network or scatter plots.",
  },
];

function ExamplesList({ onLoadOne, onLoadAll, busy }) {
  return (
    <div className="w-full mt-3 space-y-0.5">
      {EXAMPLES.map((ex) => (
        <button
          key={ex.file}
          title={ex.description}
          disabled={busy}
          onClick={() => onLoadOne(ex)}
          className="w-full text-left text-[11px] px-2 py-1.5 rounded flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="h-3 w-3 shrink-0 opacity-50" />
          <span className="truncate">{ex.name}</span>
        </button>
      ))}
      <button
        disabled={busy}
        onClick={onLoadAll}
        className="w-full text-left text-[11px] px-2 py-1.5 rounded flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1 border-t border-border pt-2"
      >
        <Sparkles className="h-3 w-3 shrink-0 opacity-50" />
        <span className="font-medium">Load all examples</span>
      </button>
    </div>
  );
}

export function DataManager() {
  const datasets = useStore((s) => s.datasets);
  const addDataset = useStore((s) => s.addDataset);
  const inputRef = useRef(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

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

  const onLoadOne = async (ex) => {
    setError(null);
    setBusy(true);
    try {
      await ingestUrl(ex.file, ex.name, addDataset);
    } catch (e) {
      setError(`${ex.name}: ${e.message}`);
    }
    setBusy(false);
  };

  const onLoadAll = async () => {
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
            <ExamplesList onLoadOne={onLoadOne} onLoadAll={onLoadAll} busy={busy} />
          </div>
        ) : (
          <div className="space-y-2">
            {datasetIds.map((dsId) => (
              <DatasetCard key={dsId} datasetId={dsId} />
            ))}
            <button
              className="w-full text-left text-[11px] px-2 py-1.5 rounded flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mt-1"
              onClick={() => setShowExamples((v) => !v)}
            >
              <Sparkles className="h-3 w-3 shrink-0 opacity-50" />
              <span>{showExamples ? 'Hide examples' : 'Load examples…'}</span>
            </button>
            {showExamples && (
              <ExamplesList onLoadOne={onLoadOne} onLoadAll={onLoadAll} busy={busy} />
            )}
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
