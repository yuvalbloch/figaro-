// Overflow heuristics. Plots refuse to render giant rasterized output and
// instead group / downsample with a small note in the warnings array.

export const DEFAULT_LIMITS = {
  categoryCap: 30,
  scatterCap: 5000,
  rowWarning: 50000,
};

export function capCategories(rows, key, valueKey, limits = DEFAULT_LIMITS) {
  const totals = new Map();
  for (const r of rows) {
    const k = r?.[key];
    if (k === null || k === undefined || k === '') continue;
    const v = valueKey ? Number(r[valueKey]) || 0 : 1;
    totals.set(k, (totals.get(k) || 0) + v);
  }
  if (totals.size <= limits.categoryCap) {
    return { kept: [...totals.keys()], grouped: false, dropped: 0 };
  }
  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const kept = sorted.slice(0, limits.categoryCap - 1).map(([k]) => k);
  const dropped = sorted.length - kept.length;
  return { kept, grouped: true, dropped };
}

export function downsample(arr, cap) {
  if (arr.length <= cap) return { values: arr, sampled: false };
  const step = arr.length / cap;
  const out = new Array(cap);
  for (let i = 0; i < cap; i++) out[i] = arr[Math.floor(i * step)];
  return { values: out, sampled: true };
}

export function rowWarning(rows, limits = DEFAULT_LIMITS) {
  return rows.length > limits.rowWarning ? `Large dataset (${rows.length.toLocaleString()} rows) — render may be slow.` : null;
}
