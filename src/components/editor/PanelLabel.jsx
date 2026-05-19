import { useRef, useCallback } from 'react';
import { cn } from '@/lib/cn';

const POSITION_STYLE = {
  'top-left-inside':   { top: 8, left: 8 },
  'top-right-inside':  { top: 8, right: 8 },
  'top-left-outside':  { top: -24, left: 0 },
  'top-right-outside': { top: -24, right: 0 },
};

export function PanelLabel({ text, position = 'top-left-inside', fontSize = 14, bold = true, offset, onOffsetChange }) {
  const labelRef = useRef(null);

  const onMouseDown = useCallback((e) => {
    if (!onOffsetChange) return;
    e.stopPropagation();
    e.preventDefault();

    const panelEl = labelRef.current.parentElement;
    const panelRect = panelEl.getBoundingClientRect();
    const labelRect = labelRef.current.getBoundingClientRect();

    const state = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startLabelX: labelRect.left - panelRect.left,
      startLabelY: labelRect.top - panelRect.top,
      panelW: panelRect.width,
      panelH: panelRect.height,
    };

    const onMove = (mv) => {
      let newX = state.startLabelX + (mv.clientX - state.startMouseX);
      let newY = state.startLabelY + (mv.clientY - state.startMouseY);
      newX = Math.max(0, Math.min(state.panelW, newX));
      newY = Math.max(0, Math.min(state.panelH, newY));
      onOffsetChange(newX / state.panelW, newY / state.panelH);
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [onOffsetChange]);

  const positionStyle = offset
    ? { top: `${offset.y * 100}%`, left: `${offset.x * 100}%` }
    : POSITION_STYLE[position] || POSITION_STYLE['top-left-inside'];

  return (
    <span
      ref={labelRef}
      onMouseDown={onOffsetChange ? onMouseDown : undefined}
      style={{ fontSize, ...positionStyle }}
      className={cn(
        'absolute z-10 select-none text-foreground tabular-nums',
        bold && 'font-bold',
        onOffsetChange ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none',
      )}
    >
      {text}
    </span>
  );
}
