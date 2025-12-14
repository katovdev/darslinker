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
    
    // Force update background for immediate effect
    body.style.background = '#f8f9fa';
    
    // Update header backgrounds
    const headers = document.querySelectorAll('.mobile-header, .desktop-header, .figma-header');
    headers.forEach(header => {
      header.style.background = '#ffffff';
      header.style.borderBottomColor = theme.primaryColor;
    });
    
    // Update all card borders to primary color in light mode
    const elementsWithBorders = document.querySelectorAll('[style*="border"]');
    elementsWithBorders.forEach(element => {
      const style = element.getAttribute('style');
      if (style && style.includes('rgba(126, 162, 212')) {
        const newStyle = style.replace(/rgba\(126,\s*162,\s*212,\s*[\d.]+\)/g, theme.primaryColor);
        element.setAttribute('style', newStyle);
      }
    });
  } else {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
    
    // Force update background for immediate effect
    body.style.background = '#232323';
    
    // Update header backgrounds
    const headers = document.querySelectorAll('.mobile-header, .desktop-header, .figma-header');
    headers.forEach(header => {
      header.style.background = '#1a1a1a';
      header.style.borderBottomColor = '#333';
    });
    
    // Keep original border colors in dark mode
    const elementsWithBorders = document.querySelectorAll('[style*="border"]');
    elementsWithBorders.forEach(element => {
      const style = element.getAttribute('style');
      if (style && !style.includes('rgba(126, 162, 212')) {
        // Restore original border colors if they were changed
        const newStyle = style.replace(new RegExp(theme.primaryColor, 'g'), 'rgba(126, 162, 212, 0.2)');
        element.setAttribute('style', newStyle);
      }
    });
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

// Apply primary color only
export function applyPrimaryColor(color) {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', color);
  root.style.setProperty('--primary-color-rgb', hexToRgb(color));
  root.style.setProperty('--primary-hover', `${color}cc`);
  root.style.setProperty('--primary-light', hexToRgba(color, 0.2));
  root.style.setProperty('--primary-light-hover', hexToRgba(color, 0.3));
  root.style.setProperty('--primary-border', hexToRgba(color, 0.3));
  root.style.setProperty('--primary-border-hover', hexToRgba(color, 0.5));
  root.style.setProperty('--primary-shadow', hexToRgba(color, 0.3));
  
  // Save to localStorage
  localStorage.setItem('primaryColor', color);
}

// Initialize theme system
export function initTheme() {
  const theme = getTheme();
  applyTheme(theme);
}

// Preset colors
export const presetColors = [
  { name: 'Project Blue', value: '#7ea2d4' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Navy', value: '#1e40af' },
  { name: 'Cream', value: '#d4c5a9' },
  { name: 'Gold', value: '#d4af37' },
];
