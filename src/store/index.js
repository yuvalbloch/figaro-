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
  customPalette: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7'],
  setCustomPalette: (colors) => set({ customPalette: colors }),
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
  loadSession: (session) =>
    set((s) => ({
      meta: session.meta,
      theme: session.theme,
      customPalette: session.customPalette ?? s.customPalette,
      labeling: session.labeling,
      canvas: session.canvas,
      layout: session.layout,
      panels: session.panels,
      plots: session.plots,
      datasets: session.datasets,
      imageRefs: session.imageRefs,
      _loaded: {},
      ui: {
        ...s.ui,
        selectedRegionId: null,
        hoverRegionId: null,
        mergeMode: false,
        mergeFirstId: null,
        dialogs: { newSession: false, locateFiles: false, export: false, manual: false },
        draft: null,
      },
    })),
  ...canvasSlice(set, get),
  ...layoutSlice(set, get),
  ...plotsSlice(set, get),
  ...dataSlice(set, get),
  ...uiSlice(set, get),
}));
