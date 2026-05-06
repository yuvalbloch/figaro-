import { useStore } from '@/store';
import { cn } from '@/lib/cn';
import { EmptyPanel } from './EmptyPanel';
import { PanelLabel } from './PanelLabel';

export function Panel({ region, label }) {
  const panel = useStore((s) => s.panels[region.id]);
  const selectedId = useStore((s) => s.ui.selectedRegionId);
  const hoverId = useStore((s) => s.ui.hoverRegionId);
  const mergeMode = useStore((s) => s.ui.mergeMode);
  const mergeFirstId = useStore((s) => s.ui.mergeFirstId);
  const labeling = useStore((s) => s.labeling);

  const selectRegion = useStore((s) => s.selectRegion);
  const setHoverRegion = useStore((s) => s.setHoverRegion);
  const setMergeFirst = useStore((s) => s.setMergeFirst);
  const mergeRegions = useStore((s) => s.mergeRegions);
  const splitRegion = useStore((s) => s.splitRegion);

  const isMerged =
    region.rowEnd - region.rowStart > 1 || region.colEnd - region.colStart > 1;
  const selected = selectedId === region.id;
  const hover = hoverId === region.id;
  const isMergeFirst = mergeFirstId === region.id;

  const onClick = (e) => {
    e.stopPropagation();
    if (mergeMode) {
      if (isMergeFirst) {
        setMergeFirst(null);
        return;
      }
      if (mergeFirstId === null) {
        if (isMerged) {
          splitRegion(region.id);
          selectRegion(null);
          return;
        }
        setMergeFirst(region.id);
        return;
      }
      const result = mergeRegions(mergeFirstId, region.id);
      setMergeFirst(null);
      if (result.ok) {
        selectRegion(result.newId);
      } else {
        // eslint-disable-next-line no-console
        console.warn('Merge failed:', result.error);
      }
      return;
    }
    selectRegion(region.id);
  };

  const labelText =
    panel?.label?.auto === false && panel?.label?.text ? panel.label.text : label;

  return (
    <div
      style={{
        gridColumn: `${region.colStart} / ${region.colEnd}`,
        gridRow: `${region.rowStart} / ${region.rowEnd}`,
      }}
      onClick={onClick}
      onMouseEnter={() => setHoverRegion(region.id)}
      onMouseLeave={() => setHoverRegion(null)}
      className={cn(
        'relative bg-white transition-colors cursor-pointer',
        isMergeFirst
          ? 'outline outline-2 outline-blue-500 -outline-offset-2'
          : selected
            ? 'outline outline-2 outline-primary -outline-offset-2'
            : hover
              ? 'outline outline-1 outline-neutral-300 -outline-offset-1'
              : ''
      )}
    >
      {(!panel || panel.type === 'empty') && <EmptyPanel />}
      {panel?.type === 'plot' && (
        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
          Plot (Phase 4)
        </div>
      )}
      {panel?.type === 'image' && (
        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
          Image (Phase 3)
        </div>
      )}

      {labeling.enabled && labelText && (
        <PanelLabel
          text={labelText}
          position={labeling.position}
          fontSize={labeling.fontSize}
          bold={labeling.bold}
        />
      )}
    </div>
  );
}
