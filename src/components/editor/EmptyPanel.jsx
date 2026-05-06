import { useRef } from 'react';
import { ImagePlus, Move } from 'lucide-react';
import { useStore } from '@/store';
import { ingestImageFile } from '@/lib/ingest';
import { cn } from '@/lib/cn';

export function EmptyPanel({ regionId, isOver }) {
  const inputRef = useRef(null);
  const addImageRef = useStore((s) => s.addImageRef);
  const setPanel = useStore((s) => s.setPanel);

  const onPick = async (file) => {
    if (!file) return;
    const imageRefId = await ingestImageFile(file, addImageRef);
    setPanel(regionId, {
      type: 'image',
      imageRef: imageRefId,
      alt: '',
      background: 'transparent',
      border: { width: 0, color: '#000000' },
    });
  };

  return (
    <div
      className={cn(
        'h-full w-full flex flex-col items-center justify-center gap-2 text-xs select-none transition-colors',
        isOver
          ? 'bg-primary/10 text-primary'
          : 'text-neutral-300 hover:text-neutral-500'
      )}
    >
      <Move className="h-4 w-4 opacity-50" />
      <div className="text-center leading-tight">
        {isOver ? (
          <span className="font-medium">Drop dataset</span>
        ) : (
          <>
            Drop dataset
            <br />
            or
          </>
        )}
      </div>
      {!isOver && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-700 text-[11px]"
        >
          <ImagePlus className="h-3 w-3" />
          Add image
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/svg+xml,image/png,image/jpeg,image/webp"
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) onPick(f);
        }}
      />
    </div>
  );
}
