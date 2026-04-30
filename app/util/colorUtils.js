/* eslint no-bitwise: ["error", { "allow": [">>", "&", "|", "<<"] }] */
// eslint-disable-next-line
export function LightenDarkenColor(color, amt) {
  /* https://css-tricks.com/snippets/javascript/lighten-darken-color/ */

  let col = color;
  let usePound = false;

  if (col[0] === '#') {
    col = col.slice(1);
    usePound = true;
  }

  const num = parseInt(col, 16);

  let r = (num >> 16) + amt;

  if (r > 255) {
    r = 255;
  } else if (r < 0) {
    r = 0;
  }

  let b = ((num >> 8) & 0x00ff) + amt;

  if (b > 255) {
    b = 255;
  } else if (b < 0) {
    b = 0;
  }

  let g = (num & 0x0000ff) + amt;

  if (g > 255) {
    g = 255;
  } else if (g < 0) {
    g = 0;
  }

  return (
    (usePound ? '#' : '') +
    String(`000000${(g | (b << 8) | (r << 16)).toString(16)}`).slice(-6)
  );
}

/* map extended route mode to color */
export function getModeIconColor(config, mode) {
  return config.colors[mode.toLowerCase()] || config.colors.primary;
}

const toLinear = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/**
 * Calculates the relative luminance of a hex color per WCAG 2.1.
 * @param {string} hex - Hex color string with or without leading #, 3- or 6-digit
 * @returns {number} Relative luminance in [0, 1]
 */
function getRelativeLuminance(hex) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// $black from SCSS theme — used as fallback for inaccessible colors
const ACCESSIBLE_COLOR_FALLBACK = '#333';

/**
 * Returns the color if its contrast ratio against a white background meets the
 * WCAG AA threshold; otherwise returns the fallback color (#333 = $black).
 *
 * @param {string} color - Hex color to test (with or without #)
 * @param {string} [fallback='#333'] - Fallback color when contrast is insufficient
 * @param {number} [threshold=4.5] - Minimum contrast ratio (4.5 = WCAG AA normal text)
 * @returns {string} An accessible color
 */
export function ensureColorAccessibleOnWhite(
  color,
  fallback = ACCESSIBLE_COLOR_FALLBACK,
  threshold = 4.5,
) {
  if (!color) {
    return fallback;
  }
  const luminance = getRelativeLuminance(color);
  // Contrast ratio against white (luminance = 1): (1 + 0.05) / (L + 0.05)
  const contrast = 1.05 / (luminance + 0.05);
  return contrast >= threshold ? color : fallback;
}
