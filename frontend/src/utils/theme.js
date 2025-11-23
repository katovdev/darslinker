// Theme management system

// Default theme settings
const defaultTheme = {
  mode: 'dark', // 'dark' or 'light'
  primaryColor: '#7ea2d4', // Project blue color
  fontFamily: 'system', // 'system', 'inter', 'roboto', 'poppins'
};

// Get current theme from localStorage
export function getTheme() {
  const savedTheme = localStorage.getItem('appTheme');
  if (savedTheme) {
    try {
      return JSON.parse(savedTheme);
    } catch (e) {
      return defaultTheme;
    }
  }
  return defaultTheme;
}

// Save theme to localStorage
export function saveTheme(theme) {
  localStorage.setItem('appTheme', JSON.stringify(theme));
  applyTheme(theme);
}

// Apply theme to document
export function applyTheme(theme) {
  const root = document.documentElement;
  const body = document.body;
  
  // Apply mode (dark/light) via body class
  if (theme.mode === 'light') {
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
  } else {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
  }
  
  // Apply primary color
  root.style.setProperty('--primary-color', theme.primaryColor);
  root.style.setProperty('--primary-color-rgb', hexToRgb(theme.primaryColor));
  root.style.setProperty('--primary-hover', `${theme.primaryColor}cc`);
  root.style.setProperty('--primary-light', hexToRgba(theme.primaryColor, 0.2));
  
  // Apply font family
  const fontFamilies = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    inter: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    roboto: '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
    poppins: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
  };
  
  body.style.fontFamily = fontFamilies[theme.fontFamily] || fontFamilies.system;
  
  // Trigger custom event for theme change
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '59, 130, 246'; // Default blue RGB
}

// Convert hex to RGBA
function hexToRgba(hex, alpha) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(59, 130, 246, ${alpha})`; // Default blue RGBA
}

// Initialize theme system
export function initTheme() {
  const theme = getTheme();
  applyTheme(theme);
}

// Preset colors
export const presetColors = [
  { name: 'Project Blue', value: '#7ea2d4' }, // Current project color
  { name: 'Red', value: '#b91c1c' },
  { name: 'Cream', value: '#d4c5a9' },
  { name: 'Teal', value: '#0f766e' },
  { name: 'Navy', value: '#1e3a8a' },
  { name: 'Pink', value: '#ffc0cb' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Gold', value: '#b8860b' },
];
