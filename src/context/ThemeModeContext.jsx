import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from 'react';
import { getTheme } from '../theme';
import { injectThemeCssVars } from '../themeCssVars';
import ThemeSystemChangeDialog from '../components/ThemeSystemChangeDialog';

const ThemeModeContext = createContext();

export function ThemeModeProvider({ children }) {
  // Detect system preference on mount
  const getSystemMode = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  // Check if user is new (no theme flag in localStorage)
  const isNewUser = !localStorage.getItem('jccloset_theme_firstvisit');
  const [forceLight, setForceLight] = useState(isNewUser);
  const [mode, setMode] = useState(isNewUser ? 'light' : getSystemMode());
  const [pendingSystemMode, setPendingSystemMode] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const timerRef = useRef();
  const theme = useMemo(() => getTheme(mode), [mode]);
  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  // For new users, force light mode for 30 seconds, then allow normal logic
  useEffect(() => {
    if (isNewUser) {
      const timeout = setTimeout(() => {
        setForceLight(false);
        localStorage.setItem('jccloset_theme_firstvisit', '1');
        setMode(getSystemMode());
      }, 30000); // 30 seconds
      return () => clearTimeout(timeout);
    }
  }, [isNewUser]);

  // Listen for system mode changes, but wait 10 seconds before prompting
  useEffect(() => {
    if (forceLight) return; // Don't allow system changes during forced light
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setPendingSystemMode(e.matches ? 'dark' : 'light');
      timerRef.current = setTimeout(() => {
        setDialogOpen(true);
      }, 10000); // 10 seconds
    };
    mq.addEventListener('change', handleChange);
    return () => {
      mq.removeEventListener('change', handleChange);
      clearTimeout(timerRef.current);
    };
  }, [forceLight]);

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
