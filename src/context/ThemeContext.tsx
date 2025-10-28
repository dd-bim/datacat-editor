import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    // Load saved dark mode preference from localStorage or use default
    const saved = localStorage.getItem('datacat-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
    localStorage.setItem('datacat-dark-mode', JSON.stringify(value));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Update localStorage whenever darkMode changes
  useEffect(() => {
    localStorage.setItem('datacat-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const contextValue: ThemeContextType = {
    darkMode,
    toggleDarkMode,
    setDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useCustomTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
};