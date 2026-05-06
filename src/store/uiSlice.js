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
    },
    draft: null,
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
});
