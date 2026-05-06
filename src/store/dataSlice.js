// datasets / imageRefs are serialized to session JSON.
// _loaded holds in-memory parsed rows + Blob URLs and is never serialized.

export const dataSlice = (set) => ({
  datasets: {},
  imageRefs: {},
  _loaded: {},
  addDataset: (datasetId, dataset, rows) =>
    set((s) => ({
      datasets: { ...s.datasets, [datasetId]: dataset },
      _loaded: { ...s._loaded, [datasetId]: { rows, blobURL: null } },
    })),
  removeDataset: (datasetId) =>
    set((s) => {
      const datasets = { ...s.datasets };
      delete datasets[datasetId];
      const _loaded = { ...s._loaded };
      delete _loaded[datasetId];
      return { datasets, _loaded };
    }),
  attachLoaded: (datasetId, payload) =>
    set((s) => ({ _loaded: { ...s._loaded, [datasetId]: payload } })),
  addImageRef: (imageRefId, ref, blobURL) =>
    set((s) => ({
      imageRefs: { ...s.imageRefs, [imageRefId]: ref },
      _loaded: { ...s._loaded, [imageRefId]: { rows: null, blobURL } },
    })),
});
