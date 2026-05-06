import { CANVAS_PRESETS } from '@/persistence/schema';

export const canvasSlice = (set) => ({
  canvas: {
    preset: 'A4_portrait',
    ...CANVAS_PRESETS.A4_portrait,
    dpi: 300,
    backgroundColor: '#ffffff',
  },
  setCanvas: (patch) => set((s) => ({ canvas: { ...s.canvas, ...patch } })),
  setCanvasPreset: (preset) => {
    if (preset !== 'custom' && CANVAS_PRESETS[preset]) {
      set((s) => ({ canvas: { ...s.canvas, preset, ...CANVAS_PRESETS[preset] } }));
    } else {
      set((s) => ({ canvas: { ...s.canvas, preset } }));
    }
  },
});
