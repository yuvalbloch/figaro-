import { useStore } from '@/store';

export function ImagePanel({ panel }) {
  const ref = useStore((s) => s.imageRefs[panel.imageRef]);
  const loaded = useStore((s) => s._loaded[panel.imageRef]);

  if (!ref || !loaded?.blobURL) {
    return (
      <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
        Image missing — relocate file
      </div>
    );
  }

  const border = panel.border || { width: 0, color: '#000000' };

  return (
    <div
      className="h-full w-full"
      style={{
        background: panel.background || 'transparent',
        boxSizing: 'border-box',
        border: border.width ? `${border.width}px solid ${border.color}` : undefined,
      }}
    >
      <img
        src={loaded.blobURL}
        alt={panel.alt || ref.name}
        draggable={false}
        className="h-full w-full"
        style={{ objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}
