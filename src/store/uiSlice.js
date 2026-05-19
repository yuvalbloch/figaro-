export const uiSlice = (set) => ({
  ui: {
    selectedRegionId: null,
    hoverRegionId: null,
    mergeMode: false,
    mergeFirstId: null,
    dialogs: {
      newSession: false,
      locateFiles: false,
      export: false,
      manual: false,
      reorganize: false,
    },
    draft: null,
    highlightedControl: null,
    canvasFitTrigger: 0,
    canvasFitted: false,
    idbSavedAt: null,
  },
  selectRegion: (regionId) =>
    set((s) => ({ ui: { ...s.ui, selectedRegionId: regionId } })),
  setHoverRegion: (regionId) =>
    set((s) => ({ ui: { ...s.ui, hoverRegionId: regionId } })),
  setMergeMode: (on) =>
    set((s) => ({ ui: { ...s.ui, mergeMode: on, mergeFirstId: null } })),
  setMergeFirst: (regionId) =>
    set((s) => ({ ui: { ...s.ui, mergeFirstId: regionId } })),
  openDialog: (name) =>
    set((s) => ({
      ui: { ...s.ui, dialogs: { ...s.ui.dialogs, [name]: true } },
    })),
  closeDialog: (name) =>
    set((s) => ({
      ui: { ...s.ui, dialogs: { ...s.ui.dialogs, [name]: false } },
    })),
  setDraft: (draft) => set((s) => ({ ui: { ...s.ui, draft } })),
  setHighlightedControl: (key) => set((s) => ({ ui: { ...s.ui, highlightedControl: key } })),
  requestCanvasFit: () =>
    set((s) => ({ ui: { ...s.ui, canvasFitTrigger: s.ui.canvasFitTrigger + 1, canvasFitted: true } })),
  revertCanvasFit: () =>
    set((s) => ({ ui: { ...s.ui, canvasFitTrigger: s.ui.canvasFitTrigger + 1, canvasFitted: false } })),
  setIdbSavedAt: (ts) => set((s) => ({ ui: { ...s.ui, idbSavedAt: ts } })),
});
