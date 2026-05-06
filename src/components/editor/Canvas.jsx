import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/store';
import { unitToPx } from '@/lib/geometry';
import { computeAutoLabels } from '@/lib/labels';
import { Panel } from './Panel';
import { GridDivider } from './GridDivider';
import { CanvasToolbar } from './CanvasToolbar';
import { Button } from '@/components/ui/button';
import { LayoutGrid } from 'lucide-react';

export function Canvas() {
  const layout = useStore((s) => s.layout);
  const canvas = useStore((s) => s.canvas);
  const labeling = useStore((s) => s.labeling);
  const openDialog = useStore((s) => s.openDialog);
  const selectRegion = useStore((s) => s.selectRegion);
  const fitTrigger = useStore((s) => s.ui.canvasFitTrigger);

  const containerRef = useRef(null);
  const surfaceRef = useRef(null);
  const [scale, setScale] = useState(1);

  const widthPx = unitToPx(canvas.width, canvas.units);
  const heightPx = unitToPx(canvas.height, canvas.units);

  useEffect(() => {
    if (!containerRef.current || layout.rows === 0) return;
    const margin = 64;
    const compute = (rect) => {
      if (!rect.width || !rect.height) return;
      const sx = (rect.width - margin) / widthPx;
      const sy = (rect.height - margin) / heightPx;
      setScale(Math.min(Math.max(sx, 0.05), Math.max(sy, 0.05), 1));
    };
    compute(containerRef.current.getBoundingClientRect());
    const observer = new ResizeObserver(([entry]) => compute(entry.contentRect));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [widthPx, heightPx, layout.rows, fitTrigger]);

  const labels = useMemo(
    () => computeAutoLabels(layout.regions, labeling.style),
    [layout.regions, labeling.style]
  );

  if (layout.rows === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-neutral-100">
        <div className="flex flex-col items-center text-center max-w-sm">
          <LayoutGrid className="h-10 w-10 text-muted-foreground mb-4 opacity-40" />
          <h2 className="text-base font-medium tracking-tight">No figure yet</h2>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Start a new session to pick a canvas size and grid.
          </p>
          <Button className="mt-5" onClick={() => openDialog('newSession')}>
            New session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <CanvasToolbar />
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-neutral-100"
        onClick={() => selectRegion(null)}
      >
        <div className="min-h-full flex items-center justify-center p-8">
          <div
            style={{ width: widthPx * scale, height: heightPx * scale }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={surfaceRef}
              className="relative shadow-md"
              style={{
                width: widthPx,
                height: heightPx,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                backgroundColor: canvas.backgroundColor,
              }}
            >
              <div
                className="absolute inset-0 grid"
                style={{
                  gridTemplateRows: layout.rowSizes.map((s) => `${s}fr`).join(' '),
                  gridTemplateColumns: layout.colSizes.map((s) => `${s}fr`).join(' '),
                  gap: layout.gap,
                  padding: layout.padding,
                }}
              >
                {layout.regions.map((region) => (
                  <Panel key={region.id} region={region} label={labels[region.id]} />
                ))}
              </div>

              {layout.colSizes.slice(0, -1).map((_, i) => (
                <GridDivider
                  key={`col-${i}`}
                  orientation="vertical"
                  index={i}
                  surfaceRef={surfaceRef}
                />
              ))}
              {layout.rowSizes.slice(0, -1).map((_, i) => (
                <GridDivider
                  key={`row-${i}`}
                  orientation="horizontal"
                  index={i}
                  surfaceRef={surfaceRef}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
