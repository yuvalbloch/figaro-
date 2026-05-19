import { create } from 'zustand';
import { canvasSlice } from './canvasSlice';
import { layoutSlice } from './layoutSlice';
import { plotsSlice } from './plotsSlice';
import { dataSlice } from './dataSlice';
import { uiSlice } from './uiSlice';
import { persistSession } from '@/persistence/idb';

const captureFields = (s) => ({
  meta: s.meta,
  canvas: s.canvas,
  layout: s.layout,
  panels: s.panels,
  plots: s.plots,
  datasets: s.datasets,
  imageRefs: s.imageRefs,
  theme: s.theme,
  labeling: s.labeling,
  customPalette: s.customPalette,
  customThemeData: s.customThemeData,
});

export const useStore = create((set, get) => ({
  _history: [],
  _future: [],
  pushHistory: (snapshot) =>
    set((s) => ({ _history: [snapshot, ...s._history].slice(0, 5) })),
  undo: () => {
    const s = get();
    if (!s._history.length) return;
    const [snapshot, ...remaining] = s._history;
    const current = captureFields(s);
    _restoring = true;
    set({ ...snapshot, _history: remaining, _future: [current, ...s._future].slice(0, 5) });
    setTimeout(() => { _restoring = false; }, 0);
  },
  redo: () => {
    const s = get();
    if (!s._future.length) return;
    const [snapshot, ...remaining] = s._future;
    const current = captureFields(s);
    _restoring = true;
    set({ ...snapshot, _future: remaining, _history: [current, ...s._history].slice(0, 5) });
    setTimeout(() => { _restoring = false; }, 0);
  },
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
  customThemeData: {
    background: '#ffffff',
    text: '#111827',
    gridline: '#f3f4f6',
    axisLine: '#d1d5db',
    fontFamily: 'Inter',
    baseFontSize: 12,
    showGridDefault: false,
  },
  setCustomThemeData: (data) => set((s) => ({ customThemeData: { ...s.customThemeData, ...data } })),
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
      _history: [],
      _future: [],
      meta: session.meta,
      theme: session.theme,
      customPalette: session.customPalette ?? s.customPalette,
      customThemeData: session.customThemeData ?? s.customThemeData,
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

// Module-level flag: suppress history capture while undo/redo is restoring state.
let _restoring = false;

// History capture: on the first meaningful change in a sequence, snapshot
// the state BEFORE the change. A debounce timer groups rapid edits (e.g.
// slider drags) into a single undo entry.
let _historyTimer = null;
let _snapshotBeforeChange = null;

// Auto-save to IndexedDB whenever meaningful state changes, debounced 1.5 s.
let _saveTimer = null;
useStore.subscribe((state, prev) => {
  const meaningfulChange =
    state.meta !== prev.meta ||
    state.canvas !== prev.canvas ||
    state.layout !== prev.layout ||
    state.panels !== prev.panels ||
    state.plots !== prev.plots ||
    state.datasets !== prev.datasets ||
    state.imageRefs !== prev.imageRefs ||
    state.theme !== prev.theme ||
    state.labeling !== prev.labeling ||
    state.customPalette !== prev.customPalette ||
    state.customThemeData !== prev.customThemeData;

  if (!meaningfulChange && state._loaded === prev._loaded) return;
  if (!state.layout || state.layout.rows === 0) return;

  // History capture (skip during undo/redo restore)
  if (meaningfulChange && !_restoring) {
    // Any new user change invalidates the redo stack.
    if (state._future.length > 0) {
      useStore.setState({ _future: [] });
    }
    if (!_snapshotBeforeChange) {
      _snapshotBeforeChange = captureFields(prev);
    }
    clearTimeout(_historyTimer);
    _historyTimer = setTimeout(() => {
      if (_snapshotBeforeChange) {
        useStore.getState().pushHistory(_snapshotBeforeChange);
        _snapshotBeforeChange = null;
      }
      _historyTimer = null;
    }, 800);
  }

  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(async () => {
    try {
      await persistSession(useStore.getState());
      useStore.getState().setIdbSavedAt(Date.now());
    } catch {
      // fail silently — browser storage unavailable or quota exceeded
    }
  }, 1500);
});
