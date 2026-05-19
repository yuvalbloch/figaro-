import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useStore } from '@/store';
import { id } from '@/lib/id';

export function CanvasDndProvider({ children }) {
  const setPanel = useStore((s) => s.setPanel);
  const setPlot = useStore((s) => s.setPlot);
  const removePlot = useStore((s) => s.removePlot);
  const removeImageRef = useStore((s) => s.removeImageRef);
  const swapPanels = useStore((s) => s.swapPanels);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const onDragEnd = ({ active, over }) => {
    if (!over) return;
    const drag = active.data.current;
    const drop = over.data.current;
    if (!drag || !drop) return;

    if (drag.kind === 'panel' && drop.kind === 'panel') {
      if (drag.regionId !== drop.regionId) swapPanels(drag.regionId, drop.regionId);
      return;
    }

    if (drag.kind === 'dataset' && drop.kind === 'panel') {
      const { regionId } = drop;
      const { panels } = useStore.getState();
      const existing = panels[regionId];
      if (existing?.type !== 'empty') return;

      if (existing?.type === 'plot' && existing.plotId) removePlot(existing.plotId);
      if (existing?.type === 'image' && existing.imageRef) removeImageRef(existing.imageRef);

      const plotId = id('plt');
      setPlot(plotId, {
        type: 'bar',
        datasetId: drag.datasetId,
        params: {},
        style: {},
      });
      setPanel(regionId, { type: 'plot', plotId });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      {children}
    </DndContext>
  );
}
