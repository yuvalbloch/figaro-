import { create } from 'zustand';
import { canvasSlice } from './canvasSlice';
import { layoutSlice } from './layoutSlice';
import { plotsSlice } from './plotsSlice';
import { dataSlice } from './dataSlice';
import { uiSlice } from './uiSlice';

export const useStore = create((set, get) => ({
  meta: {
    name: 'Untitled Figure',
    createdAt: null,
    modifiedAt: null,
  },
  theme: {
    name: 'lightMinimal',
    globalFontFamily: 'Inter',
    baseFontSize: 12,
  },
  labeling: {
    enabled: true,
    style: 'A',
    position: 'top-left-inside',
    fontSize: 14,
    bold: true,
  },
  setMeta: (patch) => set((s) => ({ meta: { ...s.meta, ...patch } })),
  setTheme: (patch) => set((s) => ({ theme: { ...s.theme, ...patch } })),
  setLabeling: (patch) => set((s) => ({ labeling: { ...s.labeling, ...patch } })),
  ...canvasSlice(set, get),
  ...layoutSlice(set, get),
  ...plotsSlice(set, get),
  ...dataSlice(set, get),
  ...uiSlice(set, get),
}));
