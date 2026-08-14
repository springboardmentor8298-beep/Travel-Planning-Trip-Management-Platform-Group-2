import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/**
 * ThemeProvider — manages dark/light mode.
 * Persists preference in localStorage.
 * Applies/removes the 'dark' class on <html> for both
 *   CSS-variable components and Tailwind darkMode: 'class'.
 */
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('tripnest-theme');
    if (saved) return saved === 'dark';
    // Default to dark (system preference fallback)
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('tripnest-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
