import { useCallback } from 'react';
import { useDndContext, useDroppable, useDraggable } from '@dnd-kit/core';
import { GripVertical, X } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/cn';
import { EmptyPanel } from './EmptyPanel';
import { ImagePanel } from './ImagePanel';
import { PanelLabel } from './PanelLabel';
import { PlotEngine } from '@/engine/PlotEngine';

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
  const setPanel = useStore((s) => s.setPanel);
  const removePlot = useStore((s) => s.removePlot);
  const removeImageRef = useStore((s) => s.removeImageRef);
  const setDraft = useStore((s) => s.setDraft);

  // Drop target — always enabled (not merge mode); logic in CanvasDndProvider decides whether to act
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `panel-drop-${region.id}`,
    data: { kind: 'panel', regionId: region.id },
    disabled: mergeMode,
  });

  // Drag source — the grip handle
  const { setNodeRef: setDragRef, attributes, listeners, isDragging } = useDraggable({
    id: `panel-drag-${region.id}`,
    data: { kind: 'panel', regionId: region.id },
    disabled: mergeMode,
  });

  // Know what's currently being dragged to decide drop highlight color
  const { active } = useDndContext();
  const activeDragKind = active?.data?.current?.kind;
  const activeDragRegion = active?.data?.current?.regionId;

  const showDropHighlight =
    isOver &&
    ((activeDragKind === 'dataset' && panel?.type === 'empty') ||
      (activeDragKind === 'panel' && activeDragRegion !== region.id));

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

  const isNonEmpty = panel && panel.type !== 'empty';

  const handleClear = (e) => {
    e.stopPropagation();
    if (panel.type === 'plot' && panel.plotId) {
      setDraft(null);
      removePlot(panel.plotId);
      setPanel(region.id, { type: 'empty', plotId: undefined });
    } else if (panel.type === 'image' && panel.imageRef) {
      removeImageRef(panel.imageRef);
      setPanel(region.id, { type: 'empty', imageRef: undefined });
    }
  };

  const labelText =
    panel?.label?.auto === false && panel?.label?.text ? panel.label.text : label;

  const labelOffset = panel?.label?.offset ?? null;
  const handleLabelOffsetChange = useCallback((xFrac, yFrac) => {
    const existing = panel?.label || { auto: true, text: '' };
    setPanel(region.id, { label: { ...existing, offset: { x: xFrac, y: yFrac } } });
  }, [setPanel, region.id, panel?.label]);

  return (
    <div
      ref={setDropRef}
      style={{
        gridColumn: `${region.colStart} / ${region.colEnd}`,
        gridRow: `${region.rowStart} / ${region.rowEnd}`,
        opacity: isDragging ? 0.4 : 1,
      }}
      onClick={onClick}
      onMouseEnter={() => setHoverRegion(region.id)}
      onMouseLeave={() => setHoverRegion(null)}
      className={cn(
        'relative bg-white transition-colors cursor-pointer group',
        isMergeFirst
          ? 'outline outline-2 outline-blue-500 -outline-offset-2'
          : showDropHighlight
            ? 'outline outline-2 outline-primary -outline-offset-2'
            : selected
              ? 'outline outline-2 outline-primary -outline-offset-2'
              : hover
                ? 'outline outline-1 outline-neutral-300 -outline-offset-1'
                : ''
      )}
    >
      {(!panel || panel.type === 'empty') && (
        <EmptyPanel regionId={region.id} isOver={showDropHighlight} />
      )}
      {panel?.type === 'plot' && panel.plotId && (
        <PlotEngine regionId={region.id} plotId={panel.plotId} />
      )}
      {panel?.type === 'image' && <ImagePanel panel={panel} />}

      {labeling.enabled && labelText && (
        <PanelLabel
          text={labelText}
          position={labeling.position}
          fontSize={labeling.fontSize}
          bold={labeling.bold}
          offset={labelOffset}
          onOffsetChange={handleLabelOffsetChange}
        />
      )}

      {/* Drag handle — visible on hover, hidden in merge mode */}
      {!mergeMode && (
        <div
          ref={setDragRef}
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-1 left-1 z-10 p-0.5 rounded opacity-0 group-hover:opacity-60 hover:!opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
          title="Drag to swap panel"
        >
          <GripVertical className="h-3.5 w-3.5 text-neutral-400" />
        </div>
      )}

      {/* Clear button — visible on hover for non-empty panels, hidden in merge mode */}
      {!mergeMode && isNonEmpty && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-1 right-1 z-10 p-0.5 rounded opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-destructive transition-opacity"
          title="Clear panel"
        >
          <X className="h-3.5 w-3.5 text-neutral-400 hover:text-destructive" />
        </button>
      )}
    </div>
  );
}
