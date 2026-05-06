import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { Plus, Database } from 'lucide-react';

export function DataManager() {
  const datasets = useStore((s) => s.datasets);
  const datasetIds = Object.keys(datasets);

  return (
    <div className="h-full flex flex-col">
      <div className="h-12 shrink-0 px-4 flex items-center justify-between border-b border-border">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Data
        </span>
        <Button variant="ghost" size="icon" disabled className="h-7 w-7">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {datasetIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 text-muted-foreground">
            <Database className="h-8 w-8 mb-3 opacity-40" />
            <p className="text-sm">No datasets yet</p>
            <p className="text-xs mt-1 leading-relaxed">
              Add CSV or JSON files to start building plots.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {datasetIds.map((id) => (
              <li key={id} className="text-sm px-2 py-1.5 rounded hover:bg-accent">
                {datasets[id].name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
