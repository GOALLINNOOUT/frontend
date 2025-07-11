/**
 * JC's Closet MUI Theme
 * Clean, scalable, and robust theme configuration for light/dark modes.
 */
import { createTheme } from '@mui/material/styles';

/**
 * Palette definitions for light and dark modes.
 * Extend or modify these objects to add more custom colors.
 */
const paletteLight = {
  mode: 'light',
  primary: {
    main: '#4A90E2', // Modern blue
    contrastText: '#fff',
  },
  secondary: {
    main: '#FFB6B9', // Soft pink accent
    contrastText: '#1C2A4D',
  },
  background: {
    default: '#F6F8FA', // Lighter, cleaner
    paper: '#FFFFFF',
    gradient: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ef 100%)',
  },
  text: {
    primary: '#1C2A4D',
    secondary: '#4A4A4A',
    disabled: '#B0B8C1',
  },
  info: { main: '#A3D8F4' },
  divider: '#E3E8EF',
  grey: {
    100: '#F8F9FB',
    200: '#F1F3F6',
    300: '#E3E8EF',
    400: '#C9D6DF',
    500: '#A0AEC0',
    600: '#718096',
    // Contact page custom colors
    contactBg: '#F6F8FA',
    contactPaper: '#FFFFFF',
    contactBoxShadow: '0 4px 32px 0 rgba(74,144,226,0.08)',
    contactFormShadow: '0 2px 12px 0 rgba(74,144,226,0.10)',
    contactPrimary: '#4A90E2',
    contactPrimaryHover: '#357ABD',
    contactPrimaryDisabled: '#B0B8C1',
    contactInputBorder: '#C9D6DF',
    contactInputFocus: '0 0 0 2px #4A90E255',
    contactSuccess: '#43a047',
    contactError: '#e53935',
    contactSubtitle: '#718096',
    contactInfo: '#4A4A4A',
    contactFooter: '#A0AEC0',
    contactButtonShadow: '0 2px 8px 0 rgba(74,144,226,0.10)',
    // Cart page custom colors
    cartBg: '#F6F8FA',
    cartPaper: '#FFFFFF',
    cartCard: '#F8F9FB',
    cartCardHover: '#E3F2FD',
    cartLabel: '#E3E8EF',
    cartShadow: '0 2px 12px 0 rgba(74,144,226,0.10)',
    cartThumbBorder: '#C9D6DF',
    cartThumbBorderActive: '#4A90E2',
    cartDialogClose: '#e53935',
    cartDialogCloseBg: '#F8F9FB',
    cartDialogCloseBgHover: '#E3E8EF',
    cartLoadingOverlay: 'rgba(246,248,250,0.7)',
  },
  productAnalytics: {
    blue: '#4fc3f7',
    green: '#66bb6a',
    yellow: '#ffe066',
    red: '#ff6b6b',
    purple: '#b39ddb',
    cyan: '#26c6da',
    sectionBg: '#F5F7FA',      // much lighter
    paperBg: '#FFFFFF',        // true white
    hoverBlue: '#E3F2FD',      // light blue hover
    hoverRed: '#FFEBEE',       // light red hover
    hoverYellow: '#FFF9E1',    // light yellow hover
    hoverPurple: '#F3E5F5',    // light purple hover
    alertOrange: '#FFF3E0',    // light orange
    stagnantGray: '#F0F1F3',   // light gray
  },
  customerAnalytics: {
    blue: '#1976d2',
    green: '#43a047',
    yellow: '#fbc02d',
    red: '#e53935',
    purple: '#8e24aa',
    cyan: '#00bcd4',
    lightBg: '#f5f7fa',
  },
  // Custom dashboard card and table colors for light mode
  cardUsersBg: '#fff3e3',
  cardUsersBorder: '#f9a825',
  cardLowstockBg: '#ffe3e3',
  cardLowstockBorder: '#d32f2f',
  cardLi: '#b71c1c',
  tableThBg: '#e3eafc',
  custom: {
    dialogBackdrop: 'rgba(0,0,0,0.18)',
    dialogBg: '#fff',
    dialogTitleDefault: '#222',
    dialogError: '#d32f2f',
    dialogSuccess: '#388e3c',
    dialogMessage: '#444',
    primaryBorder: '#1976d2',
    inputBorder: '#cbd5e1',
    inputBg: '#f8fafc',
    boxShadow: '#e0e7ef',
    suggestionBorder: '#f1f5f9',
    articleTitle: '#333',
    noArticlesText: '#666',
    dateText: '#999',
    expandedBtnBg: '#e3f2fd',
    expandedContentBg: '#f9f9f9',
    newsletterGradientBg: 'linear-gradient(120deg,#f7f6fa 60%,#fbe9f2 100%)',
    newsletterFormBg: '#faf7fb',
    newsletterTextFieldBg: '#fff',
    newsletterTableHeadBg: 'linear-gradient(90deg,#fbe9f2 0%,#f7f6fa 100%)',
    newsletterTableRowHover: '#fbe9f2',
    newsletterPaperShadow: '#e5e5e5',
    // AdminCustomers page colors
    customersInputBorder: '#b2d7ff',
    customersInputBg: '#f7faff',
    customersInputText: '#1a1a1a',
    customersSuggestionBg: '#fff',
    customersSuggestionBorder: '#e0e7ef',
    customersSuggestionText: '#222',
    customersSuggestionBorderBottom: '#f1f5f9',
    customersRowSuspendedBg: '#fff3f3',
    customersStatusSuspended: '#b71c1c',
    customersStatusActive: '#1976d2',
    customersEditBtnShadow: '#b2d7ff55',
  },
};

const paletteDark = {
  mode: 'dark',
  primary: {
    main: '#7BA3FF', // Vibrant blue
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FFB6B9', // Soft pink accent
    contrastText: '#232a3b',
  },
  background: {
    default: '#181C22',
    paper: '#232A3B',
    gradient: 'linear-gradient(120deg, #232a3b 60%, #181c22 100%)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B8C5D6',
    disabled: '#6B7785',
  },
  info: { main: '#4A7BFF' },
  divider: '#2C3E50',
  grey: {
    100: '#232A3B',
    200: '#2C3E50',
    300: '#34495E',
    400: '#3E5671',
    500: '#6B7785',
    600: '#B8C5D6',
    // Contact page custom colors
    contactBg: '#181C22',
    contactPaper: '#232A3B',
    contactBoxShadow: '0 4px 32px 0 rgba(74,123,255,0.10)',
    contactFormShadow: '0 2px 12px 0 rgba(74,123,255,0.12)',
    contactPrimary: '#7BA3FF',
    contactPrimaryHover: '#4A7BFF',
    contactPrimaryDisabled: '#3E5671',
    contactInputBorder: '#34495E',
    contactInputFocus: '0 0 0 2px #7BA3FF55',
    contactSuccess: '#43a047',
    contactError: '#ff6b6b',
    contactSubtitle: '#B8C5D6',
    contactInfo: '#B8C5D6',
    contactFooter: '#6B7785',
    contactButtonShadow: '0 2px 8px 0 rgba(74,123,255,0.10)',
    // Cart page custom colors
    cartBg: '#181C22',
    cartPaper: '#232A3B',
    cartCard: '#232A3B',
    cartCardHover: '#1e293b',
    cartLabel: '#34495E',
    cartShadow: '0 2px 12px 0 rgba(74,123,255,0.10)',
    cartThumbBorder: '#34495E',
    cartThumbBorderActive: '#7BA3FF',
    cartDialogClose: '#ff6b6b',
    cartDialogCloseBg: '#232A3B',
    cartDialogCloseBgHover: '#34495E',
    cartLoadingOverlay: 'rgba(24,28,34,0.7)',
  },
  styleGuideBg: 'linear-gradient(135deg,#232a3b 0%,#181c22 100%)',
  styleGuideCardBg: 'linear-gradient(135deg,#232a3b 0%,#181c22 100%)',
  styleGuideHeading: '#7ba3ff',
  styleGuideSubtitle: '#b8c5d6',
  styleGuidePaperBg: 'rgba(30,32,38,0.92)',
  styleGuideInputBg: '#232a3b',
  styleGuideInputFocus: '0 0 0 2px #7ba3ff55',
  styleGuideFormBorder: '#2c3e50',
  styleGuideSendBtn: '#4a7bff',
  styleGuideSendBtnHover: '#2563eb',
  styleGuideSendBtnShadow: '0 2px 8px rgba(74,123,255,0.18)',
  styleGuideInputShadow: '0 2px 8px rgba(74,123,255,0.10)',
  productAnalytics: {
    blue: '#4fc3f7',
    green: '#66bb6a',
    yellow: '#ffe066',
    red: '#ff6b6b',
    purple: '#b39ddb',
    cyan: '#26c6da',
    sectionBg: '#232a3b',
    paperBg: '#1A2332',
    hoverBlue: '#1e293b',
    hoverRed: '#3b1e1e',
    hoverYellow: '#3b2e1e',
    hoverPurple: '#2e1e3b',
    alertOrange: '#3b2e1e',
    stagnantGray: '#23272e',
  },
  customerAnalytics: {
    blue: '#1976d2',
    green: '#43a047',
    yellow: '#fbc02d',
    red: '#e53935',
    purple: '#8e24aa',
    cyan: '#00bcd4',
    lightBg: '#232a3b', // fallback for dark mode
  },
  // Custom dashboard card and table colors for dark mode
  cardUsersBg: '#2c2323', // deep brownish for users card
  cardUsersBorder: '#ffe066', // yellow accent for border
  cardLowstockBg: '#3b2323', // deep red-brown for low stock
  cardLowstockBorder: '#ff6b6b', // red accent for border
  cardLi: '#ff6b6b', // red for list items
  tableThBg: '#232a3b', // dark blue-gray for table header
  custom: {
    dialogBackdrop: 'rgba(0,0,0,0.48)',
    dialogBg: '#1A2332',
    dialogTitleDefault: '#fff',
    dialogError: '#ff6b6b',
    dialogSuccess: '#43a047',
    dialogMessage: '#B8C5D6',
    primaryBorder: '#1976d2',
    inputBorder: '#2C3E50',
    inputBg: '#232a3b',
    boxShadow: '#232a3b',
    suggestionBorder: '#34495E',
    articleTitle: '#fff',
    noArticlesText: '#B8C5D6',
    dateText: '#B8C5D6',
    expandedBtnBg: '#232a3b',
    expandedContentBg: '#232a3b',
    newsletterGradientBg: 'linear-gradient(120deg,#232a3b 60%,#181c22 100%)',
    newsletterFormBg: '#181c22',
    newsletterTextFieldBg: '#232a3b',
    newsletterTableHeadBg: 'linear-gradient(90deg,#232a3b 0%,#181c22 100%)',
    newsletterTableRowHover: '#232a3b',
    newsletterPaperShadow: '#181c22',
    // AdminCustomers page colors
    customersInputBorder: '#4A90E2',
    customersInputBg: '#232a3b',
    customersInputText: '#fff',
    customersSuggestionBg: '#181c22',
    customersSuggestionBorder: '#34495E',
    customersSuggestionText: '#fff',
    customersSuggestionBorderBottom: '#232a3b',
    customersRowSuspendedBg: '#3b2323',
    customersStatusSuspended: '#ff6b6b',
    customersStatusActive: '#7BA3FF',
    customersEditBtnShadow: '#4A90E255',
  },
};

/**
 * Returns the palette object for the given mode.
 * @param {'light'|'dark'} mode
 */
function getPalette(mode) {
  return mode === 'dark' ? paletteDark : paletteLight;
}

/**
 * Adds custom properties to the theme for easy access in useTheme().
 * @param {object} theme - The MUI theme object
 * @param {'light'|'dark'} mode
 */
function addCustomProperties(theme, mode) {
  theme.custom = {
    gradientBackground:
      mode === 'dark'
        ? 'linear-gradient(90deg, #0f1114 0%, #1a1d23 100%)'
        : 'linear-gradient(90deg, #f8fafc 0%, #e0e7ef 100%)',
  };
  return theme;
}

/**
 * Returns a configured MUI theme for the given mode.
 * @param {'light'|'dark'} mode
 */
export function getTheme(mode = 'light') {
  const theme = createTheme({
    palette: getPalette(mode),
    typography: {
      fontFamily: 'Montserrat, Arial, sans-serif',
      h1: { fontWeight: 700, color: mode === 'dark' ? '#FFFFFF' : '#1C2A4D' },
      h2: { fontWeight: 600, color: mode === 'dark' ? '#FFFFFF' : '#1C2A4D' },
      h3: { fontWeight: 500, color: mode === 'dark' ? '#FFFFFF' : '#1C2A4D' },
      body1: { fontSize: 16, color: mode === 'dark' ? '#B8C5D6' : '#4A4A4A' },
      body2: { fontSize: 14, color: mode === 'dark' ? '#6B7785' : '#6E6E6E' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 6 },
    shadows: [
      'none',
      mode === 'dark'
        ? '0px 2px 8px 0px rgba(0,0,0,0.3)'
        : '0px 2px 8px 0px rgba(28,42,77,0.04)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            boxShadow:
              mode === 'dark'
                ? '0px 2px 8px 0px rgba(0,0,0,0.3)'
                : '0px 2px 8px 0px rgba(28,42,77,0.04)',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: mode === 'dark' ? '#E8A8B5' : '#EECFD4',
              color: mode === 'dark' ? '#1A2332' : '#1C2A4D',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
  return addCustomProperties(theme, mode);
}

// Default export: light theme for backward compatibility
const theme = getTheme('light');
export default theme;
export { getPalette };
