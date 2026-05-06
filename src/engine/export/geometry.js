import { unitToPx } from '@/lib/geometry';

export function canvasSizePx(canvas) {
  return {
    w: unitToPx(canvas.width, canvas.units),
    h: unitToPx(canvas.height, canvas.units),
  };
}

// Convert canvas px (at 96 DPI) to millimetres.
export function pxToMm(px) {
  return px * (25.4 / 96);
}

// Returns { [regionId]: { x, y, w, h } } in CSS-pixel coordinates
// matching the Canvas component's CSS Grid layout.
export function computePanelRects(layout, widthPx, heightPx) {
  const { rows, cols, rowSizes, colSizes, gap, padding, regions } = layout;

  // Available space after padding and inter-track gaps.
  const availW = widthPx - 2 * padding - (cols - 1) * gap;
  const availH = heightPx - 2 * padding - (rows - 1) * gap;
  const totalColFr = colSizes.reduce((a, b) => a + b, 0);
  const totalRowFr = rowSizes.reduce((a, b) => a + b, 0);

  const colWidths = colSizes.map((s) => (s / totalColFr) * availW);
  const rowHeights = rowSizes.map((s) => (s / totalRowFr) * availH);

  // Cumulative start offset of each track (0-indexed) inside the padded area.
  const colStarts = [0];
  for (let i = 1; i < cols; i++) colStarts.push(colStarts[i - 1] + colWidths[i - 1] + gap);

  const rowStarts = [0];
  for (let i = 1; i < rows; i++) rowStarts.push(rowStarts[i - 1] + rowHeights[i - 1] + gap);

  const rects = {};
  for (const region of regions) {
    const c0 = region.colStart - 1; // 0-indexed inclusive start
    const c1 = region.colEnd - 1;   // 0-indexed exclusive end
    const r0 = region.rowStart - 1;
    const r1 = region.rowEnd - 1;

    const x = padding + colStarts[c0];
    const y = padding + rowStarts[r0];

    let w = 0;
    for (let c = c0; c < c1; c++) {
      w += colWidths[c];
      if (c < c1 - 1) w += gap;
    }

    let h = 0;
    for (let r = r0; r < r1; r++) {
      h += rowHeights[r];
      if (r < r1 - 1) h += gap;
    }

    rects[region.id] = { x, y, w, h };
  }

  return rects;
}
