import { id } from '@/lib/id';

function buildDefaultRegions(rows, cols) {
  const regions = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      regions.push({
        id: id('r'),
        rowStart: r,
        rowEnd: r + 1,
        colStart: c,
        colEnd: c + 1,
      });
    }
  }
  return regions;
}

function emptyPanelsFor(regions) {
  const panels = {};
  for (const r of regions) {
    panels[r.id] = { type: 'empty', label: { text: '', auto: true } };
  }
  return panels;
}

function rectanglesOverlap(a, b) {
  return !(
    a.rowEnd <= b.rowStart ||
    a.rowStart >= b.rowEnd ||
    a.colEnd <= b.colStart ||
    a.colStart >= b.colEnd
  );
}

export const layoutSlice = (set, get) => ({
  layout: {
    rows: 0,
    cols: 0,
    rowSizes: [],
    colSizes: [],
    gap: 12,
    padding: 24,
    regions: [],
  },
  panels: {},

  initLayout: (rows, cols) => {
    const regions = buildDefaultRegions(rows, cols);
    set({
      layout: {
        rows,
        cols,
        rowSizes: Array(rows).fill(1),
        colSizes: Array(cols).fill(1),
        gap: 12,
        padding: 24,
        regions,
      },
      panels: emptyPanelsFor(regions),
      ui: { ...get().ui, selectedRegionId: null, mergeMode: false, mergeFirstId: null },
    });
  },

  setLayout: (patch) => set((s) => ({ layout: { ...s.layout, ...patch } })),
  setRowSizes: (sizes) => set((s) => ({ layout: { ...s.layout, rowSizes: sizes } })),
  setColSizes: (sizes) => set((s) => ({ layout: { ...s.layout, colSizes: sizes } })),

  setPanel: (regionId, patch) =>
    set((s) => ({
      panels: {
        ...s.panels,
        [regionId]: { ...(s.panels[regionId] || {}), ...patch },
      },
    })),

  mergeRegions: (idA, idB) => {
    if (idA === idB) return { ok: false, error: 'Same region' };
    const { layout, panels } = get();
    const a = layout.regions.find((r) => r.id === idA);
    const b = layout.regions.find((r) => r.id === idB);
    if (!a || !b) return { ok: false, error: 'Region not found' };

    const minRow = Math.min(a.rowStart, b.rowStart);
    const maxRow = Math.max(a.rowEnd, b.rowEnd);
    const minCol = Math.min(a.colStart, b.colStart);
    const maxCol = Math.max(a.colEnd, b.colEnd);

    const bbox = { rowStart: minRow, rowEnd: maxRow, colStart: minCol, colEnd: maxCol };
    const bboxArea = (maxRow - minRow) * (maxCol - minCol);
    const sumArea =
      (a.rowEnd - a.rowStart) * (a.colEnd - a.colStart) +
      (b.rowEnd - b.rowStart) * (b.colEnd - b.colStart);

    if (bboxArea !== sumArea) {
      return { ok: false, error: 'Selection must form a rectangle' };
    }
    for (const r of layout.regions) {
      if (r.id === idA || r.id === idB) continue;
      if (rectanglesOverlap(r, bbox)) {
        return { ok: false, error: 'Selection must form a rectangle' };
      }
    }

    const newId = id('r');
    const newRegion = { id: newId, ...bbox };
    const nextRegions = layout.regions
      .filter((r) => r.id !== idA && r.id !== idB)
      .concat(newRegion);

    const nextPanels = { ...panels };
    delete nextPanels[idA];
    delete nextPanels[idB];
    nextPanels[newId] = panels[idA] || { type: 'empty', label: { text: '', auto: true } };

    set({ layout: { ...layout, regions: nextRegions }, panels: nextPanels });
    return { ok: true, newId };
  },

  splitRegion: (regionId) => {
    const { layout, panels } = get();
    const r = layout.regions.find((x) => x.id === regionId);
    if (!r) return;
    const isSingle = r.rowEnd - r.rowStart === 1 && r.colEnd - r.colStart === 1;
    if (isSingle) return;

    const newRegions = [];
    const newPanels = {};
    let kept = false;
    for (let row = r.rowStart; row < r.rowEnd; row++) {
      for (let col = r.colStart; col < r.colEnd; col++) {
        const newId = id('r');
        newRegions.push({
          id: newId,
          rowStart: row,
          rowEnd: row + 1,
          colStart: col,
          colEnd: col + 1,
        });
        if (!kept) {
          newPanels[newId] = panels[regionId] || { type: 'empty', label: { text: '', auto: true } };
          kept = true;
        } else {
          newPanels[newId] = { type: 'empty', label: { text: '', auto: true } };
        }
      }
    }

    const otherRegions = layout.regions.filter((x) => x.id !== regionId);
    const otherPanels = { ...panels };
    delete otherPanels[regionId];

    set({
      layout: { ...layout, regions: [...otherRegions, ...newRegions] },
      panels: { ...otherPanels, ...newPanels },
    });
  },
});
