// Geometry helpers for canvas + grid math.
// Filled in as layout features land in Phase 2.

export function unitToPx(value, units, dpi = 96) {
  switch (units) {
    case 'mm':
      return (value / 25.4) * dpi;
    case 'in':
      return value * dpi;
    case 'px':
    default:
      return value;
  }
}
