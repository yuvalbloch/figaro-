// Auto-label computation: assigns A/B/C... to regions in reading order
// (rowStart, then colStart). Caller may override per-panel via panel.label.

function letterLabel(index, upper) {
  let n = index;
  let out = '';
  while (true) {
    const ch = (upper ? 65 : 97) + (n % 26);
    out = String.fromCharCode(ch) + out;
    n = Math.floor(n / 26) - 1;
    if (n < 0) break;
  }
  return out;
}

export function formatLabel(index, style) {
  switch (style) {
    case 'A':
      return letterLabel(index, true);
    case 'a':
      return letterLabel(index, false);
    case '1':
      return String(index + 1);
    case '(A)':
      return `(${letterLabel(index, true)})`;
    case '(a)':
      return `(${letterLabel(index, false)})`;
    case '(1)':
      return `(${index + 1})`;
    default:
      return letterLabel(index, true);
  }
}

export function computeAutoLabels(regions, style) {
  const sorted = [...regions].sort((a, b) =>
    a.rowStart !== b.rowStart ? a.rowStart - b.rowStart : a.colStart - b.colStart
  );
  const out = {};
  sorted.forEach((r, i) => {
    out[r.id] = formatLabel(i, style);
  });
  return out;
}
