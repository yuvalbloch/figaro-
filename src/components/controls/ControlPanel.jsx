import { useStore } from '@/store';
import { SlidersHorizontal } from 'lucide-react';

export function ControlPanel() {
  const selectedRegionId = useStore((s) => s.ui.selectedRegionId);
  const panel = useStore((s) =>
    selectedRegionId ? s.panels[selectedRegionId] : null
  );

  return (
    <div className="h-full flex flex-col">
      <div className="h-12 shrink-0 px-4 flex items-center border-b border-border">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {selectedRegionId ? 'Panel' : 'Inspector'}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {!selectedRegionId ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <SlidersHorizontal className="h-8 w-8 mb-3 opacity-40" />
            <p className="text-sm">Nothing selected</p>
            <p className="text-xs mt-1 leading-relaxed max-w-[28ch]">
              Click a panel on the canvas to edit its content and styling.
            </p>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {panel?.type === 'empty' && 'Empty panel — choose content (Phase 3+).'}
            {panel?.type === 'plot' && 'Plot controls — wired in Phase 4.'}
            {panel?.type === 'image' && 'Image controls — wired in Phase 3.'}
          </div>
        )}
      </div>
    </div>
  );
}
