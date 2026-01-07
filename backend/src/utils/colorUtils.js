/**
 * Utility functions for color generation and manipulation
 */

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color without #
 * @returns {Object} RGB values
 */
export function hexToRgb(hex) {
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Convert RGB to hex color
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color with #
 */
export function rgbToHex(r, g, b) {
  return `#${[r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
}

/**
 * Darken a hex color by reducing RGB values
 * @param {string} hex - Hex color without #
 * @param {number} factor - Darkening factor (0-1)
 * @returns {string} Darkened hex color with #
 */
export function darken(hex, factor) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * factor, g * factor, b * factor);
}

/**
 * Lighten a hex color by increasing RGB values towards white
 * @param {string} hex - Hex color without #
 * @param {number} factor - Lightening factor (0-1)
 * @returns {string} Lightened hex color with #
 */
export function lighten(hex, factor) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * factor, g + (255 - g) * factor, b + (255 - b) * factor);
}

/**
 * Check if a theme is light (white/very light colors)
 * @param {string} themeHex - Hex color without # (or with #)
 * @returns {boolean} True if light theme
 */
export function isLightTheme(themeHex) {
  const hex = themeHex.replace('#', '').toLowerCase();
  if (hex === 'ffffff' || hex === 'fff') return true;
  
  if (hex.length >= 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return r > 240 && g > 240 && b > 240;
  }
  return false;
}

/**
 * Check if a background color is light (for card generation)
 * @param {string} bgColor - Background color (with or without #)
 * @returns {boolean} True if light background
 */
export function isLightBackground(bgColor) {
  if (!bgColor) return false;
  const color = bgColor.toLowerCase().trim();
  if (color === '#ffffff' || color === '#fff' || color === 'ffffff' || color === 'fff') {
    return true;
  }
  
  if (color.startsWith('#') && color.length >= 7) {
    const hex = color.substring(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return !isNaN(r) && !isNaN(g) && !isNaN(b) && r > 240 && g > 240 && b > 240;
  }
  
  return false;
}

/**
 * Generate color scheme from theme hex color
 * @param {string} themeHex - Hex color without #
 * @returns {Object} Color scheme object
 */
export function generateColorsFromTheme(themeHex) {
  const colors = {};
  const themeColor = `#${themeHex}`;
  
  if (isLightTheme(themeHex)) {
    // Light theme: white/light background with dark text
    colors.background = '#ffffff';
    colors.backgroundGradient = '#f8f9fa';
    colors.border = '#e1e4e8';
    colors.text = '#24292e';
    colors.dateText = '#586069';
    colors.accent = '#0366d6';
    colors.avatarBorder = '#24292e';
    colors.totalCommits = '#24292e';
    colors.currentStreak = '#f97316';
    colors.longestStreak = '#24292e';
    colors.divider = '#e1e4e8';
  } else {
    // Dark theme: dark background with light text
    colors.background = darken(themeHex, 0.12);
    colors.backgroundGradient = darken(themeHex, 0.18);
    colors.border = darken(themeHex, 0.35);
    colors.text = lighten(themeHex, 0.85);
    colors.accent = themeColor;
    colors.avatarBorder = themeColor;
    colors.totalCommits = themeColor;
    colors.currentStreak = lighten(themeHex, 0.85);
    colors.longestStreak = lighten(themeHex, 0.85);
  }
  
  return colors;
}
