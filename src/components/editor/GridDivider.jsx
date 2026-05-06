import { useStore } from '@/store';
import { unitToPx } from '@/lib/geometry';

const MIN_TRACK_PX = 80;

export function GridDivider({ orientation, index, surfaceRef }) {
  const layout = useStore((s) => s.layout);
  const canvas = useStore((s) => s.canvas);
  const setRowSizes = useStore((s) => s.setRowSizes);
  const setColSizes = useStore((s) => s.setColSizes);

  const isVertical = orientation === 'vertical';
  const sizes = isVertical ? layout.colSizes : layout.rowSizes;
  const total = sizes.reduce((a, b) => a + b, 0) || 1;

  const widthPx = unitToPx(canvas.width, canvas.units);
  const heightPx = unitToPx(canvas.height, canvas.units);
  const containerLength = isVertical ? widthPx : heightPx;
  const crossLength = isVertical ? heightPx : widthPx;

  const innerLength = containerLength - 2 * layout.padding;
  const trackLength = innerLength - (sizes.length - 1) * layout.gap;

  const accBefore = sizes.slice(0, index + 1).reduce((a, b) => a + b, 0);
  const trackEdgeCanvasPx =
    layout.padding + (accBefore / total) * trackLength + index * layout.gap;
  const positionPx = trackEdgeCanvasPx + layout.gap / 2;

  const onPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startCoord = isVertical ? e.clientX : e.clientY;
    const startSizes = [...sizes];

    const surfaceRect = surfaceRef.current?.getBoundingClientRect();
    if (!surfaceRect) return;
    const displayedLength = isVertical ? surfaceRect.width : surfaceRect.height;
    const scale = displayedLength / containerLength;
    const displayedTrackLength = trackLength * scale;
    const minProportion = (MIN_TRACK_PX / trackLength) * total;

    const onMove = (ev) => {
      const coord = isVertical ? ev.clientX : ev.clientY;
      const deltaPx = coord - startCoord;
      const deltaProportion = (deltaPx / displayedTrackLength) * total;
      const newA = startSizes[index] + deltaProportion;
      const newB = startSizes[index + 1] - deltaProportion;
      if (newA < minProportion || newB < minProportion) return;
      const next = [...startSizes];
      next[index] = newA;
      next[index + 1] = newB;
      if (isVertical) setColSizes(next);
      else setRowSizes(next);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const baseStyle = {
    position: 'absolute',
    zIndex: 20,
  };
  const orientStyle = isVertical
    ? {
        left: positionPx - 4,
        top: 0,
        width: 8,
        height: crossLength,
        cursor: 'col-resize',
      }
    : {
        top: positionPx - 4,
        left: 0,
        height: 8,
        width: crossLength,
        cursor: 'row-resize',
      };

  return (
    <div onPointerDown={onPointerDown} style={{ ...baseStyle, ...orientStyle }} className="group">
      <div
        className="absolute bg-blue-400/0 group-hover:bg-blue-400/30 transition-colors"
        style={
          isVertical
            ? { left: 3, top: 0, width: 2, height: '100%' }
            : { top: 3, left: 0, height: 2, width: '100%' }
        }
      />
    </div>
  );
}
