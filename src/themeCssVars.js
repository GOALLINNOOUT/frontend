// themeCssVars.js
// Utility to inject theme CSS variables for light/dark mode
import { getPalette } from './theme';

export function injectThemeCssVars(mode = 'light') {
  const palette = getPalette(mode);
  const root = document.documentElement;
  // Map theme palette to CSS variables
  root.style.setProperty('--color-bg', palette.background.default);
  root.style.setProperty('--color-paper', palette.background.paper);
  root.style.setProperty('--color-primary', palette.customerAnalytics.blue);
  root.style.setProperty('--color-accent', palette.customerAnalytics.green);
  root.style.setProperty('--color-text', palette.text.primary);
  root.style.setProperty('--color-label', palette.customerAnalytics.blue);
  root.style.setProperty('--color-input-bg', palette.grey[100] || '#f7faff');
  root.style.setProperty('--color-input-border', palette.customerAnalytics.blue);
  root.style.setProperty('--color-input-focus', palette.customerAnalytics.blue);
  root.style.setProperty('--color-btn-bg', palette.customerAnalytics.blue);
  root.style.setProperty('--color-btn-bg2', palette.customerAnalytics.green);
  root.style.setProperty('--color-btn-hover-bg', palette.customerAnalytics.green);
  root.style.setProperty('--color-btn-hover-bg2', palette.customerAnalytics.blue);
  root.style.setProperty('--color-btn-active', palette.primary.main);
  root.style.setProperty('--color-table-header', palette.customerAnalytics.blue);
  root.style.setProperty('--color-table-bg', palette.background.paper);
  root.style.setProperty('--color-table-row-hover', palette.productAnalytics.hoverBlue || '#f0f7ff');
  root.style.setProperty('--color-card-bg', palette.grey[100] || '#f7f9fa');
  root.style.setProperty('--color-card-sales-bg', palette.productAnalytics.sectionBg || '#e3ffe6');
  root.style.setProperty('--color-card-sales-border', palette.customerAnalytics.green);
  root.style.setProperty('--color-card-orders-bg', palette.productAnalytics.hoverBlue || '#e3f0ff');
  root.style.setProperty('--color-card-orders-border', palette.customerAnalytics.blue);
  root.style.setProperty('--color-card-users-bg', palette.cardUsersBg || '#fff3e3');
  root.style.setProperty('--color-card-users-border', palette.cardUsersBorder || '#f9a825');
  root.style.setProperty('--color-card-lowstock-bg', palette.cardLowstockBg || '#ffe3e3');
  root.style.setProperty('--color-card-lowstock-border', palette.cardLowstockBorder || '#d32f2f');
  root.style.setProperty('--color-card-title', palette.text.primary);
  root.style.setProperty('--color-card-li', palette.cardLi || '#b71c1c');
  root.style.setProperty('--color-table-th-bg', palette.tableThBg || '#e3eafc');
  root.style.setProperty('--color-table-th-border', palette.customerAnalytics.blue);
  root.style.setProperty('--color-table-td-status-bg', 'linear-gradient(90deg, '+palette.customerAnalytics.green+' 0%, '+palette.customerAnalytics.blue+' 100%)');
  root.style.setProperty('--color-table-td-status-color', '#fff');
}
