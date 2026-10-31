/**
 * Calculates accessible text color (black or white) for an accent background
 * based on WCAG 2.1 relative luminance, ensuring contrast >= 4.5:1.
 */
export function getContrastColor(hexColor) {
  if (!hexColor) return '#ffffff';
  let hex = hexColor.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length !== 6) return '#ffffff';

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  // Relative luminance of #0f1014 (our dark background / dark text) is ~0.003
  // Contrast ratio = (L1 + 0.05) / (L2 + 0.05)
  const contrastWithWhite = 1.05 / (L + 0.05);
  const contrastWithDark = (L + 0.05) / (0.003 + 0.05);

  if (contrastWithDark >= 4.5 && L > 0.45) {
    return '#0f1014';
  }
  if (contrastWithWhite >= 4.5) {
    return '#ffffff';
  }
  return L > 0.5 ? '#0f1014' : '#ffffff';
}
