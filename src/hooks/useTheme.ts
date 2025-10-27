import { useCustomTheme } from '../context/ThemeContext';

// Re-export for easier importing
export { useCustomTheme as useTheme };

// Additional theme-related hooks can be added here
export const useThemeMode = () => {
  const { darkMode } = useCustomTheme();
  return darkMode ? 'dark' : 'light';
};