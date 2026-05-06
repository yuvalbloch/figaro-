// Built-in palettes. Each is an ordered list of 8 hex colors.

export const PALETTE_DATA = {
  viridis: [
    '#440154',
    '#482878',
    '#3e4989',
    '#31688e',
    '#26828e',
    '#1f9e89',
    '#35b779',
    '#fde725',
  ],
  set2: [
    '#66c2a5',
    '#fc8d62',
    '#8da0cb',
    '#e78ac3',
    '#a6d854',
    '#ffd92f',
    '#e5c494',
    '#b3b3b3',
  ],
  tableau10: [
    '#4e79a7',
    '#f28e2b',
    '#e15759',
    '#76b7b2',
    '#59a14f',
    '#edc948',
    '#b07aa1',
    '#ff9da7',
  ],
  grayscale: [
    '#111827',
    '#374151',
    '#4b5563',
    '#6b7280',
    '#9ca3af',
    '#d1d5db',
    '#e5e7eb',
    '#f3f4f6',
  ],
};

export function getPalette(name, customPalette) {
  if (name === 'custom') return customPalette || PALETTE_DATA.tableau10;
  return PALETTE_DATA[name] || PALETTE_DATA.tableau10;
}
