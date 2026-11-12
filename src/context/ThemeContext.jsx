import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'sigap-theme';

function getInitialTheme() {
  try {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
  } catch (error) {
    console.warn('Tema belum dapat dibaca dari penyimpanan browser.', error);
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!preference) return undefined;

    const syncSystemTheme = (event) => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch (error) {
        console.warn('Preferensi tema browser tidak dapat diperiksa.', error);
      }
      setTheme(event.matches ? 'dark' : 'light');
    };

    preference.addEventListener('change', syncSystemTheme);
    return () => preference.removeEventListener('change', syncSystemTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch (error) {
        console.warn('Pilihan tema tidak dapat disimpan di browser ini.', error);
      }
      return nextTheme;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme harus digunakan di dalam ThemeProvider.');
  return context;
}
