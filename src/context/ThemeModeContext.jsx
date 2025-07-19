import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from 'react';
import { getTheme } from '../theme';
import { injectThemeCssVars } from '../themeCssVars';
import ThemeSystemChangeDialog from '../components/ThemeSystemChangeDialog';

const ThemeModeContext = createContext();


export function ThemeModeProvider({ children }) {
  // Detect system preference
  const getSystemMode = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  // Get saved mode from localStorage
  const getSavedMode = () => {
    try {
      return localStorage.getItem('jc_theme_mode');
    } catch {
      return null;
    }
  };

  // On mount, use saved mode if exists, else system mode
  const [mode, setModeState] = useState(() => getSavedMode() || getSystemMode());
  const [pendingSystemMode, setPendingSystemMode] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const timerRef = useRef();
  const theme = useMemo(() => getTheme(mode), [mode]);

  // Save mode to localStorage and update state
  const setMode = (newMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem('jc_theme_mode', newMode);
    } catch {}
  };

  const toggleMode = () => setMode(mode === 'light' ? 'dark' : 'light');

  // Listen for system mode changes, but only prompt if user hasn't set a preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only prompt if user hasn't set a preference
      if (!getSavedMode()) {
        setPendingSystemMode(e.matches ? 'dark' : 'light');
        timerRef.current = setTimeout(() => {
          setDialogOpen(true);
        }, 2000); // 2 seconds
      }
    };
    mq.addEventListener('change', handleChange);
    return () => {
      mq.removeEventListener('change', handleChange);
      clearTimeout(timerRef.current);
    };
  }, []);

  // Update CSS variables whenever mode changes
  useEffect(() => {
    injectThemeCssVars(mode);
  }, [mode]);

  // If user accepts system change, update mode and save
  const handleAccept = () => {
    setMode(pendingSystemMode);
    setDialogOpen(false);
    setPendingSystemMode(null);
  };
  // If user cancels, just close dialog and ignore system change
  const handleCancel = () => {
    setDialogOpen(false);
    setPendingSystemMode(null);
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode, theme }}>
      {children}
      <ThemeSystemChangeDialog
        open={dialogOpen}
        systemMode={pendingSystemMode}
        onAccept={handleAccept}
        onCancel={handleCancel}
      />
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
