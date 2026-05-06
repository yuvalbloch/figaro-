import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import { toSvg } from './toSvg';
import { canvasSizePx, pxToMm } from './geometry';

// Build a temporary, off-screen SVG DOM element from a string.
function parseSvgString(svgStr) {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-99999px;top:-99999px;visibility:hidden;';
  container.innerHTML = svgStr;
  document.body.appendChild(container);
  return { el: container.querySelector('svg'), container };
}

export async function toPdf(state) {
  const { canvas } = state;
  const { w: widthPx, h: heightPx } = canvasSizePx(canvas);

  let wMm, hMm;
  if (canvas.units === 'mm') {
    wMm = canvas.width; hMm = canvas.height;
  } else if (canvas.units === 'in') {
    wMm = canvas.width * 25.4; hMm = canvas.height * 25.4;
  } else {
    wMm = pxToMm(widthPx); hMm = pxToMm(heightPx);
  }

  // Use PNG plot images inside the SVG so svg2pdf handles them cleanly.
  const svgStr = await toSvg(state, { plotFormat: 'png' });

  const { el: svgEl, container } = parseSvgString(svgStr);

  const doc = new jsPDF({
    orientation: wMm >= hMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [wMm, hMm],
    compress: true,
  });

  try {
    await svg2pdf(svgEl, doc, { x: 0, y: 0, width: wMm, height: hMm });
  } finally {
    document.body.removeChild(container);
  }

  return doc.output('blob');
}
