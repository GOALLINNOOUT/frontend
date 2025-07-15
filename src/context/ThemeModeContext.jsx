import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from 'react';
import { getTheme } from '../theme';
import { injectThemeCssVars } from '../themeCssVars';
import ThemeSystemChangeDialog from '../components/ThemeSystemChangeDialog';

const ThemeModeContext = createContext();

export function ThemeModeProvider({ children }) {
  // Detect system preference on mount
  const getSystemMode = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  // Always use system mode on first visit
  const [mode, setMode] = useState(getSystemMode());
  const [pendingSystemMode, setPendingSystemMode] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const timerRef = useRef();
  const theme = useMemo(() => getTheme(mode), [mode]);
  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  // No forced mode for new users

  // Listen for system mode changes, but wait 10 seconds before prompting
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setPendingSystemMode(e.matches ? 'dark' : 'light');
      timerRef.current = setTimeout(() => {
        setDialogOpen(true);
      }, 2000); // 2 seconds
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

  // If user accepts, switch mode
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
