// Built-in themes. Themes set defaults for new plots and the canvas — every
// plot can override individual style fields.

export const THEME_DATA = {
  lightMinimal: {
    name: 'lightMinimal',
    label: 'Light Minimal',
    background: '#ffffff',
    text: '#111827',
    gridline: '#f3f4f6',
    axisLine: '#d1d5db',
    fontFamily: 'Inter',
    baseFontSize: 12,
    showGridDefault: false,
  },
  darkMinimal: {
    name: 'darkMinimal',
    label: 'Dark Minimal',
    background: '#0b0f17',
    text: '#e5e7eb',
    gridline: '#1f2937',
    axisLine: '#374151',
    fontFamily: 'Inter',
    baseFontSize: 12,
    showGridDefault: false,
  },
  publication: {
    name: 'publication',
    label: 'Publication',
    background: '#ffffff',
    text: '#000000',
    gridline: '#e5e7eb',
    axisLine: '#000000',
    fontFamily: 'Merriweather',
    baseFontSize: 11,
    showGridDefault: false,
  },
};

export function getTheme(name) {
  return THEME_DATA[name] || THEME_DATA.lightMinimal;
}
